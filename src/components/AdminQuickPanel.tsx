// src/components/AdminQuickPanel.tsx

import React, { useEffect, useState } from "react";
import { fetchAdminStats as fetchAdminStatsReal } from "@/lib/api/admin";
import {
  generateScheduleApi,
  fetchSchedulesApi,
  reoptimizeScheduleApi,
  type GenerateSchedulePayload,
} from "@/lib/api/schedule-api";
import { Users, BookOpen, Archive, IdCard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ViewModeToggle from "./ViewModeToggle";
import Toast from "@/components/Toast";
import type { ViewMode } from "@/lib/utils/prefs";
import ExportButtons from "@/components/ExportButtons";
import Reveal from "./Reveal";
import Crossfade from "./Crossfade";

type Stats = { students: number; teachers: number; courses: number };

// 🔹 Захардкоджені параметри (можна винести в конфіг пізніше)
const buildSolvePayload = (): GenerateSchedulePayload => ({
  policy: {
    soft_weights: {
      daily_load_balance: 10,
      windows_penalty: 20,
      teacher_avoid_slots_penalty: 50,
      teacher_preferred_days_penalty: 15,
    },
  },
  params: {
    timeLimitSec: 20,
  },
  schedule_label: `Розклад ${new Date().toLocaleDateString("uk-UA")} ${new Date().toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit" })}`,
});

const StatTile: React.FC<{
  to: string;
  title: string;
  count?: number;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ to, title, count, subtitle, icon }) => (
  <Link to={to} className="glasscard p-5 hover-lift pressable">
    <div className="flex items-start justify-between">
      <div className="text-3xl mb-2">{icon ?? "📊"}</div>
      {typeof count === "number" && (
        <div className="text-4xl font-semibold leading-none">{count}</div>
      )}
    </div>
    <div className="font-semibold text-lg">{title}</div>
    {subtitle && (
      <div className="text-sm text-[var(--muted)] mt-1">{subtitle}</div>
    )}
  </Link>
);

const AdminQuickPanel: React.FC<{
  value: ViewMode;
  onChange: (m: ViewMode) => void;
  onScheduleGenerated?: (scheduleId: string) => void; // 🔹 NEW: callback після генерації
}> = ({ value, onChange, onScheduleGenerated }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const nav = useNavigate();
  const [isMobile, setIsMobile] = useState(false);
  const [solving, setSolving] = useState(false);

  useEffect(() => {
    fetchAdminStatsReal()
      .then((s) =>
        setStats({
          students: s.students_total,
          teachers: s.teachers_total,
          courses: s.courses_total,
        }),
      )
      .catch(() => setStats(null));
  }, []);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSolveClick = async () => {
    if (solving) return;
    setSolving(true);

    try {
      const payload = buildSolvePayload();

      console.log("🚀 Генерація розкладу...", payload);

      // [FLOW] Backend POST /api/schedules/generate запуск рішення і повертає message + assignments.
      const response = await generateScheduleApi(payload);

      console.log("✅ Розклад згенеровано:", response);

      const scheduleArray = response.schedule || [];

      // [FLOW] Зберігаємо останню відповідь генератора у localStorage, щоб FacultyScheduleTable могла її підхопити.
      localStorage.setItem(
        "last_generated_schedule",
        JSON.stringify({
          message: response.message,
          schedule: scheduleArray,
        })
      );

      flash(
        `Розклад успішно створено! Згенеровано ${scheduleArray.length} призначень.`
      );

      // 🔹 Викликаємо callback, щоб батьківський компонент оновив таблицю
      if (onScheduleGenerated) {
        onScheduleGenerated("latest");
      }
    } catch (e: any) {
      console.error("❌ Помилка генерації розкладу:", e);
      const errorMsg = e?.detail || e?.message || "Не вдалося згенерувати розклад";
      flash(`Помилка: ${errorMsg}`);
    } finally {
      setSolving(false);
    }
  };

  // Закріплені пари беруться з БД (збереженого активного розкладу), решта перераховується
  const handleOptimizeClick = async () => {
    if (solving) return;
    if (
      !window.confirm(
        "Закріплені пари лишаться на місці, решту розкладу буде складено заново.\n" +
          "Враховуються лише збережені зміни — незбережені буде втрачено. Продовжити?"
      )
    )
      return;
    setSolving(true);
    try {
      const active = (await fetchSchedulesApi()).find((s) => s.isActive);
      if (!active) {
        flash("Немає активного розкладу — спершу натисніть «Вирішити»");
        return;
      }
      const response = await reoptimizeScheduleApi(active.scheduleId, buildSolvePayload());
      const scheduleArray = response.schedule || [];
      const pinned = scheduleArray.filter((a) => a.pinned).length;
      flash(`Розклад оптимізовано: ${scheduleArray.length} пар, закріплених ${pinned}.`);
      onScheduleGenerated?.("latest");
    } catch (err) {
      const e = err as { detail?: string; message?: string };
      console.error("❌ Помилка оптимізації розкладу:", e);
      flash(`Помилка: ${e?.detail || e?.message || "Не вдалося оптимізувати розклад"}`);
    } finally {
      setSolving(false);
    }
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {!isMobile && (
          <ViewModeToggle
            value={value}
            onChange={(m) => {
              onChange(m);
              flash(
                m === "view"
                  ? "Увімкнено режим перегляду"
                  : "Увімкнено режим редагування",
              );
            }}
          />
        )}
        <StatTile
          to="/admin/students"
          title="Студенти"
          subtitle="Перегляд / керування"
          count={stats?.students}
          icon={<Users className="h-8 w-8 text-primary" />}
        />
        <StatTile
          to="/admin/teachers"
          title="Викладачі"
          subtitle="Список і розклади"
          count={stats?.teachers}
          icon={<Users className="h-8 w-8 text-primary" />}
        />
        <StatTile
          to="/admin/courses"
          title="Курси"
          subtitle="Предмети та групи"
          count={stats?.courses}
          icon={<BookOpen className="h-8 w-8 text-primary" />}
        />
        <StatTile
          to="/admin/archive"
          title="Архів"
          subtitle="Знімки, історія, PDF"
          icon={<Archive className="h-8 w-8 text-primary" />}
        />
        <StatTile
          to="/admin/registrations"
          title="Заявки на реєстрацію"
          subtitle="Перегляд / керування"
          icon={<IdCard className="h-8 w-8 text-primary" />}
        />
      </div>

      {!isMobile && (
        <div className="mt-4">
          <Crossfade stateKey={value}>
            {value === "view" ? (
              <Reveal y={6} opacityFrom={0}>
                <ExportButtons
                  onExportAll={() => flash("Експорт усього розкладу")}
                  onExportCourse={() => flash("Експорт обраного курсу")}
                  onExportLevel={() => flash("Експорт бакалаврів / магістрів")}
                />
              </Reveal>
            ) : (
              <Reveal y={6} opacityFrom={0}>
                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    className="btn py-3 rounded-2xl hover-shadow"
                    onClick={handleSolveClick}
                    disabled={solving}
                  >
                    {solving ? "Генеруємо..." : "Вирішити"}
                  </button>
                  <button
                    className="btn py-3 rounded-2xl hover-shadow"
                    onClick={handleOptimizeClick}
                    disabled={solving}
                  >
                    {solving ? "Зачекайте..." : "Оптимізувати"}
                  </button>
                  <button
                    className="btn py-3 rounded-2xl hover-shadow"
                    onClick={() => nav("/admin/logs")}
                  >
                    Логи
                  </button>
                </div>
              </Reveal>
            )}
          </Crossfade>
        </div>
      )}

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default AdminQuickPanel;
