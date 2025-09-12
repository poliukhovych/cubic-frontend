// src/pages/Home.tsx
import React from "react";
import { useAuth } from "@/types/auth";
import { Link } from "react-router-dom";
import bgImage from "@/assets/bg-5.jpg";
import Reveal from "@/components/Reveal";

// ✅ імпортуємо дашборди
import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

const Home: React.FC = () => {
  const { user } = useAuth();

  // Неавторизованим — герой та CTA (як у тебе)
  if (!user) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto px-4">
        <Reveal className="relative h-[60vh] rounded-2xl overflow-hidden shadow-lg text-white" y={12}>
          <Reveal
            as="div"
            className="absolute inset-0"
            blurPx={14}
            opacityFrom={0.15}
            delayMs={0}
            y={0}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0" style={{ background: "var(--hero-dim)" }} />
          </Reveal>

          <Reveal
            className="relative z-10 max-w-2xl mx-auto h-full flex flex-col items-center justify-center px-4 text-center"
            delayMs={120}
            y={10}
            opacityFrom={0}
          >
            <h1 className="text-5xl font-bold mb-4">Cubic Helper</h1>
            <p className="text-lg leading-relaxed">
              Сервіс для студентів та викладачів факультету: персональний розклад,
              домашні завдання та зручне управління навчальним процесом.
            </p>
          </Reveal>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="mt-4 glasscard px-6 py-5 justify-between" delayMs={60}>
            <h2 className="text-xl font-semibold">Для студентів</h2>
            <p className="mt-2 text-[var(--muted)]">Персональний розклад, статуси домашніх завдань, контроль прогресу.</p>
          </Reveal>
          <Reveal className="mt-4 glasscard px-6 py-5 justify-between" delayMs={120}>
            <h2 className="text-xl font-semibold">Для викладачів</h2>
            <p className="mt-2 text-[var(--muted)]">Керування групами та підгрупами, створення завдань і контроль виконання.</p>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal delayMs={180}>
            <Link to="/login" className="block p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center font-semibold text-lg leading-none bg-[var(--primary)]/80 text-white">
              Увійти
            </Link>
          </Reveal>
          <Reveal delayMs={240}>
            <Link to="/register" className="block p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center font-semibold text-lg leading-none bg-[var(--primary)]/80 text-white">
              Зареєструватися
            </Link>
          </Reveal>
        </div>
      </div>
    );
  }

  // ✅ Авторизованим — віддаємо рольовий дашборд прямо на "/"
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
