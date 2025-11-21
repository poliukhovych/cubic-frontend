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


        // Active: route by role
        if (user.role === "student") {nav("/student/dashboard", { replace: true }); return;}
        if (user.role === "teacher") {nav("/teacher/dashboard", { replace: true }); return;}
        if (user.role === "admin") {nav("/admin/dashboard", { replace: true }); return;}


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