// src/pages/student/StudentSchedule.tsx
import React, { useEffect, useState } from "react";
import { fetchStudentSchedule } from "@/lib/fakeApi/student";
import type { StudentSchedule as T } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import ScheduleWeek from "@/components/ScheduleWeek";
import { formatWeekRange, getFirstTeachingMonday, getParity, getWeekIndex, getWeekStartFromIndex } from "@/lib/time/academicWeek";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";
import WeekPickerCard from "@/components/WeekPickerCard";

const StudentSchedule: React.FC = () => {
  const { user } = useAuth();
const semesterStart = React.useMemo(
    () => getFirstTeachingMonday(new Date()),
    []
  );    const [data, setData] = useState<T | null>(null);

 const [week, setWeek] = useState<number>(() =>
    getWeekIndex(new Date(), { startMonday: semesterStart })
  );  
const weekStart = React.useMemo(
    () => getWeekStartFromIndex(semesterStart, week),
    [semesterStart, week]
  );
  const parity: "odd" | "even" = React.useMemo(
    () => getParity(weekStart, { startMonday: semesterStart }),
    [weekStart, semesterStart]
  );

  const rangeText = React.useMemo(() => formatWeekRange(weekStart), [weekStart]);
  const currentWeek = React.useMemo(() => getWeekIndex(new Date(), { startMonday: semesterStart }), [semesterStart]);

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
        <WeekPickerCard
          week={week}
          totalWeeks={totalWeeks}
          rangeText={rangeText}
          onChange={setWeek}
          currentWeek={Math.min(currentWeek, totalWeeks)}

          titleCenter={
            <div className="text-center text-sm text-[var(--muted)]">
              {parity === "odd" ? "Непарний тиждень" : "Парний тиждень"}
            </div>
          }
        />
      </Reveal>


      {/* 3) Сітка з днями — вся разом (і при перемиканні тижня теж разом) */}
      {/* тут crossfade */}
<Crossfade stateKey={week}>
        <Reveal y={0} blurPx={8} opacityFrom={0} delayMs={120}>
          {/* ✅ передаємо parity та weekStart */}
          <ScheduleWeek lessons={data.lessons} parity={parity} weekStart={weekStart} />
        </Reveal>
      </Crossfade>

    </div>
  );
};

export default StudentSchedule;
