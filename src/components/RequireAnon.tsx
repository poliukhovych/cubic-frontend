// src/components/RequireAnon.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/types/auth";
import { ROLE_HOME } from "@/components/roleHome";

const RequireAnon: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, initializing } = useAuth();

  if (initializing) return null;

  if (user?.role) {
    return <Navigate to={ROLE_HOME[user.role]} replace />;
  }

  // якщо ролі ще нема (pending_profile) — можна лишити доступним /login або
  // редіректити на /complete-profile, але поки просто показуємо children
  return <>{children}</>;
};

export default RequireAnon;
