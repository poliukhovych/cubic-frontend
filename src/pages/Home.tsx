// src/pages/Home.tsx
import React from "react";
import { useAuth } from "@/types/auth";
import { AdminTiles, StudentTiles, TeacherTiles } from "@/components/DashboardTiles";
import { Link } from "react-router-dom";
import bgImage from "@/assets/bg-5.jpg";
import Reveal from "@/components/Reveal";

const Home: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto px-4">
        {/* Hero контейнер легенько під’їжджає вгору */}
        <Reveal className="relative h-[60vh] rounded-2xl overflow-hidden shadow-lg text-white" y={12}>
          {/* ✅ Лише фон: входить прозорим і розмитим */}
          <Reveal
            as="div"
            className="absolute inset-0"
            blurPx={14}        // стартове розмиття
            opacityFrom={0.15} // стартова прозорість
            delayMs={0}
            y={0}              // без зсуву для фону
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            {/* затемнення хай теж плавно проявляється */}
            <div className="absolute inset-0 bg-black/60" />
          </Reveal>

          {/* Текст: окремо, без blur, з невеликою затримкою */}
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

        {/* далі блоки Features/CTA — можна лишити як було, або додати невеликий delayMs */}
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="mt-4 rounded-2xl border border-[var(--border)] glasscard px-6 py-5  justify-between" delayMs={60}>
            <h2 className="text-xl font-semibold">Для студентів</h2>
            <p className="mt-2 text-[var(--muted)]">Персональний розклад, статуси домашніх завдань, контроль прогресу.</p>
          </Reveal>
          <Reveal className="mt-4 rounded-2xl border border-[var(--border)] glasscard px-6 py-5  justify-between" delayMs={120}>
            <h2 className="text-xl font-semibold">Для викладачів</h2>
            <p className="mt-2 text-[var(--muted)]">Керування групами та підгрупами, створення завдань і контроль виконання.</p>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Reveal delayMs={60}>
            <Link to="/login" className="block card p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center font-semibold text-lg leading-none bg-[var(--primary)]/95 text-white">
              Увійти
            </Link>
          </Reveal>
          <Reveal delayMs={120}>
            <Link to="/register" className="block card p-6 rounded-2xl shadow-md hover:shadow-lg transition text-center font-semibold text-lg leading-none bg-[var(--primary)]/95 text-white">
              Зареєструватися
            </Link>
          </Reveal>
        </div>
      </div>
    );
  }

  // Dashboard для авторизованих
  return (
    <div className="space-y-6">
      <Reveal
  className="relative z-10 flex items-center justify-center text-center"
  delayMs={120}
  y={10}
  opacityFrom={0}
>
  <div className="text-2xl font-semibold">Головна</div>
</Reveal>
      <Reveal delayMs={80}>
        {user.role === "student" && <StudentTiles />}
        {user.role === "teacher" && <TeacherTiles />}
        {user.role === "admin" && <AdminTiles />}
      </Reveal>
    </div>
  );
};

export default Home;
