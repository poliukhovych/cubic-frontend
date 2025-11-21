// src/pages/Login.tsx
import React from "react";
import { useAuth } from "@/types/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_HOME, isPathAllowedForRole } from "@/components/roleHome";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    <Card className="max-w-md mx-auto border-none bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle>Вхід</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PROD-кейс — базова кнопка (працюватиме і в DEV) */}
        <Button className="w-full" onClick={loginWithGoogle} variant="default">
          Увійти через Google
        </Button>

        {/* DEV-кнопки показуємо лише якщо є loginAs */}
        {loginAs ? (
          <>
            <div className="text-muted-foreground mt-2 text-center">DEV-швидкий вхід:</div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                loginAs("student");
                nav(isPathAllowedForRole(next, "student") ? next : ROLE_HOME["student"], { replace: true });
              }}
            >
              Зайти як студент
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                loginAs("teacher");
                nav(isPathAllowedForRole(next, "teacher") ? next : ROLE_HOME["teacher"], { replace: true });
              }}
            >
              Зайти як викладач
            </Button>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => {
                loginAs("admin");
                nav(isPathAllowedForRole(next, "admin") ? next : ROLE_HOME["admin"], { replace: true });
              }}
            >
              Зайти як адмін
            </Button>
          </>
        ) : (
          <p className="text-muted-foreground text-sm text-center">
            DEV-кнопки вимкнені (VITE_DEV_AUTH=0). Використовуйте Google-вхід.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default Login;
