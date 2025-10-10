// src/components/RoleGuard.tsx
import React from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useAuth, type Role } from "@/types/auth";
import { ROLE_HOME } from "@/components/roleHome";

const RoleGuard: React.FC<{ allow: Role[] }> = ({ allow }) => {
  const { user, initializing } = useAuth();
  const loc = useLocation();

  if (initializing) return null; // можна поставити скелетон

  // Гість -> на /login з next
  if (!user) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  const role = (user.role ?? null) as Role | null;

  // Немає ролі або роль не дозволена -> на «свою» домашню (або /)
  if (!role || !allow.includes(role)) {
    const home = role ? ROLE_HOME[role] : "/";
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
