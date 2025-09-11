// src/pages/student/StudentSchedule.tsx
import React, { useEffect, useState } from "react";
import { fetchStudentSchedule } from "@/lib/fakeApi/student";
import type { StudentSchedule as T } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import ScheduleWeek from "@/components/ScheduleWeek";
import { getWeekIndex } from "@/lib/time/academicWeek";
import WeekDots from "@/components/WeekDots";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";

const StudentSchedule: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [week, setWeek] = useState<number>(() => getWeekIndex());
  const parity: "odd" | "even" = week % 2 === 1 ? "odd" : "even";

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchStudentSchedule(user.id).then((res) => { if (alive) setData(res); });
    return () => { alive = false; };
  }, [user]);

  useEffect(() => {
    if (!data || !(data as any).totalWeeks) return;
    const total = (data as any).totalWeeks as number;
    setWeek((w) => Math.max(1, Math.min(total, w)));
  }, [data]);

  if (!data) return <div className="text-[var(--muted)]">Завантаження...</div>;
  const totalWeeks: number = (data as any).totalWeeks ?? 16;

  return (
    <div className="space-y-4">
      {/* 1) Заголовок */}
      <Reveal
  className="relative z-10 flex items-center justify-center text-center"
  delayMs={120}
  y={10}
  opacityFrom={0}
>
  <div className="text-2xl font-semibold">
    Мій розклад — {data.group.name}{data.group.subgroup ? `/${data.group.subgroup}` : ""}
  </div>
</Reveal>


      {/* 2) Панель з вибором тижня */}
      <Reveal y={0} blurPx={6} opacityFrom={0} delayMs={80}>
  <div className="glasscard rounded-2xl p-4 space-y-3">
    {/* 👉 тепер центрований текст і більший розмір */}
    <div className="text-center text-lg font-medium">
      Тиждень: #{week} ({parity === "odd" ? "непарний" : "парний"})
    </div>

    {/* dots під написом */}
    <WeekDots total={totalWeeks} value={week} onChange={setWeek} />
  </div>
</Reveal>


      {/* 3) Сітка з днями — вся разом (і при перемиканні тижня теж разом) */}
      {/* тут crossfade */}
      <Crossfade stateKey={week}>
        <Reveal y={0} blurPx={8} opacityFrom={0} delayMs={120}>
          <ScheduleWeek lessons={data.lessons} parity={parity} />
        </Reveal>
      </Crossfade>
    </div>
  );
};

export default StudentSchedule;
