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
import { startGoogleOAuth } from "@/lib/googleAuth";

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
  initializing: boolean;
  loading: boolean;
  loginWithGoogle: () => void;
  refreshMe: () => Promise<void>;
  logout: () => Promise<void>;
  loginAs?: (role: Role) => void;
};

// ---- DEV SWITCH ----
const DEV_AUTH = (import.meta.env.VITE_DEV_AUTH ?? "1") === "1"; // ✅ За замовчуванням увімкнено

// ключі для localStorage
const STORAGE_KEY = "cubic.auth.user";
const TOKEN_KEYS = ["access_token", "cubic_token"]; // ✅ Підтримка обох ключів

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

// ✅ Перевірка чи є токен
function hasToken(): boolean {
  return TOKEN_KEYS.some(key => !!localStorage.getItem(key));
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);

  // ----------- PROD: /api/auth/me -----------
  const refreshMe = useCallback(async () => {
    // ✅ DEV: якщо є cubic_token, використовуємо дані з localStorage
    if (DEV_AUTH && localStorage.getItem('cubic_token')) {
      const stored = loadStoredUser();
      if (stored) {
        setUser(stored);
        console.log('[AUTH][DEV] Loaded user from localStorage:', stored);
        return;
      }
    }

    // Check if token exists before making API call
    if (!hasToken()) {
      setUser(null);
      saveStoredUser(null);
      return;
    }

    try {
      const me = await api.get<any>("/api/auth/me");
      const mapped: User | null = me
        ? {
            id: me.user_id ?? me.id ?? "",
            name: (me.first_name && me.last_name)
              ? `${me.first_name} ${me.last_name}`
              : (me.name ?? me.email ?? ""),
            email: me.email ?? "",
            role: me.role ?? null,
            status: (me.is_active === false) ? "disabled" : "active",
          }
        : null;
      setUser(mapped);
      console.log('[AUTH][refreshMe] Loaded user:', mapped);
      saveStoredUser(mapped);
    } catch {
      setUser(null);
      saveStoredUser(null);
      TOKEN_KEYS.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    // DEV: відновлюємо користувача з localStorage
    if (DEV_AUTH) {
      const stored = loadStoredUser();
      if (stored) {
        setUser(stored);
        console.log('[AUTH][DEV] Restored user on mount:', stored);
      }
      setInitializing(false);
      return;
    }

    // PROD: перевірка сесії
    void (async () => {
      await refreshMe();
      setInitializing(false);
    })();
  }, [refreshMe]);

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (TOKEN_KEYS.includes(e.key ?? "") && e.newValue) {
        void refreshMe();
      } else if (TOKEN_KEYS.includes(e.key ?? "") && !e.newValue) {
        setUser(null);
        saveStoredUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshMe]);

  // Зберігаємо user локально
  useEffect(() => {
    saveStoredUser(user);
    if (user) {
      console.log('[AUTH] User set:', { id: user.id, name: user.name, email: user.email, role: user.role });
    } else {
      console.log('[AUTH] User cleared');
    }
  }, [user]);

  // ----------- PROD: Google redirect -----------
  const loginWithGoogle = () => {
    if (DEV_AUTH) {
      console.warn("[DEV_AUTH] loginWithGoogle() викликано — ігноруємо редірект.");
      return;
    }
    void startGoogleOAuth();
  };

  // ----------- PROD: Logout -----------
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      TOKEN_KEYS.forEach(key => localStorage.removeItem(key));
      localStorage.removeItem('user');
      localStorage.removeItem('cubic_role');
      setUser(null);
      saveStoredUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----------- DEV-ONLY: миттєвий логін за роллю -----------
  const loginAs = useCallback(async (role: Role) => {
    if (!DEV_AUTH) return;
    
    // Для адміністратора виконуємо автоматичний логін через API
    if (role === "admin") {
      try {
        // Виконуємо автоматичний логін адміністратора
        const apiBase = API_BASE || 'http://localhost:8000';
        const response = await fetch(`${apiBase}/api/auth/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
            password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // API повертає accessToken (camelCase) або access_token (snake_case)
          const token = data.accessToken || data.access_token;
          
          if (!token) {
            throw new Error('No access token in response');
          }
          
          // Зберігаємо токен
          localStorage.setItem('access_token', token);
          localStorage.setItem('cubic_token', token);
          
          // Створюємо користувача адміністратора
          const userData = data.user || {};
          const adminUser: User = {
            id: userData.user_id || userData.id || 'admin-1',
            name: userData.name || `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Admin',
            email: userData.email || 'admin@example.com',
            role: 'admin',
            status: "active",
          };
          
          // Зберігаємо дані користувача
          localStorage.setItem('user', JSON.stringify(adminUser));
          localStorage.setItem('cubic_role', 'admin');
          
          setUser(adminUser);
          saveStoredUser(adminUser);
          
          // Оновлюємо стан після збереження токену
          await refreshMe();
          
          console.log('[AUTH][DEV] Admin auto-login successful:', { token: token.substring(0, 20) + '...', user: adminUser });
        } else {
          // Якщо API не працює, показуємо помилку
          const errorText = await response.text();
          console.warn('Admin login failed:', response.status, errorText);
          
          // Не використовуємо фейкові дані, бо вони не працюватимуть з реальним API
          throw new Error(`Admin login failed: ${response.status} ${errorText}`);
        }
      } catch (error) {
        // Якщо помилка, показуємо повідомлення
        console.error('Admin login error:', error);
        // Не використовуємо фейкові дані, бо вони не працюватимуть з реальним API
        alert(`Помилка автоматичного логіну адміністратора: ${error instanceof Error ? error.message : 'Невідома помилка'}\n\nПеревірте:\n1. Чи налаштовані ADMIN_USERNAME та ADMIN_PASSWORD на бекенді\n2. Чи працює бекенд\n3. Спробуйте увійти через /admin/login`);
        throw error;
      }
    } else {
      // Для студентів та викладачів використовуємо фейкові дані
      const fake: User = {
        id: `dev-${role}`,
        name: role.toUpperCase(),
        email: `${role}@dev.local`,
        role,
        status: "active",
      };
      setUser(fake);
      saveStoredUser(fake);
    }
  }, []);

  const value: AuthCtx = useMemo(
    () => ({
      user,
      initializing,
      loading,
      loginWithGoogle,
      refreshMe,
      logout,
      ...(DEV_AUTH ? { loginAs } : {}),
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
