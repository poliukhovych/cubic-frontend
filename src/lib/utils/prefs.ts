// src/lib/prefs.ts
export type ViewMode = "view" | "edit";
const KEY = (userId: string) => `cubic.pref.viewMode:${userId}`;

export function getViewMode(userId: string): ViewMode {
  try {
    const v = localStorage.getItem(KEY(userId));
    return v === "edit" ? "edit" : "view";
  } catch { return "view"; }
}

export function setViewMode(userId: string, mode: ViewMode) {
  try { localStorage.setItem(KEY(userId), mode); } catch {}
}
