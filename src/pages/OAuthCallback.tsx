// src/pages/OAuthCallback.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string>('');
  // Guard against double effect in React Strict Mode (DEV)
  const executedRef = useRef(false);

  useEffect(() => {
    const handleCallback = async () => {
      if (executedRef.current) {
        // Already handled once (likely due to Strict Mode), skip
        return;
      }
      executedRef.current = true;
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

        // CSRF: verify state matches what we stored
        const expectedState = sessionStorage.getItem('oauth_state');
        if (!state || !expectedState || state !== expectedState) {
          throw new Error('Invalid OAuth state');
        }

        const role = sessionStorage.getItem('oauth_role');
        
        // Determine if this is register or login based on URL path
        const isRegister = location.pathname.includes('/register/');
        const isLogin = location.pathname.includes('/login');

        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
        const redirectUri = `${window.location.origin}${location.pathname}`;

        let endpoint = '';
        let requestBody: any = {
          code,
          state,
          redirect_uri: redirectUri,
        };

        if (isRegister && role) {
          // Registration
          endpoint = `${API_BASE_URL}/api/auth/register/${role}`;
          requestBody.role = role;
        } else if (isLogin) {
          // Login
          endpoint = `${API_BASE_URL}/api/auth/login`;
        } else {
          throw new Error('Unknown callback type');
        }

        // Exchange code for JWT token
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

  if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          try {
            console.warn('[AUTH][OAuthCallback] HTTP error:', {
              status: response.status,
              statusText: response.statusText,
              endpoint,
              body: errorData,
            });
          } catch {}
          
          // If login failed with 404, redirect to registration
          if (isLogin && response.status === 404) {
            setStatus('error');
            setError('Акаунт не знайдено. Перенаправлення на реєстрацію...');
            setTimeout(() => {
              sessionStorage.removeItem('oauth_state');
              sessionStorage.removeItem('oauth_role');
              navigate('/register', { replace: true });
            }, 2000);
            return;
          }
          
          // If registration failed with 409, redirect to login
          if (isRegister && response.status === 409) {
            setStatus('error');
            setError('Акаунт вже існує. Перенаправлення на вхід...');
            setTimeout(() => {
              sessionStorage.removeItem('oauth_state');
              sessionStorage.removeItem('oauth_role');
              navigate('/login', { replace: true });
            }, 2000);
            return;
          }
          
          throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        // If backend returned a pending registration response, show waiting UI and redirect
        if (data && data.pending) {
          setStatus('success');
          // Clean OAuth state
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_role');
          setTimeout(() => {
            navigate('/pending-approval', { replace: true, state: { message: data.message } });
          }, 1200);
          return;
        }
        // Debug: log basic user info on successful OAuth exchange
        try {
          console.log('[AUTH][OAuthCallback] Success:', {
            endpoint,
            path: location.pathname,
            user: {
              id: data?.user?.id ?? data?.user?.user_id,
              name: data?.user?.name ?? `${data?.user?.first_name ?? ''} ${data?.user?.last_name ?? ''}`.trim(),
              email: data?.user?.email,
              role: data?.user?.role,
            },
          });
        } catch {}
        
  // Save JWT token and user info
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Dispatch storage event to notify AuthContext (storage event only fires cross-tab by default)
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'access_token',
          newValue: data.access_token,
          oldValue: null,
          storageArea: localStorage,
          url: window.location.href
        }));

        // Clear OAuth session data
        sessionStorage.removeItem('oauth_state');
        sessionStorage.removeItem('oauth_role');

        setStatus('success');

        // Redirect to appropriate dashboard based on role
        setTimeout(() => {
          const userRole = data.user.role;
          if (userRole === 'student') {
            navigate('/student/dashboard', { replace: true });
          } else if (userRole === 'teacher') {
            navigate('/teacher/dashboard', { replace: true });
          } else if (userRole === 'admin') {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/', { replace: true });
          }
        }, 1500);

      } catch (err) {
        console.error('OAuth callback error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setStatus('error');

        // Redirect to login after error
        setTimeout(() => {
          sessionStorage.removeItem('oauth_state');
          sessionStorage.removeItem('oauth_role');
          navigate('/login', { replace: true });
        }, 5000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, location]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            {status === 'loading' && (
              <>
                <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                <h2 className="text-xl font-semibold">Обробка...</h2>
                <p className="text-muted-foreground">
                  Будь ласка, зачекайте. Ми обробляємо ваш запит.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle className="h-12 w-12 mx-auto text-green-500" />
                <h2 className="text-xl font-semibold text-green-600">Успішно!</h2>
                <p className="text-muted-foreground">
                  Перенаправляємо вас на головну сторінку...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="h-12 w-12 mx-auto text-red-500" />
                <h2 className="text-xl font-semibold text-red-600">Помилка</h2>
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

export default OAuthCallback;
