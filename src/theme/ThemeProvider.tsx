// src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = "fh.theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const getInitial = (): Theme => {
    try {
      const saved = localStorage.getItem(KEY) as Theme | null;
      if (saved === "light" || saved === "dark") return saved;
    } catch {}
    return "dark";
  };

  const [theme, setTheme] = useState<Theme>(getInitial);

  // застосовуємо тему + зберігаємо
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);

  const toggle = () => {
    const root = document.documentElement;
    // 1) заморозити анімації/transition/backdrop-filter на час перемикання
    root.classList.add("theme-switching");

    // 2) змінити тему
    setTheme((t) => (t === "light" ? "dark" : "light"));

    // 3) дати WebKit відрепейнтити без ефектів
    requestAnimationFrame(() => {
      // невеличкий форс-рефлоу допомагає проти шлейфів у Safari
      void root.offsetHeight;
      // повернути анімації через ~120мс (зазвичай достатньо 80–150мс)
      setTimeout(() => root.classList.remove("theme-switching"), 120);
    });
  };

  const value = useMemo(() => ({ theme, setTheme, toggle }), [theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
