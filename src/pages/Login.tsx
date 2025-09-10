// src/pages/Login.tsx
import React from "react";
import { useAuth } from "@/types/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_HOME, isPathAllowedForRole } from "@/components/roleHome";

const Login: React.FC = () => {
  const { loginAs, loginWithGoogle, user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const sp = new URLSearchParams(loc.search);
  const next = sp.get("next") || "/";

  // якщо вже авторизований — перекине RequireAnon,
  // але додатково підстрахуємось
  React.useEffect(() => {
    if (user?.role) {
      const target = isPathAllowedForRole(next, user.role) ? next : ROLE_HOME[user.role];
      nav(target, { replace: true });
    }
  }, [user, next, nav]);

  return (
    <div className="max-w-md mx-auto card p-6 text-center space-y-4">
      <div className="text-xl font-semibold mb-4">Вхід</div>

      {/* PROD-кейс — базова кнопка (працюватиме і в DEV) */}
      <button className="btn-primary w-full" onClick={loginWithGoogle}>
        Увійти через Google
      </button>

      {/* DEV-кнопки показуємо лише якщо є loginAs */}
      {loginAs ? (
        <>
          <div className="text-[var(--muted)] mt-2">DEV-швидкий вхід:</div>
          <button
            className="btn-primary w-full"
            onClick={() => {
              loginAs("student");
              nav(isPathAllowedForRole(next, "student") ? next : ROLE_HOME["student"], { replace: true });
            }}
          >
            Зайти як студент
          </button>
          <button
            className="btn-primary w-full"
            onClick={() => {
              loginAs("teacher");
              nav(isPathAllowedForRole(next, "teacher") ? next : ROLE_HOME["teacher"], { replace: true });
            }}
          >
            Зайти як викладач
          </button>
          <button
            className="btn-primary w-full"
            onClick={() => {
              loginAs("admin");
              nav(isPathAllowedForRole(next, "admin") ? next : ROLE_HOME["admin"], { replace: true });
            }}
          >
            Зайти як адмін
          </button>
        </>
      ) : (
        <p className="text-[var(--muted)] text-sm">
          DEV-кнопки вимкнені (VITE_DEV_AUTH=0). Використовуйте Google-вхід.
        </p>
      )}
    </div>
  );
};

export default Login;
