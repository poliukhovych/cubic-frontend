type RuntimeConfig = {
  APP_BASE_PATH: string;
  API_BASE_URL: string;
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
    || (import.meta.env.BASE_URL || "/cubic-frontend/"),
  API_BASE_URL:
    (fromWindow.API_BASE_URL as string)
    || (import.meta.env.VITE_API_BASE_URL || ""),
};
