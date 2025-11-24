// src/pages/Register.tsx
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, GraduationCap } from 'lucide-react';
import { config } from '@/config/runtime';

const Register: React.FC = () => {
  const handleRegister = (role: 'student' | 'teacher') => {
    // Start Google OAuth immediately with appropriate redirect per role
    const clientId = config.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('GOOGLE_CLIENT_ID is not configured');
      return;
    }
    
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
    sessionStorage.setItem('oauth_role', role);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes,
      access_type: 'offline',
      prompt: 'consent',
      include_granted_scopes: 'true',
      state: state,
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  return (
    <div className="flex justify-center p-4">
      <Card className="w-full max-w-4xl glass glass-card border border-border/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Реєстрація в CubicHelper</CardTitle>
          <CardDescription className="text-lg">
            Оберіть вашу роль в системі
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Student Registration */}
            <button
              onClick={() => handleRegister('student')}
              className="group relative overflow-hidden rounded-xl border border-border/20 transition-all p-8 text-left bg-card/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transform hover:scale-[1.02] active:scale-[1.01] cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 bg-blue-500/10" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-blue-500/15">
                  <BookOpen className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-2xl font-bold mb-2">Студент</h3>
                <p className="text-muted-foreground mb-4">
                  Реєстрація для студентів, які хочуть переглядати розклад, отримувати завдання та відстежувати свій прогрес.
                </p>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Доступ до розкладу
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Домашні завдання
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                    Оцінки та статистика
                  </li>
                </ul>

                <div className="mt-6 text-sm text-muted-foreground">
                  Натисніть на картку, щоб розпочати реєстрацію через Google
                </div>
              </div>
            </button>

            {/* Teacher Registration */}
            <button
              onClick={() => handleRegister('teacher')}
              className="group relative overflow-hidden rounded-xl border border-border/20 transition-all p-8 text-left bg-card/60 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transform hover:scale-[1.02] active:scale-[1.01] cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 bg-green-500/10" />
              
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4 bg-green-500/15">
                  <GraduationCap className="w-8 h-8 text-green-600" />
                </div>

                <h3 className="text-2xl font-bold mb-2">Викладач</h3>
                <p className="text-muted-foreground mb-4">
                  Реєстрація для викладачів, які будуть керувати курсами, групами та оцінювати студентів.
                </p>

                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Управління курсами
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Робота з групами
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Оцінювання студентів
                  </li>
                </ul>

                <div className="mt-6 text-sm text-muted-foreground">
                  Натисніть на картку, щоб розпочати реєстрацію через Google
                </div>
              </div>
            </button>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
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

export default Register;