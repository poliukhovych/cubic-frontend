// src/pages/AuthProcessing.tsx
import React, { useEffect } from "react";
import { useAuth } from "@/types/auth";
import { useNavigate } from "react-router-dom";


const AuthProcessing: React.FC = () => {
    const { refreshMe, user } = useAuth();
    const nav = useNavigate();


    useEffect(() => {
        (async () => {
            await refreshMe();
        })();
    }, []);


    useEffect(() => {
        if (!user) return;
        if (user.status === "pending_profile"){ nav("/complete-profile", { replace: true }); return;}
        if (user.status === "pending_approval"){ nav("/", { replace: true }); return;}
        if (user.status === "disabled"){ nav("/", { replace: true }); return;}

        // If frontend stored a desired next path before OAuth, use it if allowed by role
        let next: string | null = null;
        try { next = sessionStorage.getItem('oauth_next'); sessionStorage.removeItem('oauth_next'); } catch {}

        const role = user.role;
        if (role === "student") {
            const fallback = "/student/dashboard";
            nav(next || fallback, { replace: true });
            return;
        }
        if (role === "teacher") {
            const fallback = "/teacher/dashboard";
            nav(next || fallback, { replace: true });
            return;
        }
        if (role === "admin") {
            const fallback = "/admin/dashboard";
            nav(next || fallback, { replace: true });
            return;
        }


        // Fallback
        nav("/", { replace: true });
    }, [user]);


    return (
        <div className="max-w-md mx-auto card p-6 text-center">
            <div className="text-xl font-semibold mb-2">Завершуємо вхід…</div>
            <div className="text-[var(--muted)]">Перевіряємо ваш профіль і права доступу.</div>
        </div>
    );
};


export default AuthProcessing;