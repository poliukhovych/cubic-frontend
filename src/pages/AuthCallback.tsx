// src/pages/AuthCallback.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/types/auth';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const AuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshMe } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`OAuth error: ${error}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        // CSRF: verify state matches what we stored before redirect
        try {
          const expectedState = sessionStorage.getItem('oauth_state');
          if (!state || !expectedState || state !== expectedState) {
            throw new Error('Invalid OAuth state, please retry login');
          }
          // one-time use
          sessionStorage.removeItem('oauth_state');
        } catch (e) {
          throw e instanceof Error ? e : new Error('State verification failed');
        }

        // Відправляємо код авторизації на бекенд
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/google/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ 
            code, 
            state,
            redirect_uri: `${window.location.origin}/auth/callback`
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Authentication successful:', data);

        // Оновлюємо інформацію про користувача
        await refreshMe();
        
        setStatus('success');
        
        // Перенаправляємо користувача через 1.5 секунди
        setTimeout(() => {
          navigate('/auth/processing', { replace: true });
        }, 1500);

      } catch (err) {
        console.error('Authentication error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');
        
        // Перенаправляємо на сторінку входу через 5 секунд
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 5000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, refreshMe]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Обробка входу...</h2>
                <p className="text-muted-foreground">
                  Будь ласка, зачекайте. Ми обробляємо ваш вхід через Google.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h2 className="text-xl font-semibold text-green-600">Успішно!</h2>
                <p className="text-muted-foreground">
                  Вхід виконано успішно. Перенаправляємо вас на головну сторінку...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold text-red-600">Помилка входу</h2>
                <Alert variant="destructive">
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
                <p className="text-muted-foreground text-sm">
                  Перенаправляємо вас на сторінку входу через 5 секунд...
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthCallback;