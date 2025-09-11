//src/theme/ThemeProvider.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";
type ThemeCtx = { theme: Theme; setTheme: (t: Theme) => void; toggle: () => void };

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = "fh.theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // const getInitial = (): Theme => {
  //   const saved = localStorage.getItem(KEY) as Theme | null;
  //   if (saved) return saved;
  //   const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
  //   return prefersDark ? "dark" : "light";
  // };

  const getInitial = (): Theme => {

  return "dark"; // 👈 дефолтна тема
};


  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggle: () => setTheme(t => (t === "light" ? "dark" : "light")) }), [theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
