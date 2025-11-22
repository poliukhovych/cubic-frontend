// src/lib/googleAuth.ts
import { config } from "@/config/runtime";

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

export interface GoogleAuthResponse {
  credential: string;
  clientId: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
          renderButton: (element: HTMLElement, config: any) => void;
          disableAutoSelect: () => void;
        };
        oauth2: {
          initCodeClient: (config: {
            client_id: string;
            scope: string;
            ux_mode?: "popup" | "redirect";
            state?: string;
            redirect_uri?: string;
            // If ux_mode is popup, we can get code via callback
            callback?: (response: { code?: string; error?: string }) => void;
            enable_serial_consent?: boolean;
            include_granted_scopes?: boolean;
          }) => {
            requestCode: () => void;
          };
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            prompt?: 'consent' | 'none';
          }) => {
            requestAccessToken: (options?: { prompt?: 'consent' | 'none' }) => void;
          };
        };
      };
    };
  }
}

// Завантажуємо Google Identity Services API
export const loadGoogleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google API'));
    document.head.appendChild(script);
  });
};

// Ініціалізуємо Google OAuth
export const initializeGoogleAuth = async (): Promise<void> => {
  await loadGoogleAPI();
  
  const clientId = config.GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('GOOGLE_CLIENT_ID is not set');
  }

  window.google!.accounts.id.initialize({
    client_id: clientId,
    callback: handleCredentialResponse,
    auto_select: false,
    cancel_on_tap_outside: false,
  });
};

// Обробляємо відповідь від Google OAuth
const handleCredentialResponse = async (response: GoogleAuthResponse) => {
  // Цей колбек буде викликаний після успішної аутентифікації
  console.log('Google OAuth response received');
  
  // Декодуємо JWT токен для отримання інформації про користувача
  const userInfo = parseJWT(response.credential);
  console.log('User info:', userInfo);
  
  // Відправляємо токен на бекенд
  await sendTokenToBackend(response.credential);
};

// Парсимо JWT токен
const parseJWT = (token: string): GoogleUser | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    
    return JSON.parse(jsonPayload) as GoogleUser;
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
};

// Відправляємо токен на бекенд
const sendTokenToBackend = async (credential: string) => {
  try {
    // Import authenticateWithGoogle from auth.ts
    const { authenticateWithGoogle } = await import('./auth');
    
    // First, try to authenticate without role (for existing users)
    try {
      const authResponse = await authenticateWithGoogle(credential);
      
      if (authResponse.needs_role_selection) {
        // New user - redirect to role selection
        sessionStorage.setItem('pending_google_token', credential);
        window.location.href = '/role-selection';
      } else {
        // Existing user - redirect to dashboard
        console.log('Authentication successful:', authResponse.user);
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      // Check if it's a 202 (pending approval)
      if (error.status === 202 || error.message?.includes('awaiting admin approval')) {
        window.location.href = '/pending-approval';
        return;
      }
      
      // If error is about missing role, redirect to role selection
      if (error.message?.includes('Role is required')) {
        sessionStorage.setItem('pending_google_token', credential);
        window.location.href = '/role-selection';
      } else {
        console.error('Authentication error:', error);
        alert('Помилка аутентифікації: ' + error.message);
      }
    }
  } catch (error) {
    console.error('Error sending token to backend:', error);
    alert('Помилка відправки токену на сервер');
  }
};

// Показуємо Google Sign-In кнопку
export const renderGoogleButton = (element: HTMLElement) => {
  if (!window.google?.accounts?.id) {
    console.error('Google API not loaded');
    return;
  }

  window.google.accounts.id.renderButton(element, {
    theme: 'outline',
    size: 'large',
    type: 'standard',
    text: 'signin_with',
    width: '100%',
  });
};

// Показуємо One Tap діалог
export const showOneTap = () => {
  if (!window.google?.accounts?.id) {
    console.error('Google API not loaded');
    return;
  }

  window.google.accounts.id.prompt();
};

// Відключаємо автовибір
export const disableAutoSelect = () => {
  if (!window.google?.accounts?.id) {
    console.error('Google API not loaded');
    return;
  }

  window.google.accounts.id.disableAutoSelect();
};

// Ініціюємо OAuth flow вручну (для прямого редиректу)
export const startGoogleOAuth = async () => {
  /**
   * Use popup-based OAuth2 flow to avoid FedCM CORS issues
   * This works reliably without requiring FedCM headers
   */
  
  await loadGoogleAPI();
  
  const clientId = config.GOOGLE_CLIENT_ID as string | undefined;
  if (!clientId) throw new Error("GOOGLE_CLIENT_ID is not set");
  
  // Note: role can be set by register/login pages via sessionStorage under 'oauth_role'
  // If needed in future, read it here and pass to backend. For now it's unused.
  
  // Use OAuth2 popup flow instead of One Tap to avoid FedCM
  if (!window.google?.accounts?.oauth2) {
    console.error("Google OAuth2 API not loaded");
    throw new Error("Google OAuth2 API not loaded");
  }
  
  const tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'openid profile email',
    callback: async (tokenResponse: any) => {
      if (tokenResponse.error) {
        console.error("Google OAuth error:", tokenResponse);
        alert('Помилка авторизації: ' + tokenResponse.error);
        return;
      }
      
      // Get ID token using the access token
      try {
        const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${tokenResponse.access_token}`
          }
        });
        
        const userInfo = await response.json();
        
        // Now we need to send this to our backend
        // Since we don't have id_token from this flow, we'll use the /api/auth/register or /api/auth/login endpoints
        // But those require authorization code, not access token
        // So we need a different approach - let's create a temporary id_token-like structure
        
        console.log("User info from Google:", userInfo);
        alert('OAuth popup flow потребує додаткової конфігурації. Використовуйте код flow замість цього.');
      } catch (error) {
        console.error("Failed to get user info:", error);
        alert('Помилка отримання інформації користувача');
      }
    },
  });
  
  tokenClient.requestAccessToken({ prompt: 'consent' });
  
  /* 
  // Alternative: Authorization Code Flow (requires GOOGLE_CLIENT_SECRET on backend)
  await loadGoogleAPI();

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const redirectUri = (import.meta.env.VITE_GOOGLE_REDIRECT_URI as string | undefined)
    || `${window.location.origin}/auth/callback`;

  if (!clientId) throw new Error("VITE_GOOGLE_CLIENT_ID is not set");

  const scopes = (import.meta.env.VITE_GOOGLE_SCOPES as string | undefined) || [
    "openid",
    "profile",
    "email",
    "https://www.googleapis.com/auth/classroom.rosters.readonly",
    "https://www.googleapis.com/auth/classroom.coursework.students",
    "https://www.googleapis.com/auth/classroom.coursework.me",
    "https://www.googleapis.com/auth/classroom.courses.readonly",
  ].join(" ");

  const state = Math.random().toString(36).slice(2);
  sessionStorage.setItem("oauth_state", state);

  if (!window.google?.accounts?.oauth2) {
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes,
      access_type: "offline",
      include_granted_scopes: "true",
      state,
      prompt: "consent",
    });
    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    return;
  }

  const codeClient = window.google.accounts.oauth2.initCodeClient({
    client_id: clientId,
    scope: scopes,
    ux_mode: "redirect",
    redirect_uri: redirectUri,
    state,
    include_granted_scopes: true,
    enable_serial_consent: true,
  });

  codeClient.requestCode();
  */
};