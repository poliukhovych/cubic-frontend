type RuntimeConfig = {
  APP_BASE_PATH: string;
  API_BASE_URL: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_REDIRECT_URI?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<RuntimeConfig>;
  }
}

const fromWindow = (typeof window !== "undefined" && window.__APP_CONFIG__) || {};

export const config: RuntimeConfig = {
  // BASE_URL від Vite (із vite.config.ts base)
  APP_BASE_PATH: (fromWindow.APP_BASE_PATH as string)
    || "/",
  API_BASE_URL:
    (fromWindow.API_BASE_URL as string)
    || "",
  GOOGLE_CLIENT_ID: (fromWindow as any).GOOGLE_CLIENT_ID || undefined,
  GOOGLE_REDIRECT_URI: (fromWindow as any).GOOGLE_REDIRECT_URI || undefined,
};
