// src/components/FacultyScheduleTable.tsx
import React, { useEffect, useMemo, useState, useLayoutEffect } from "react";
import {
  fetchFacultySchedule,
  saveFacultySchedule,
  filterFacultyLessons,
  fetchTeachers,
  createScheduleSnapshot,
} from "@/lib/fakeApi/admin";
import type { FacultyLesson, Parity } from "@/types/schedule";
import type { Teacher } from "@/types/teachers";
import { useAuth } from "@/types/auth";
import {
  Pin,
  PinOff,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Edit2,
  Trash2,
  Check,
  X,
  Plus,
  Shuffle,
} from "lucide-react";
import { createPortal } from "react-dom";
import NiceSelect from "@/ui/NiceSelect";

/* ----- константи часу та днів (4 пари) ----- */
const TIMES: Record<1 | 2 | 3 | 4, { start: string; end: string }> = {
  1: { start: "08:30", end: "10:05" },
  2: { start: "10:25", end: "12:00" },
  3: { start: "12:10", end: "13:45" },
  4: { start: "14:00", end: "15:35" },
};
const DAYS: Record<1 | 2 | 3 | 4 | 5 | 6, string> = {
  1: "Пн",
  2: "Вт",
  3: "Ср",
  4: "Чт",
  5: "Пт",
  6: "Сб",
};
const WEEKDAYS: (1 | 2 | 3 | 4 | 5 | 6)[] = [1, 2, 3, 4, 5, 6];
const PAIRS: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

type Level = "bachelor" | "master";

/* ---------- дрібні утиліти ---------- */
const tmpId = () => `tmp-${Math.random().toString(36).slice(2, 9)}`;

/* ---------- кнопка пін/анпін ---------- */
const IconButton: React.FC<{
  active?: boolean;
  onClick: () => void;
  title: string;
}> = ({ active, onClick, title }) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={[
      "rounded-md p-1 transition",
      active
        ? "bg-[var(--surface-2)] ring-1 ring-[var(--border)] hover-lift"
        : "hover-lift hover:bg-[var(--surface-2)]",
    ].join(" ")}
  >
    {active ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
  </button>
);

/* ---------- трьохстановий тогл парності ---------- */
const ParityToggle: React.FC<{
  value: Parity;
  onChange: (p: Parity) => void;
}> = ({ value, onChange }) => {
  const Item: React.FC<{ v: Parity; label: string }> = ({ v, label }) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={[
        "px-2 py-1 rounded-2xl text-xs transition hover-lift",
        value === v
          ? "bg-[var(--surface-2)] ring-1 ring-[var(--border)]"
          : "hover:bg-[var(--surface-2)]/60",
      ].join(" ")}
      title={label}
    >
      {label}
    </button>
  );
  return (
    <div className="hover-lift inline-flex items-center gap-1 bg-[var(--surface)] rounded-2xl p-1 ring-1 ring-[var(--border)]">
      <Item v="any" label="довільний" />
      <Item v="odd" label="непарнтй" />
      <Item v="even" label="парний" />
    </div>
  );
};

// ——— Додати вгорі файлу (поруч із іншими дрібними компонентами) ———
const AddSlotButton: React.FC<{
  label: string;
  onClick: () => void;
  title?: string;
}> = ({ label, onClick, title }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    // ✅ гарантовано однакова ширина, але не ширше за колонку
    style={{ width: "min(280px, 100%)" }}
    className={[
      "block mx-auto", // центр
      "px-4 py-3 rounded-2xl", // форма
      "border-2 border-dashed border-[var(--border)]/70",
      "bg-[var(--surface)]/40 hover:bg-[var(--surface-2)]/60",
      "text-[var(--text)]/90",
      "flex items-center justify-center gap-2",
      "transition hover-lift focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
      "select-none",
    ].join(" ")}
  >
    <Plus className="h-4 w-4 opacity-80" />
    <span className="font-medium">{label}</span>
  </button>
);

/* ---------- картка пари (перегляд) ---------- */
const CellCard: React.FC<{
  lesson: FacultyLesson;
  dense?: boolean;
  onDragStart: (l: FacultyLesson | null) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
  onStartEdit: (l: FacultyLesson) => void;
  isDraft?: boolean;
  editable: boolean;
}> = ({
  lesson,
  dense,
  onDragStart,
  onTogglePin,
  onDelete,
  onStartEdit,
  isDraft,
  editable,
}) => (
  <div
    className={[
      "glasscard rounded-xl m-1 relative",
      dense ? "p-1.5 text-[12px]" : "p-2 text-sm",
      "flex flex-col gap-1",
      editable && !lesson.pinned
        ? "cursor-move hover-lift hover-shadow"
        : "opacity-90 cursor-default",
      !editable && lesson.pinned ? "ring-1 ring-primary/50" : "",
      isDraft ? "ring-1 ring-warning/60" : "",
    ].join(" ")}
    draggable={editable && !lesson.pinned}
    onDragStart={(e) => {
      if (!editable || lesson.pinned) return;
      // чіткий сигнал браузеру про перенос
      try {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.dropEffect = "move";
      } catch {}
      e.dataTransfer.setData("text/plain", lesson.id);
      onDragStart(lesson);
    }}
  >
    <div className="flex items-start gap-2">
      <div className="font-medium leading-tight">
        {lesson.subject || (
          <span className="text-[var(--muted)]">[без назви]</span>
        )}
      </div>
      <div className="ml-auto flex items-center gap-1">
        {editable && (
          <>
            <button
              className="hover-lift rounded-md p-1 hover:bg-[var(--surface-2)]"
              title="Редагувати"
              onClick={() => onStartEdit(lesson)}
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              className="hover-lift rounded-md p-1 hover:bg-[var(--surface-2)]"
              title="Видалити"
              onClick={() => onDelete(lesson.id)}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
        {editable ? (
          <IconButton
            active={!!lesson.pinned}
            title={lesson.pinned ? "Відкріпити пару" : "Закріпити пару"}
            onClick={() => onTogglePin(lesson.id)}
          />
        ) : (
          lesson.pinned && <Pin className="h-4 w-4 text-primary" />
        )}
      </div>
    </div>

    <div
      className={
        dense
          ? "text-[10px] text-[var(--muted)]"
          : "text-xs text-[var(--muted)]"
      }
    >
      {lesson.teacher && lesson.teacher.trim() ? (
        lesson.teacher
      ) : (
        <span className="text-[var(--muted)]">[викладач?]</span>
      )}
      {" · "}
      {lesson.location ?? "—"}
    </div>

    {lesson.parity !== "any" && (
      <div
        className={dense ? "text-[9px]" : "text-[10px]"}
        style={{ opacity: 0.75 }}
      >
        {lesson.parity === "even" ? "ПАРНИЙ" : "НЕПАРНИЙ"}
      </div>
    )}

    {isDraft && (
      <div className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--warning)]/15 text-[var(--warning)] ring-1 ring-[var(--warning)]/40">
        draft
      </div>
    )}
  </div>
);

/* ---------- порожня зона (для спадку сумісності) ---------- */

/* ---------- верхній ряд фільтрів ---------- */
const SelectorRow: React.FC<{
  level: Level;
  setLevel: (v: Level) => void;
  course: number;
  setCourse: (n: number) => void;
  parity: Parity;
  setParity: (p: Parity) => void;
  dense: boolean;
  setDense: (v: boolean) => void;
}> = ({
  level,
  setLevel,
  course,
  setCourse,
  parity,
  setParity,
  dense,
  setDense,
}) => (
  <div className="flex flex-wrap gap-3 mb-4 items-center">
    <NiceSelect
      ariaLabel="Рівень навчання"
      value={level}
      onChange={(v) => setLevel(v as Level)}
      options={[
        { value: "bachelor", label: "Бакалавр" },
        { value: "master", label: "Магістр" },
      ]}
    />

    <NiceSelect
      ariaLabel="Курс"
      value={String(course)}
      onChange={(v) => setCourse(Number(v))}
      options={(level === "bachelor" ? [1, 2, 3, 4] : [1, 2]).map((c) => ({
        value: String(c),
        label: `${c} курс`,
      }))}
    />

    <NiceSelect
      ariaLabel="Парність тижня"
      value={parity}
      onChange={(v) => setParity(v as Parity)}
      options={[
        { value: "any", label: "Будь-який тиждень" },
        { value: "even", label: "Парний" },
        { value: "odd", label: "Непарний" },
      ]}
    />

    <label className="inline-flex items-center gap-2 ml-auto text-sm cursor-pointer">
      <input
        type="checkbox"
        className="checkbox"
        checked={dense}
        onChange={(e) => setDense(e.target.checked)}
      />
      <Minimize2 className="h-4 w-4" /> Dense
    </label>
  </div>
);

const FacultyScheduleTable: React.FC<{
  editable: boolean;
  lessons?: FacultyLesson[]; // якщо передали — не фетчимо з fakeApi
}> = ({ editable, lessons }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const topScrollRef = React.useRef<HTMLDivElement>(null);
  const [scrollWidth, setScrollWidth] = useState(0);

  const { user } = useAuth();
  const [level, setLevel] = useState<Level>("bachelor");
  const [course, setCourse] = useState<number>(1);
  const [parity, setParity] = useState<Parity>("any");

  const [dense, setDense] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [allLessons, setAllLessons] = useState<FacultyLesson[]>([]);
  const [, setDragging] = useState<FacultyLesson | null>(null);
  const [saving, setSaving] = useState(false);

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBuf, setEditBuf] = useState<Partial<FacultyLesson>>({});
  const [draftIds, setDraftIds] = useState<Set<string>>(new Set());

  const [snapOpen, setSnapOpen] = useState(false);
  const [snapTitle, setSnapTitle] = useState("");
  const [snapComment, setSnapComment] = useState("");
  const [snapBusy, setSnapBusy] = useState(false);

  const sortGroups = (a: string, b: string) =>
    a.localeCompare(b, "uk", { numeric: true, sensitivity: "base" });

  /* ---------- DnD helpers ---------- */
  const allowDrop = (e: React.DragEvent) => {
    if (!editable) return;
    e.preventDefault();
    try {
      e.dataTransfer.dropEffect = "move";
    } catch {}
  };

  const handleConfirmSnapshot = async () => {
    if (!snapTitle.trim() || !snapComment.trim()) return;
    try {
      setSnapBusy(true);
      await saveAll(); // збереже у fakeApi твій “активний” стан
      await createScheduleSnapshot(
        snapTitle.trim(),
        snapComment.trim(),
        "both", // повна сітка
        user?.name ?? "Admin",
        allLessons // зберігаємо весь набір пар
      );
      setSnapOpen(false);
      setSnapTitle("");
      setSnapComment("");
    } finally {
      setSnapBusy(false);
    }
  };

  /* ---------- дані ---------- */
  useEffect(() => {
    if (lessons) {
      setAllLessons(lessons);
      return; // зовнішній режим: нічого не фетчимо
    }
    fetchFacultySchedule(level).then(setAllLessons);
  }, [level, lessons]);

  useEffect(() => {
    fetchTeachers().then(setTeachers);
  }, []);

  useEffect(() => {
    if (snapOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [snapOpen]);

  const viewLessons = useMemo(
    () => filterFacultyLessons({ lessons: allLessons, course, parity }),
    [allLessons, course, parity]
  );

  const allGroups = useMemo(() => {
    const set = new Set<string>();
    viewLessons.forEach((l) => {
      const g = (l.group ?? (l as any).speciality ?? "").toString().trim();
      if (g) set.add(g);
    });
    // 🔒 фіксуємо стабільний порядок колонок
    return Array.from(set).sort(sortGroups);
  }, [viewLessons]);

  const maxPage = Math.max(0, Math.ceil(allGroups.length / pageSize) - 1);
  useEffect(() => {
    if (page > maxPage) setPage(maxPage);
  }, [maxPage, page]);
  const groups = useMemo(
    () => allGroups.slice(page * pageSize, page * pageSize + pageSize),
    [allGroups, page, pageSize]
  );

  const byCell = useMemo(() => {
    const m = new Map<string, FacultyLesson[]>();
    viewLessons.forEach((l) => {
      const groupName = (l.group ?? (l as any).speciality ?? "").toString();
      const k = `${l.weekday}-${l.pair}-${groupName}`;
      const arr = m.get(k) ?? [];
      arr.push(l);
      m.set(k, arr);
    });
    return m;
  }, [viewLessons]);

  const getCell = (
    weekday: 1 | 2 | 3 | 4 | 5 | 6,
    pair: 1 | 2 | 3 | 4,
    group: string
  ) => byCell.get(`${weekday}-${pair}-${group}`) ?? [];

  /* ---------- редагування ---------- */
  const startEdit = (l: FacultyLesson) => {
    if (!editable) return;
    setEditingId(l.id);
    setEditBuf({ ...l });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditBuf({});
  };
  const commitEdit = () => {
    if (!editable || !editingId) return;
    setAllLessons((prev) =>
      prev.map((l) =>
        l.id === editingId ? ({ ...l, ...editBuf } as FacultyLesson) : l
      )
    );
    setEditingId(null);
    setEditBuf({});
  };

  const togglePin = (id: string) => {
    if (!editable) return;
    setAllLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, pinned: !l.pinned } : l))
    );
  };

  const deleteLesson = (id: string) => {
    if (!editable) return;
    setAllLessons((prev) => prev.filter((l) => l.id !== id));
    setDraftIds((prev) => {
      const n = new Set(prev);
      n.delete(id);
      return n;
    });
    if (editingId === id) cancelEdit();
  };

  const createDraftLesson = (opts: {
    weekday: 1 | 2 | 3 | 4 | 5 | 6;
    pair: 1 | 2 | 3 | 4;
    group: string;
    parity: Parity;
  }) => {
    if (!editable) return;
    const l: FacultyLesson = {
      id: tmpId(),
      weekday: opts.weekday,
      pair: opts.pair,
      parity: opts.parity,
      time: TIMES[opts.pair],
      course: course as 1 | 2 | 3 | 4,
      level,
      group: opts.group,
      subject: "",
      teacher: "",
      location: "",
      pinned: false,
    };
    setAllLessons((prev) => [...prev, l]);
    setDraftIds((prev) => new Set(prev).add(l.id));
    startEdit(l);
  };

  /* ---------- DnD ---------- */
  const moveLesson = (
    lessonId: string,
    to: { weekday: 1 | 2 | 3 | 4 | 5 | 6; pair: 1 | 2 | 3 | 4; group: string }
  ) => {
    if (!editable) return;
    setAllLessons((prev) => {
      const srcIdx = prev.findIndex((l) => l.id === lessonId);
      if (srcIdx < 0) return prev;
      if (prev[srcIdx].pinned) return prev;

      const targetIdx = prev.findIndex(
        (l) =>
          l.level === prev[srcIdx].level &&
          l.course === prev[srcIdx].course &&
          l.parity === prev[srcIdx].parity &&
          l.weekday === to.weekday &&
          l.pair === to.pair &&
          (l.group ?? (l as any).speciality) === to.group
      );

      const next = [...prev];
      const timeOf = (p: 1 | 2 | 3 | 4) => TIMES[p];

      if (targetIdx >= 0) {
        if (next[targetIdx].pinned) return prev;
        const a = next[srcIdx];
        const b = next[targetIdx];
        next[targetIdx] = {
          ...a,
          weekday: to.weekday,
          pair: to.pair,
          group: to.group,
          time: timeOf(to.pair),
        };
        next[srcIdx] = {
          ...b,
          weekday: a.weekday,
          pair: a.pair,
          group: (a.group ?? (a as any).speciality ?? "") as string,
          time: timeOf(a.pair),
        };
      } else {
        next[srcIdx] = {
          ...next[srcIdx],
          weekday: to.weekday,
          pair: to.pair,
          group: to.group,
          time: timeOf(to.pair),
        };
      }
      return next;
    });
  };

  const onDropToCell = (
    e: React.DragEvent,
    coords: {
      weekday: 1 | 2 | 3 | 4 | 5 | 6;
      pair: 1 | 2 | 3 | 4;
      group: string;
    }
  ) => {
    if (!editable) return;
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData("text/plain");
    if (id) moveLesson(id, coords);
    setDragging(null);
  };

  // drop на пусту зону з конкретизацією парності
  const dropIntoEmpty = (
    e: React.DragEvent,
    coords: {
      weekday: 1 | 2 | 3 | 4 | 5 | 6;
      pair: 1 | 2 | 3 | 4;
      group: string;
    },
    forceParity: Parity
  ) => {
    if (!editable) return;
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    moveLesson(id, coords);
    // після переміщення — виставляємо парність
    setAllLessons((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, parity: forceParity, time: TIMES[coords.pair] }
          : l
      )
    );
    setDragging(null);
  };

  /* ---------- збереження (з очисткою чернеток) ---------- */
  const saveAll = async () => {
    if (!editable) return;
    setSaving(true);

    // Видаляємо незаповнені чернетки (обов'язково потрібні subject і teacher)
    setAllLessons((prev) =>
      prev.filter((l) => {
        if (!draftIds.has(l.id)) return true;
        const ok = l.subject?.trim() && l.teacher?.trim();
        return !!ok;
      })
    );
    setDraftIds(new Set());

    await saveFacultySchedule(level, allLessons);
    setSaving(false);
  };

  /* ---------- синхронізація верхнього скролу ---------- */
  useEffect(() => {
    const main = scrollRef.current;
    const top = topScrollRef.current;
    if (!main || !top) return;

    const onMain = () => {
      top.scrollLeft = main.scrollLeft;
    };
    const onTop = () => {
      main.scrollLeft = top.scrollLeft;
    };

    main.addEventListener("scroll", onMain);
    top.addEventListener("scroll", onTop);

    const updateWidth = () => {
      if (main) setScrollWidth(main.scrollWidth);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);

    return () => {
      main.removeEventListener("scroll", onMain);
      top.removeEventListener("scroll", onTop);
      window.removeEventListener("resize", updateWidth);
    };
  }, [groups]);

  const [rowHeights, setRowHeights] = useState<
    Record<string, { odd: number; even: number }>
  >({});

  const baseHalfMin = dense ? 40 : 52; // мінімальна висота однієї половини
  const HALF_GAP_PX = 4;

  useLayoutEffect(() => {
  const raf = requestAnimationFrame(() => {
    // збираємо всі вузли з позначками половинок/any
    const nodes =
      scrollRef.current?.querySelectorAll<HTMLElement>('[data-row][data-half]');

    // тимчасова мапа «рядок -> макс. висоти»
    const tmp: Record<string, { odd: number; even: number; both?: number }> = {};

    nodes?.forEach((el) => {
      const row = el.dataset.row as string; // "weekday-pair"
      const half = el.dataset.half as "odd" | "even" | "both";
      const h = el.scrollHeight;

      const entry = tmp[row] ?? { odd: baseHalfMin, even: baseHalfMin };
      if (half === "odd" || half === "even") {
        entry[half] = Math.max(entry[half], h);
      } else {
        entry.both = Math.max(entry.both ?? 0, h);
      }
      tmp[row] = entry;
    });

    // якщо в рядку є картка any і вона вища за суму половинок,
    // «розкидуємо» надлишок між odd/even
    Object.values(tmp).forEach((v) => {
      if (v.both) {
        const sum = v.odd + v.even + HALF_GAP_PX;
        if (v.both > sum) {
          const extra = v.both - sum;
          v.odd += Math.ceil(extra / 2);
          v.even += Math.floor(extra / 2);
        }
      }
    });

    // у стан зберігаємо тільки odd/even
    const next: Record<string, { odd: number; even: number }> = {};
    Object.entries(tmp).forEach(([k, v]) => (next[k] = { odd: v.odd, even: v.even }));
    setRowHeights(next);
  });

  return () => cancelAnimationFrame(raf);
}, [viewLessons, groups, dense, editingId, baseHalfMin]);

  /* ---------- інлайн-редактор (вставляється замість картки) ---------- */
  const renderInlineEditor = () => (
    <div
      className={[
        "glasscard rounded-xl m-1",
        dense ? "p-1.5 text-[12px]" : "p-2 text-sm",
      ].join(" ")}
    >
      <div className="flex flex-col gap-2">
        <input
          className="input hover-lift"
          placeholder="Назва предмету"
          value={editBuf.subject ?? ""}
          onChange={(e) =>
            setEditBuf((prev) => ({ ...prev, subject: e.target.value }))
          }
        />
        <div className="flex gap-2">
          <NiceSelect
            className="flex-1"
            ariaLabel="Викладач"
            placeholder="Викладач"
            value={editBuf.teacher || undefined}
            onChange={(v) => setEditBuf((prev) => ({ ...prev, teacher: v }))}
            options={teachers.map((t) => ({ value: t.name, label: t.name }))}
          />
          <input
            className="input flex-1 hover-lift"
            placeholder="Аудиторія"
            value={editBuf.location ?? ""}
            onChange={(e) =>
              setEditBuf((prev) => ({ ...prev, location: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center gap-2">
          <ParityToggle
            value={(editBuf.parity as Parity) ?? "any"}
            onChange={(p) => setEditBuf((prev) => ({ ...prev, parity: p }))}
          />
          <div className="ml-auto flex items-center gap-1">
            <button
              className="btn hover-lift px-2 py-1 rounded-md"
              onClick={commitEdit}
              title="Застосувати"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              className="btn hover-lift px-2 py-1 rounded-md"
              onClick={cancelEdit}
              title="Скасувати"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ---------- розмітка ---------- */
  return (
    <div className="glasscard p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold text-lg">Розклад факультету</div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              className="btn px-2 py-2 rounded-xl"
              disabled={page <= 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-sm text-[var(--muted)] w-28 text-center">
              {page + 1} / {Math.max(1, maxPage + 1)}
            </div>
            <button
              className="btn px-2 py-2 rounded-xl"
              disabled={page >= maxPage}
              onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {editable && !lessons && (
            <button
              className="btn py-2 px-4 rounded-xl hover-shadow disabled:opacity-50"
              onClick={() => setSnapOpen(true)} // ← було: onClick={saveAll}
              disabled={saving}
              title={user?.id ? "Зберегти зміни" : "Потрібен користувач"}
            >
              {saving ? "Збереження…" : "Зберегти"}
            </button>
          )}
        </div>
      </div>

      <SelectorRow
        level={level}
        setLevel={setLevel}
        course={course}
        setCourse={setCourse}
        parity={parity}
        setParity={setParity}
        dense={dense}
        setDense={setDense}
      />

      {/* верхній скрол */}
      <div
        ref={topScrollRef}
        className="overflow-x-auto scrollbar-stable"
        style={{ height: 16 }}
      >
        <div style={{ width: scrollWidth, height: 1 }} />
      </div>

      <div
        ref={scrollRef}
        className="overflow-auto scrollarea scrollbar-stable sticky-left"
      >
        <table className="w-full rounded-xl text-sm relative p-4 border-separate border-spacing-0">
          <thead className="rounded-xl">
            <tr className="text-left">
              <th className="th-sticky th-day sticky-base">День</th>
              <th className="th-sticky th-pair sticky-base">Пара</th>
              <th className="th-sticky th-time sticky-base">Час</th>
              {groups.map((g) => (
                <th
                  key={g}
                  className="py-2 text-[var(--muted)] min-w-[220px] text-center"
                >
                  {g}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="rounded-xl">
            {WEEKDAYS.map((weekday) => (
              <React.Fragment key={weekday}>
                <tr>
                  <td colSpan={3 + groups.length} className="p-0">
                    <div className="dayline" />
                  </td>
                </tr>

                {PAIRS.map((pair, pairIdx) => (
                  <React.Fragment key={`${weekday}-${pair}`}>
                    <tr key={`${weekday}-${pair}`}>
                      {pairIdx === 0 && (
                        <td
                          className="td-sticky th-day sticky-base"
                          rowSpan={PAIRS.length}
                        >
                          {DAYS[weekday]}
                        </td>
                      )}

                      <td
                        className={`td-sticky th-pair sticky-base ${
                          pairIdx > 0 ? "pair-divider" : ""
                        }`}
                      >
                        {pair}
                      </td>

                      <td
                        className={`td-sticky th-time sticky-base ${
                          pairIdx > 0 ? "pair-divider" : ""
                        }`}
                      >
                        <div className="flex flex-col leading-tight">
                          <span>{TIMES[pair].start}</span>
                          <span className="text-[var(--muted)]">—</span>
                          <span>{TIMES[pair].end}</span>
                        </div>
                      </td>

                      {groups.map((group) => {
                        const items = getCell(
                          weekday as 1 | 2 | 3 | 4 | 5 | 6,
                          pair as 1 | 2 | 3 | 4,
                          group
                        );
                        const oddItems = items.filter(
                          (i) => i.parity === "odd"
                        );
                        const evenItems = items.filter(
                          (i) => i.parity === "even"
                        );
                        const anyItems = items.filter(
                          (i) => i.parity === "any"
                        );
                        const isEmpty = items.length === 0;

                        const dropToHalf = (
                          e: React.DragEvent,
                          half: "top" | "bottom"
                        ) => {
                          if (!editable) return;
                          e.preventDefault();
                          const id = e.dataTransfer.getData("text/plain");
                          if (!id) return;

                          const hasAny = anyItems[0];
                          if (hasAny) {
                            const draggedParity: Parity =
                              half === "top" ? "odd" : "even";
                            const anyTo: Parity =
                              half === "top" ? "even" : "odd";
                            setAllLessons((prev) =>
                              prev.map((l) => {
                                if (l.id === id)
                                  return {
                                    ...l,
                                    weekday,
                                    pair,
                                    group,
                                    time: TIMES[pair],
                                    parity: draggedParity,
                                  };
                                if (l.id === hasAny.id)
                                  return { ...l, parity: anyTo };
                                return l;
                              })
                            );
                            setDragging(null);
                            return;
                          }

                          // звичайний dnd у половину
                          const draggedParity: Parity =
                            half === "top" ? "odd" : "even";
                          moveLesson(id, { weekday, pair, group });
                          // якщо була any — конкретизуємо
                          setAllLessons((prev) =>
                            prev.map((l) =>
                              l.id === id ? { ...l, parity: draggedParity } : l
                            )
                          );
                          setDragging(null);
                        };

                        if (editable && isEmpty) {
                          // 100% порожня комірка: 3 кнопки однакового розміру,
                          // а висота блоку — під найбільшу «півклітинку» в рядку
                          const rowKey = `${weekday}-${pair}`;
                          const minOdd = rowHeights[rowKey]?.odd ?? baseHalfMin;
                          const minEven =
                            rowHeights[rowKey]?.even ?? baseHalfMin;
                          const totalMin = minOdd + minEven + HALF_GAP_PX;

                          return (
                            <td
                              key={group}
                              className={`py-2 align-top ${
                                pairIdx > 0 ? "pair-divider" : ""
                              }`}
                            >
                              <div
                                className="flex flex-col items-stretch gap-2 p-1"
                                style={{ minHeight: totalMin }}
                              >
                                <div
                                  onDragOver={allowDrop}
                                  onDrop={(e) =>
                                    dropIntoEmpty(
                                      e,
                                      { weekday, pair, group },
                                      "odd"
                                    )
                                  }
                                >
                                  <AddSlotButton
                                    label="Додати непарну пару"
                                    title="Додати пару (odd)"
                                    onClick={() =>
                                      createDraftLesson({
                                        weekday,
                                        pair,
                                        group,
                                        parity: "odd",
                                      })
                                    }
                                  />
                                </div>

                                <div
                                  onDragOver={allowDrop}
                                  onDrop={(e) =>
                                    dropIntoEmpty(
                                      e,
                                      { weekday, pair, group },
                                      "any"
                                    )
                                  }
                                >
                                  <AddSlotButton
                                    label="Додати пару"
                                    title="Додати пару (будь-який тиждень)"
                                    onClick={() =>
                                      createDraftLesson({
                                        weekday,
                                        pair,
                                        group,
                                        parity: "any",
                                      })
                                    }
                                  />
                                </div>

                                <div
                                  onDragOver={allowDrop}
                                  onDrop={(e) =>
                                    dropIntoEmpty(
                                      e,
                                      { weekday, pair, group },
                                      "even"
                                    )
                                  }
                                >
                                  <AddSlotButton
                                    label="Додати парну пару"
                                    title="Додати пару (even)"
                                    onClick={() =>
                                      createDraftLesson({
                                        weekday,
                                        pair,
                                        group,
                                        parity: "even",
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </td>
                          );
                        }

                        // НЕ порожньо: вирівнюємо висоти половинок (odd/even) і блоку any
                        return (
                          <td
                            key={group}
                            className={`py-2 align-top ${
                              pairIdx > 0 ? "pair-divider" : ""
                            }`}
                          >
                            <div
                              className="grid grid-rows-2 gap-1 relative"
                              onDragOver={allowDrop}
                            >
                              {anyItems.length > 0 ? (
                                // ANY займає дві половини — задаємо мінімальну сумарну висоту
                                (() => {
                                  const rowKey = `${weekday}-${pair}`;
                                  const minAny =
                                    (rowHeights[rowKey]?.odd ?? baseHalfMin) +
                                    (rowHeights[rowKey]?.even ?? baseHalfMin) +
                                    HALF_GAP_PX;

                                  return (
                                    <div
                                      className="row-span-2"
                                      data-row={rowKey}
                                      data-half="both"
                                      style={{ minHeight: minAny }}
                                      onDragOver={allowDrop}
                                      onDrop={(e) => {
                                        onDropToCell(e, {
                                          weekday,
                                          pair,
                                          group,
                                        });
                                      }}
                                    >
                                      {anyItems.map((l) =>
                                        editingId === l.id ? (
                                          <React.Fragment key={l.id}>
                                            {renderInlineEditor()}
                                          </React.Fragment>
                                        ) : (
                                          <CellCard
                                            key={l.id}
                                            lesson={l}
                                            dense={dense}
                                            onDragStart={setDragging}
                                            onTogglePin={togglePin}
                                            onDelete={deleteLesson}
                                            onStartEdit={startEdit}
                                            editable={editable}
                                            isDraft={draftIds.has(l.id)}
                                          />
                                        )
                                      )}

                                      {/* швидке розщеплення any -> even + odd(draft) */}
                                      {editable && anyItems[0] && (
                                        <div className="flex flex-col gap-1">
                                          <button
                                            className=" hover-lift btn px-2 py-1 m-1 rounded-md"
                                            title="Розщепити на odd/even (odd вгорі)"
                                            onClick={() => {
                                              const a = anyItems[0];
                                              setAllLessons((prev) =>
                                                prev.map((x) =>
                                                  x.id === a.id
                                                    ? { ...x, parity: "even" }
                                                    : x
                                                )
                                              );
                                              createDraftLesson({
                                                weekday,
                                                pair,
                                                group,
                                                parity: "odd",
                                              });
                                            }}
                                          >
                                            <Shuffle className=" hover-lift h-4 w-4" />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()
                              ) : (
                                <>
                                  {/* TOP (odd) */}
                                  {(() => {
                                    const rowKey = `${weekday}-${pair}`;
                                    const minH =
                                      rowHeights[rowKey]?.odd ?? baseHalfMin;

                                    return (
                                      <div
                                        data-row={rowKey}
                                        data-half="odd"
                                        style={{ minHeight: minH }}
                                        className="rounded-md"
                                        onDragOver={allowDrop}
                                        onDrop={(e) => dropToHalf(e, "top")}
                                      >
                                        {oddItems.length ? (
                                          oddItems.map((l) =>
                                            editingId === l.id ? (
                                              <React.Fragment key={l.id}>
                                                {renderInlineEditor()}
                                              </React.Fragment>
                                            ) : (
                                              <CellCard
                                                key={l.id}
                                                lesson={l}
                                                dense={dense}
                                                onDragStart={setDragging}
                                                onTogglePin={togglePin}
                                                onDelete={deleteLesson}
                                                onStartEdit={startEdit}
                                                editable={editable}
                                                isDraft={draftIds.has(l.id)}
                                              />
                                            )
                                          )
                                        ) : editable ? (
                                          <div className="p-1">
                                            <AddSlotButton
                                              label="Додати непарну пару"
                                              title="Додати пару (odd)"
                                              onClick={() =>
                                                createDraftLesson({
                                                  weekday,
                                                  pair,
                                                  group,
                                                  parity: "odd",
                                                })
                                              }
                                            />
                                          </div>
                                        ) : (
                                          <div className="h-3" />
                                        )}
                                      </div>
                                    );
                                  })()}

                                  {/* BOTTOM (even) */}
                                  {(() => {
                                    const rowKey = `${weekday}-${pair}`;
                                    const minH =
                                      rowHeights[rowKey]?.even ?? baseHalfMin;

                                    return (
                                      <div
                                        data-row={rowKey}
                                        data-half="even"
                                        style={{ minHeight: minH }}
                                        className="rounded-md"
                                        onDragOver={allowDrop}
                                        onDrop={(e) => dropToHalf(e, "bottom")}
                                      >
                                        {evenItems.length ? (
                                          evenItems.map((l) =>
                                            editingId === l.id ? (
                                              <React.Fragment key={l.id}>
                                                {renderInlineEditor()}
                                              </React.Fragment>
                                            ) : (
                                              <CellCard
                                                key={l.id}
                                                lesson={l}
                                                dense={dense}
                                                onDragStart={setDragging}
                                                onTogglePin={togglePin}
                                                onDelete={deleteLesson}
                                                onStartEdit={startEdit}
                                                editable={editable}
                                                isDraft={draftIds.has(l.id)}
                                              />
                                            )
                                          )
                                        ) : editable ? (
                                          <div className="p-1">
                                            <AddSlotButton
                                              label="Додати парну пару"
                                              title="Додати пару (even)"
                                              onClick={() =>
                                                createDraftLesson({
                                                  weekday,
                                                  pair,
                                                  group,
                                                  parity: "even",
                                                })
                                              }
                                            />
                                          </div>
                                        ) : (
                                          <div className="h-3" />
                                        )}
                                      </div>
                                    );
                                  })()}
                                </>
                              )}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  </React.Fragment>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label className="text-sm text-[var(--muted)]">
          Показувати колонок:
        </label>
        <NiceSelect
          className="ml-2"
          value={String(pageSize)}
          onChange={(v) => {
            setPageSize(Number(v));
            setPage(0);
          }}
          options={[4, 6, 8, 10].map((n) => ({
            value: String(n),
            label: String(n),
          }))}
        />
      </div>

      {snapOpen &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => !snapBusy && setSnapOpen(false)}
            />
            <div
              className="glasscard relative z-10 w-[min(560px,92vw)] max-h-[85vh] overflow-auto p-5 rounded-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="snap-title"
            >
              <div id="snap-title" className="text-lg font-semibold mb-3">
                Зберегти до Архіву
              </div>

              <label className="block text-sm text-[var(--muted)] mb-1">
                Назва
              </label>
              <input
                className="input w-full mb-3"
                placeholder="Напр. W36 — після правок"
                value={snapTitle}
                onChange={(e) => setSnapTitle(e.target.value)}
                disabled={snapBusy}
              />

              <label className="block text-sm text-[var(--muted)] mb-1">
                Коментар
              </label>
              <textarea
                className="input w-full min-h-[96px]"
                placeholder="Коротко опиши, що змінили"
                value={snapComment}
                onChange={(e) => setSnapComment(e.target.value)}
                disabled={snapBusy}
              />

              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="btn px-4 py-2 rounded-xl"
                  onClick={() => setSnapOpen(false)}
                  disabled={snapBusy}
                >
                  Скасувати
                </button>
                <button
                  className="btn px-4 py-2 rounded-xl"
                  onClick={handleConfirmSnapshot}
                  disabled={
                    snapBusy || !snapTitle.trim() || !snapComment.trim()
                  }
                  title={
                    !snapTitle.trim() || !snapComment.trim()
                      ? "Заповни назву і коментар"
                      : "Зберегти до Архіву"
                  }
                >
                  {snapBusy ? "Зберігаємо…" : "Підтвердити"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default FacultyScheduleTable;
