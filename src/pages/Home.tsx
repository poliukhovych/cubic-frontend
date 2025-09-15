// src/pages/Home.tsx
import React from "react";
import { useAuth } from "@/types/auth";
import { Link } from "react-router-dom";
import bgImage from "@/assets/bg-5.jpg";
import Reveal from "@/components/Reveal";
import { LogIn, UserPlus } from "lucide-react";

import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

const Home: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto px-4">
        {/* HERO */}
        <Reveal className="relative hover-lift h-[60vh] rounded-2xl overflow-hidden shadow-lg text-white" y={12}>
          <Reveal as="div" className="absolute inset-0" blurPx={14} opacityFrom={0.15} delayMs={0} y={0}>
            <div
              className="w-full h-full"
              style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="absolute inset-0" style={{ background: "var(--hero-dim)" }} />
          </Reveal>

          <Reveal
            className="relative z-10 max-w-2xl mx-auto h-full flex flex-col items-center justify-center px-4 text-center"
            delayMs={120}
            y={10}
            opacityFrom={0}
          >
            <h1 className="text-5xl font-bold mb-4 hover-lift">Cubic Helper</h1>
            <p className="text-lg leading-relaxed hover-lift">
              Сервіс для студентів та викладачів факультету: персональний розклад,
              домашні завдання та зручне управління навчальним процесом.
            </p>
          </Reveal>
        </Reveal>

        {/* Інформаційні картки про ролі (без дій) */}
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="glasscard px-6 py-5 hover-lift" delayMs={60}>
            <h2 className="text-xl font-semibold">Для студентів</h2>
            <p className="mt-2 text-[var(--muted)]">
              Персональний розклад, статуси домашніх завдань, контроль прогресу.
            </p>
          </Reveal>
          <Reveal className="glasscard px-6 py-5 hover-lift" delayMs={120}>
            <h2 className="text-xl font-semibold">Для викладачів</h2>
            <p className="mt-2 text-[var(--muted)]">
              Керування групами та підгрупами, створення завдань і контроль виконання.
            </p>
          </Reveal>
        </div>

        {/* ✅ Чітка CTA-панель (дії для всіх) */}
        <Reveal
          className="glasscard p-5 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 hover-lift"
          delayMs={80}
        >
          <div className="md:flex-1">
            <div className="text-sm uppercase tracking-wide text-[var(--muted)]">Почніть тут</div>
            <div className="text-lg md:text-xl">У вас уже є акаунт чи ви вперше?</div>
          </div>

          <div className="flex-1 flex flex-col md:flex-row gap-3">
            <Link
              to="/login"
              className="hover-lift flex-1 inline-flex items-center justify-center gap-2 p-4 rounded-xl font-semibold bg-[var(--primary)]/80 text-white hover:opacity-95"
              aria-label="Увійти до акаунта"
              title="Увійти до акаунта"
            >
              <LogIn className="hover-lift w-5 h-5" />
              Увійти
            </Link>

            {/* роздільник лише на мобілці, щоб не зливалося */}
            <div className=" md:hidden flex items-center justify-center text-[var(--muted)] text-sm">або</div>

            <Link
              to="/register"
              className="hover-lift flex-1 inline-flex items-center justify-center gap-2 p-4 rounded-xl font-semibold bg-[var(--surface-2)]/60 text-white ring-1 ring-[var(--border)] hover:bg-[var(--surface)]"
              aria-label="Створити новий акаунт"
              title="Створити новий акаунт"
            >
              <UserPlus className="hover-lift w-5 h-5" />
              Зареєструватися
            </Link>
          </div>
        </Reveal>
      </div>
    );
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
    default:
      return <StudentDashboard />;
  }
};

export default Home;
