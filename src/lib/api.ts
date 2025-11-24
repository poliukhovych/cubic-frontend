// src/lib/api.ts
import { config } from "@/config/runtime";

export const API_BASE = config.API_BASE_URL;

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Json = object | null | undefined;

async function request<T>(
  path: string,
  opts: { method?: HttpMethod; body?: Json; headers?: Record<string, string> } = {}
): Promise<T> {
  const { method = "GET", body, headers } = opts;

  // Get JWT token from localStorage (support both access_token and cubic_token for dev mode)
  const token = localStorage.getItem('access_token') || localStorage.getItem('cubic_token');
  
  const url = API_BASE + path;
  const requestHeaders: Record<string, string> = {
    ...(body ? { "Content-Type": "application/json" } : {}),
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
    ...headers,
  };

  // Log request details for /auth/me endpoint
  if (path === '/auth/me') {
    console.log('[API] Request to /auth/me:', {
      url,
      method,
      hasToken: !!token,
      tokenLength: token?.length,
      headers: { ...requestHeaders, Authorization: token ? `Bearer ${token.substring(0, 20)}...` : undefined },
    });
  }

  const res = await fetch(url, {
    method,
    credentials: "include",
    headers: requestHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });

  // Log response details for /auth/me endpoint
  if (path === '/auth/me') {
    console.log('[API] Response from /auth/me:', {
      status: res.status,
      statusText: res.statusText,
      ok: res.ok,
    });
  }

  if (!res.ok) {
    let err: any = { status: res.status, statusText: res.statusText };
    try { err = { ...err, ...(await res.json()) }; } catch {}
    throw err;
  }

  if (res.status === 204) return undefined as unknown as T;
  try { return (await res.json()) as T; } catch { return undefined as unknown as T; }
}

export const api = {
  get:   <T>(path: string) => request<T>(path),
  post:  <T>(path: string, body?: Json) => request<T>(path, { method: "POST", body }),
  put:   <T>(path: string, body?: Json) => request<T>(path, { method: "PUT", body }),
  patch: <T>(path: string, body?: Json) => request<T>(path, { method: "PATCH", body }),
  delete:<T>(path: string) => request<T>(path, { method: "DELETE" }),
};
