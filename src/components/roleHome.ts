// src/components/roleHome.ts
import type { Role } from "@/types/auth";

export const ROLE_HOME: Record<Role, string> = {
  student: "/student/dashboard",
  teacher: "/teacher/dashboard",
  admin: "/admin/dashboard",
};

// найпростіша перевірка дозволеності шляху для ролі — за префіксом
export function isPathAllowedForRole(pathname: string, role: Role) {
  if (!pathname.startsWith("/")) return false;
  const top = pathname.split("/")[1]; // "student" | "teacher" | "admin" | ""
  return top === role || pathname === "/";
}