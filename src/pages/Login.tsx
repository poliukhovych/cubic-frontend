// src/pages/Login.tsx
import React, { useState } from "react";
import { useAuth } from "@/types/auth";
import { useLocation, useNavigate } from "react-router-dom";
import { ROLE_HOME, isPathAllowedForRole } from "@/components/roleHome";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InlineSpinner } from "@/components/Spinner";
import { startGoogleOAuth } from "@/lib/googleAuth";
import { config } from "@/config/runtime";

const Login: React.FC = () => {
  const { loginAs, user } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const sp = new URLSearchParams(loc.search);
  const next = sp.get("next") || "/";
  const [isRedirecting, setIsRedirecting] = useState(false);

  // якщо вже авторизований — перекине RequireAnon,
  // але додатково підстрахуємось
  React.useEffect(() => {
    if (user?.role) {
      const target = isPathAllowedForRole(next, user.role) ? next : ROLE_HOME[user.role];
      nav(target, { replace: true });
    }
  }, [user, next, nav]);

  const handleGoogleLogin = async () => {
  setIsRedirecting(true);
  try {
    const useCodeFlow = (config.GOOGLE_USE_CODE_FLOW ?? '0') === '1';
    if (useCodeFlow) {
      const clientId = config.GOOGLE_CLIENT_ID as string | undefined;
      if (!clientId) throw new Error('GOOGLE_CLIENT_ID is not set');

      // БЕРЕМО точний URI з config (БЕЗ /login на кінці!)
      const redirectUri = config.GOOGLE_REDIRECT_URI ?? `${window.location.origin}/auth/callback`;

      const scopes = [
        'openid',
        'profile',
        'email',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students',
        'https://www.googleapis.com/auth/classroom.coursework.me',
        'https://www.googleapis.com/auth/classroom.courses.readonly',
      ].join(' ');
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('oauth_state', state);

      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: scopes,
        access_type: 'offline',
        include_granted_scopes: 'true',
        state,
        prompt: 'consent',
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    } else {
      await startGoogleOAuth();
    }
  } catch (e) {
    console.error(e);
    setIsRedirecting(false);
  }
};

  return (
    <Card className="max-w-md mx-auto border-none bg-card/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle>Вхід</CardTitle>
        <CardDescription>
          Увійдіть в систему за допомогою Google акаунту
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* PROD Google OAuth */}
        <Button 
          onClick={handleGoogleLogin}
          disabled={isRedirecting}
          className="w-full h-12"
          size="lg"
        >
          {isRedirecting ? (
            <span className="inline-flex items-center gap-2 justify-center">
              <InlineSpinner /> Перенаправлення...
            </span>
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Увійти через Google
            </>
          )}
        </Button>

        {/* Register Link */}
        <div className="text-center text-sm text-muted-foreground">
          Немає акаунту?{' '}
          <a href="/register" className="text-primary hover:underline font-medium">
            Зареєструватись
          </a>
        </div>

        {/* DEV кнопки показуємо лише якщо є loginAs */}
        {loginAs && (
          <>
            <div className="text-muted-foreground mt-4 pt-4 border-t text-center text-xs">DEV-швидкий вхід:</div>
            <div className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  loginAs("student");
                  nav(isPathAllowedForRole(next, "student") ? next : ROLE_HOME["student"], { replace: true });
                }}
              >
                DEV: Студент
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={() => {
                  loginAs("teacher");
                  nav(isPathAllowedForRole(next, "teacher") ? next : ROLE_HOME["teacher"], { replace: true });
                }}
              >
                DEV: Викладач
              </Button>
              <Button
                className="w-full"
                variant="outline"
                size="sm"
                onClick={async () => {
                  try {
                    await loginAs("admin");
                    // Невелика затримка для завершення логіну
                    setTimeout(() => {
                      nav(isPathAllowedForRole(next, "admin") ? next : ROLE_HOME["admin"], { replace: true });
                    }, 100);
                  } catch (error) {
                    console.error('Failed to login as admin:', error);
                    // Не перенаправляємо при помилці
                  }
                }}
              >
                DEV: Адмін
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default Login;
