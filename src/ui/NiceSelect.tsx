// src/ui/NiceSelect.tsx
import React from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";

export type NiceSelectOption = { value: string; label: React.ReactNode };

type Props = {
  value?: string;
  onChange: (v: string) => void;
  options: NiceSelectOption[];
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  /** скільки рядків видно без скролу */
  maxVisible?: number;
};

/* ========= Non-shifting scroll lock =========
   Не чіпаємо body.overflow — блокуємо wheel/touch/keys поза меню.
   Смуга прокрутки лишається → лейаут не «стрибає». */
type Guard = (e: Event) => void;
let wheelGuard: Guard | null = null;
let touchGuard: Guard | null = null;
let keyGuard: ((e: KeyboardEvent) => void) | null = null;

const lockBodyScroll = (getAllowedRoot?: () => HTMLElement | null) => {
  const guard: Guard = (e) => {
    const allowRoot = getAllowedRoot?.();
    if (allowRoot && allowRoot.contains(e.target as Node)) return; // скролимо лише в меню
    e.preventDefault(); // блокуємо скрол сторінки
  };

  wheelGuard = guard;
  touchGuard = guard;

  window.addEventListener("wheel", wheelGuard, { passive: false, capture: true });
  window.addEventListener("touchmove", touchGuard, { passive: false, capture: true });

  keyGuard = (e: KeyboardEvent) => {
    const t = e.target as HTMLElement | null;
    const isTyping =
      t &&
      (t.tagName === "INPUT" ||
        t.tagName === "TEXTAREA" ||
        (t as any).isContentEditable);
    if (isTyping) return;

    // клавіші, що скролять документ
    const keys = [" ", "PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown"];
    if (keys.includes(e.key)) {
      const allowRoot = getAllowedRoot?.();
      if (allowRoot && allowRoot.contains(document.activeElement)) return;
      e.preventDefault();
    }
  };
  window.addEventListener("keydown", keyGuard, { capture: true });
};

const unlockBodyScroll = () => {
  if (wheelGuard) window.removeEventListener("wheel", wheelGuard, true);
  if (touchGuard) window.removeEventListener("touchmove", touchGuard, true);
  if (keyGuard) window.removeEventListener("keydown", keyGuard, true);
  wheelGuard = touchGuard = keyGuard = null;
};
/* =========================================== */

const NiceSelect: React.FC<Props> = ({
  value,
  onChange,
  options,
  placeholder = "—",
  ariaLabel,
  className,
  disabled,
  maxVisible = 6,
}) => {
  const [open, setOpen] = React.useState(false);
  const [menuStyle, setMenuStyle] = React.useState<React.CSSProperties | null>(null);
  const [hoverIndex, setHoverIndex] = React.useState<number>(() =>
    Math.max(0, options.findIndex((o) => o.value === value))
  );

  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const menuRef = React.useRef<HTMLDivElement | null>(null);

  const selected = options.find((o) => o.value === value);

  const precomputeInitialStyle = React.useCallback((): React.CSSProperties | null => {
    const tr = triggerRef.current;
    if (!tr) return null;
    const r = tr.getBoundingClientRect();
    const width = Math.max(r.width, 180);
    const rowH = 40;
    const maxH = Math.max(200, maxVisible * rowH);

    // Перше наближення: під кнопкою, в межах екрана по X.
    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);
    const top = r.bottom + 8;

    return {
      position: "fixed",
      top,
      left,
      width,
      maxHeight: maxH,
      transformOrigin: "top",
    } as React.CSSProperties;
  }, [maxVisible]);

  // точне позиціонування вже по реальній висоті меню
  const computePosition = React.useCallback(() => {
    if (!triggerRef.current || !menuRef.current) return;
    const r = triggerRef.current.getBoundingClientRect();
    const menu = menuRef.current;

    const width = Math.max(r.width, 180);
    const rowH = 40;
    const maxH = Math.max(200, maxVisible * rowH);

    // тимчасово «увімкнемо» для вимірювання
    const prev = {
      vis: menu.style.visibility,
      disp: menu.style.display,
      pos: menu.style.position,
    };
    menu.style.visibility = "hidden";
    menu.style.display = "block";
    menu.style.position = "fixed";
    menu.style.width = `${width}px`;
    menu.style.maxHeight = `${maxH}px`;
    menu.style.left = `${r.left}px`;
    menu.style.top = `${r.bottom + 8}px`;

    const menuRect = menu.getBoundingClientRect();

    const spaceBottom = window.innerHeight - r.bottom - 8;
    const spaceTop = r.top - 8;

    let top = r.bottom + 8;
    let transformOrigin: React.CSSProperties["transformOrigin"] = "top";
    if (menuRect.height > spaceBottom && spaceTop > spaceBottom) {
      top = Math.max(8, r.top - menuRect.height - 8);
      transformOrigin = "bottom";
    }

    const left = Math.min(Math.max(8, r.left), window.innerWidth - width - 8);

    setMenuStyle({
      position: "fixed",
      top,
      left,
      width,
      maxHeight: maxH,
      transformOrigin,
    });

    // відкат тимчасових стилів
    menu.style.visibility = prev.vis;
    menu.style.display = prev.disp;
    menu.style.position = prev.pos;
  }, [maxVisible]);

  // відкрити: спочатку обчислюємо стартові стилі → потім відкриваємо
  const openMenu = React.useCallback(() => {
    if (disabled) return;
    const initial = precomputeInitialStyle();
    setMenuStyle(initial); // ← вже є top/left/width на перший кадр
    setOpen(true);
    lockBodyScroll(() => menuRef.current);
    // після монту уточнюємо
    requestAnimationFrame(() => {
      computePosition();
      setTimeout(() => computePosition(), 0);
    });
  }, [computePosition, disabled, precomputeInitialStyle]);

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    unlockBodyScroll();
  }, []);

  // прибрати блокування при анмаунті (на всяк випадок)
  React.useEffect(() => () => unlockBodyScroll(), []);

  // обробники під час відкриття
  React.useEffect(() => {
    if (!open) return;

    const onDocMousedown = (e: MouseEvent) => {
      const tr = triggerRef.current;
      const m = menuRef.current;
      if (!tr || !m) return;
      if (tr.contains(e.target as Node) || m.contains(e.target as Node)) return;
      closeMenu();
    };
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") return closeMenu();
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHoverIndex((i) => Math.min(options.length - 1, i + 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHoverIndex((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        const opt = options[hoverIndex];
        if (opt) {
          onChange(opt.value);
          closeMenu();
        }
      }
    };
    const onResize = () => computePosition();
    const onScroll = (e: Event) => {
      const m = menuRef.current;
      if (m && (e.target === m || m.contains(e.target as Node))) return;
      computePosition();
    };

    document.addEventListener("mousedown", onDocMousedown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      document.removeEventListener("mousedown", onDocMousedown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, closeMenu, computePosition, options, hoverIndex, onChange]);

  // виставити hover на поточне значення при відкритті
  React.useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, options.findIndex((o) => o.value === value));
    setHoverIndex(idx);
  }, [open, value, options]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => (open ? closeMenu() : openMenu())}
        className={[
          "inline-flex items-center justify-between gap-2 rounded-xl px-3 py-2",
          "bg-transparent border border-[var(--border)]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
          "min-w-[180px]",
          disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer",
          className ?? "",
        ].join(" ")}
      >
        <span className="truncate">
          {selected ? (
            selected.label
          ) : (
            <span className="text-[var(--muted)]">{placeholder}</span>
          )}
        </span>
        <ChevronDown className="w-4 h-4 opacity-80 shrink-0" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[1000] pointer-events-none">
            <div
              ref={menuRef}
              role="listbox"
              // якщо раптом з якихось причин стилю ще нема — ховаємо, щоб не мигнуло в (0,0)
              style={menuStyle ?? { visibility: "hidden" }}
              className={[
                "pointer-events-auto",
                "rounded-xl shadow-lg border border-[var(--border)]",
                "bg-[var(--surface)]",
                "overflow-y-auto",
              ].join(" ")}
            >
              {options.map((o, i) => {
                const active = o.value === value;
                const hovered = i === hoverIndex;
                return (
                  <div
                    key={String(o.value)}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      onChange(o.value);
                      closeMenu();
                    }}
                    className={[
                      "px-4 py-2 cursor-pointer select-none",
                      active ? "bg-[var(--primary)]/15" : "",
                      hovered ? "bg-white/5" : "",
                    ].join(" ")}
                  >
                    {o.label}
                  </div>
                );
              })}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

export default NiceSelect;
