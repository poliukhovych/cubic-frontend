// src/pages/CompleteProfile.tsx
import React, { useState } from "react";
import { useAuth, type Role } from "@/types/auth";
import { api } from "@/lib/api";
import { useNavigate } from "react-router-dom";


const CompleteProfile: React.FC = () => {
    const { user, refreshMe } = useAuth();
    const [role, setRole] = useState<Role>("student");
    const [submitting, setSubmitting] = useState(false);
    const nav = useNavigate();


    const submit = async () => {
        setSubmitting(true);
        try {
            await api.post("/auth/complete-profile", { role });
            await refreshMe();
            // Redirect decision after refresh
            if (!user) return nav("/", { replace: true });
            nav("/", { replace: true });
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="max-w-md mx-auto card p-6">
            <div className="text-xl font-semibold mb-4">Завершення профілю</div>
            <p className="text-[var(--muted)] mb-4">Оберіть вашу роль у системі.</p>
            <select className="input mb-4" value={role} onChange={e => setRole(e.target.value as Role)}>
                <option value="student">Студент</option>
                <option value="teacher">Викладач</option>
                {/* Адмін зазвичай не самопризначається — залиште прихованим або під invite. */}
            </select>
            <button className="btn-primary w-full" disabled={submitting} onClick={submit}>
                {submitting ? "Надсилаємо…" : "Підтвердити"}
            </button>
        </div>
    );
};


export default CompleteProfile;