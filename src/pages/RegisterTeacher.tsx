// src/pages/RegisterTeacher.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { startGoogleOAuth } from '@/lib/googleAuth';
import { GraduationCap, CheckCircle } from 'lucide-react';

const RegisterTeacher: React.FC = () => {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleRegister = async () => {
    setIsRedirecting(true);
    try {
      const useCodeFlow = (import.meta.env.VITE_GOOGLE_USE_CODE_FLOW ?? '0') === '1';
      sessionStorage.setItem('oauth_role', 'teacher');
      if (useCodeFlow) {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
        if (!clientId) throw new Error('VITE_GOOGLE_CLIENT_ID is not set');
        const redirectUri = `${window.location.origin}/auth/callback/register/teacher`;
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
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-green-50 to-emerald-100">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold">Реєстрація викладача</CardTitle>
          <CardDescription className="text-lg">
            Приєднуйтесь до CubicHelper як викладач
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Що ви отримаєте:</h3>
            
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Управління курсами</h4>
                <p className="text-sm text-muted-foreground">
                  Створюйте та редагуйте курси, додавайте матеріали
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Робота з групами</h4>
                <p className="text-sm text-muted-foreground">
                  Керуйте групами студентів та їх розкладом
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Домашні завдання</h4>
                <p className="text-sm text-muted-foreground">
                  Створюйте завдання, перевіряйте роботи студентів
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Оцінювання</h4>
                <p className="text-sm text-muted-foreground">
                  Виставляйте оцінки та відстежуйте прогрес студентів
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium">Інтеграція з Google Classroom</h4>
                <p className="text-sm text-muted-foreground">
                  Синхронізація з вашими курсами Google Classroom
                </p>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <Alert>
            <AlertDescription>
              <strong>Зверніть увагу:</strong> При реєстрації ви будете перенаправлені на сторінку Google 
              для надання дозволу на доступ до вашого профілю та Google Classroom. Після реєстрації 
              ваш акаунт потребуватиме підтвердження адміністратором перед повним доступом.
            </AlertDescription>
          </Alert>

          {/* Register Button */}
          <Button 
            onClick={handleRegister}
            disabled={isRedirecting}
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {isRedirecting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Перенаправлення...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Зареєструватись через Google
              </>
            )}
          </Button>

          {/* Login Link */}
          <div className="text-center text-sm text-muted-foreground">
            Вже маєте акаунт?{' '}
            <a href="/login" className="text-primary hover:underline font-medium">
              Увійти
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterTeacher;
