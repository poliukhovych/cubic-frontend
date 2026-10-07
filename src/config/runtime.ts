type RuntimeConfig = {
  APP_BASE_PATH: string;
  API_BASE_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_REDIRECT_URI?: string;
  GOOGLE_USE_CODE_FLOW?: string;
  DEV_AUTH?: string;
  ADMIN_USERNAME?: string;
  ADMIN_PASSWORD?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<RuntimeConfig>;
  }
}

const fromWindow = (typeof window !== "undefined" && window.__APP_CONFIG__) || {};

// Fallback на VITE_ змінні для dev режиму (коли window.__APP_CONFIG__ порожній)
const fromVite: Record<string, any> = typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : {};

export const config: RuntimeConfig = {
  // BASE_URL від Vite (із vite.config.ts base)
  APP_BASE_PATH: (fromWindow.APP_BASE_PATH as string) || (fromVite.VITE_BASE_PATH as string) || "/",
  API_BASE_URL: (fromWindow.API_BASE_URL as string) || (fromVite.VITE_API_BASE_URL as string) || "http://localhost:8000",
  GOOGLE_CLIENT_ID: (fromWindow as any).GOOGLE_CLIENT_ID || (fromVite as any).VITE_GOOGLE_CLIENT_ID || undefined,
  GOOGLE_REDIRECT_URI: (fromWindow as any).GOOGLE_REDIRECT_URI || (fromVite as any).VITE_GOOGLE_REDIRECT_URI || undefined,
  GOOGLE_USE_CODE_FLOW: (fromWindow as any).GOOGLE_USE_CODE_FLOW || (fromVite as any).VITE_GOOGLE_USE_CODE_FLOW || "0",
  DEV_AUTH: (fromWindow as any).DEV_AUTH || (fromVite as any).VITE_DEV_AUTH || "1",
  ADMIN_USERNAME: (fromWindow as any).ADMIN_USERNAME || (fromVite as any).VITE_ADMIN_USERNAME || "admin",
  ADMIN_PASSWORD: (fromWindow as any).ADMIN_PASSWORD || (fromVite as any).VITE_ADMIN_PASSWORD || "admin123",
};
