// src/pages/teacher/TeacherSchedule.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchTeacherSchedule } from "@/lib/fakeApi/teacher";
import type { TeacherSchedule as T } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import {
  getFirstTeachingMonday,
  getParity,
  getWeekIndex,
  getWeekStartFromIndex,
  formatWeekRange,
} from "@/lib/time/academicWeek";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";
import WeekPickerCard from "@/components/WeekPickerCard";
import ScheduleWeek from "@/components/ScheduleWeek";

const TeacherSchedule: React.FC = () => {
const { user } = useAuth();
  const semesterStart = React.useMemo(
    () => getFirstTeachingMonday(new Date()),
    []
  );

  const [data, setData] = useState<T | null>(null);

  const [week, setWeek] = useState<number>(() =>
    getWeekIndex(new Date(), { startMonday: semesterStart })
  );

  const weekStart = React.useMemo(
    () => getWeekStartFromIndex(semesterStart, week),
    [semesterStart, week]
  );

  // 🔹 ВАЖЛИВО: парність тепер від обраного тижня
  const parity: "odd" | "even" = React.useMemo(
    () => getParity(weekStart, { startMonday: semesterStart }),
    [weekStart, semesterStart]
  );

  const rangeText = React.useMemo(() => formatWeekRange(weekStart), [weekStart]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchTeacherSchedule(user.id).then((res) => { if (alive) setData(res); });
    return () => { alive = false; };
  }, [user]);

  // коректуємо межі week за totalWeeks, коли завантажили дані
  useEffect(() => {
    if (!data || !(data as any).totalWeeks) return;
    const total = (data as any).totalWeeks as number;
    setWeek((w) => Math.max(1, Math.min(total, w)));
  }, [data]);

  if (!data) return <div className="text-[var(--muted)]">Завантаження...</div>;
  const totalWeeks: number = (data as any).totalWeeks ?? 16;

  return (
    <div className="space-y-4">
      {/* 1) Заголовок (аналогічно студенту, з анімаціями) */}
      <Reveal className="relative z-10 flex items-center justify-center text-center" delayMs={120} y={10} opacityFrom={0}>
        <div className="text-2xl font-semibold">
          Мій розклад
        </div>
      </Reveal>

      {/* 2) Єдиний «календар»-селектор тижня — у власному компоненті */}
      <Reveal y={0} blurPx={6} opacityFrom={0} delayMs={80}>
        <WeekPickerCard
          week={week}
          totalWeeks={totalWeeks}
          rangeText={rangeText}
          onChange={setWeek}
          titleCenter={
            <div className="text-center text-sm text-[var(--muted)]">
              {parity === "odd" ? "Непарний тиждень" : "Парний тиждень"}
            </div>
          }
        />
      </Reveal>

      {/* 3) Тижнева сітка — використовуємо той самий ScheduleWeek, що й у студента */}
      {/*    Передаємо parity та weekStart, щоб підсвітка «сьогодні» працювала коректно */}
      <Crossfade stateKey={`${week}-${parity}`}>
        <Reveal y={0} blurPx={8} opacityFrom={0} delayMs={120}>
          {/* ✅ тепер ScheduleWeek отримає правильну парність */}
          <ScheduleWeek lessons={data.lessons} parity={parity} weekStart={weekStart} />
        </Reveal>
      </Crossfade>
    </div>
  );
};

export default TeacherSchedule;
