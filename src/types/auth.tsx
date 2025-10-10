// src/types/auth.tsx
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, API_BASE } from "@/lib/api";

export type Role = "student" | "teacher" | "admin";
export type UserStatus = "active" | "pending_profile" | "pending_approval" | "disabled";

export type User = {
  id: string;
  name: string;
  email: string;
  role?: Role | null;
  status: UserStatus;
};

type AuthCtx = {
  user: User | null;
  initializing: boolean; // перший автологін / перевірка сесії
  loading: boolean; // запити типу logout тощо
  loginWithGoogle: () => void; // PROD: редірект на бекенд
  refreshMe: () => Promise<void>; // підтягнути сесію з cookie
  logout: () => Promise<void>;
  /** DEV-тільки: миттєво підставити роль без Google */
  loginAs?: (role: Role) => void;
};

// ---- DEV SWITCH ----
// .env: VITE_DEV_AUTH=1 для заглушок; VITE_DEV_AUTH=0 для прод
const DEV_AUTH = (import.meta.env.VITE_DEV_AUTH ?? "1") === "1";

// ключ для localStorage
const STORAGE_KEY = "cubic.auth.user";

// безпечні хелпери для збереження/читання з localStorage
function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function saveStoredUser(user: User | null) {
  try {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // ----------- PROD: /auth/me -----------
  const refreshMe = useCallback(async () => {
    try {
      const data = await api.get<{ user: User }>("/auth/me");
      const nextUser = data?.user ?? null;
      setUser(nextUser);
      saveStoredUser(nextUser); // синхронізуємо й локально
    } catch {
      setUser(null);
      saveStoredUser(null);
    }
  }, []);

  useEffect(() => {
    // DEV: відновлюємо користувача з localStorage і завершуємо ініціалізацію
    if (DEV_AUTH) {
      const stored = loadStoredUser();
      if (stored) setUser(stored);
      setInitializing(false);
      return;
    }

    // PROD: одна перевірка сесії при монтуванні
    void (async () => {
      await refreshMe();
      setInitializing(false);
    })();
  }, [refreshMe]);

  // будь-яка зміна user — зберігаємо локально (дублюємо на випадок ручних змін)
  useEffect(() => {
    saveStoredUser(user);
  }, [user]);

  // ----------- PROD: Google redirect -----------
  const loginWithGoogle = () => {
    if (DEV_AUTH) {
      // У дев-режимі реальний редірект не потрібен
      console.warn("[DEV_AUTH] loginWithGoogle() викликано — ігноруємо редірект.");
      return;
    }
    // Full redirect to backend start endpoint
    window.location.href = API_BASE + "/auth/google/start";
  };

  // ----------- PROD: Logout -----------
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      if (!DEV_AUTH) {
        await api.post("/auth/logout");
      }
      setUser(null);
      saveStoredUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------- DEV-ONLY: миттєвий логін за роллю -----------
  // Видали цей блок у проді або вимкни через VITE_DEV_AUTH=0
  const loginAs = useCallback((role: Role) => {
    if (!DEV_AUTH) return;
    const fake: User = {
      id: `dev-${role}`,
      name: role.toUpperCase(),
      email: `${role}@dev.local`,
      role,
      status: "active",
    };
    setUser(fake);
    saveStoredUser(fake);
  }, []);

  const value: AuthCtx = useMemo(
    () => ({
      user,
      initializing,
      loading,
      loginWithGoogle,
      refreshMe,
      logout,
      ...(DEV_AUTH ? { loginAs } : {}), // у проді поля loginAs не буде
    }),
    [user, initializing, loading, loginWithGoogle, refreshMe, logout, loginAs]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
