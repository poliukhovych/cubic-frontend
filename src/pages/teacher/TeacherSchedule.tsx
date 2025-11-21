// src/pages/teacher/TeacherSchedule.tsx
import React, { useEffect, useState } from "react";
import { fetchTeacherSchedule } from "@/lib/fakeApi/teacher";
import { useAuth } from "@/types/auth";
import { getFirstTeachingMonday, getParity, getWeekIndex, getWeekStartFromIndex, formatWeekRange } from "@/lib/time/academicWeek";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";
import WeekPickerCard from "@/components/WeekPickerCard";
import WeekCalendar from "@/components/WeekCalendar";
import LessonCard from "@/components/LessonCard";

const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();
  const semesterStart = React.useMemo(() => getFirstTeachingMonday(new Date()), []);

  const [data, setData] = useState<any | null>(null);
  const [week, setWeek] = useState<number>(() => getWeekIndex(new Date(), { startMonday: semesterStart }));

  const currentWeek = React.useMemo(() => getWeekIndex(new Date(), { startMonday: semesterStart }), [semesterStart]);
  const weekStart = React.useMemo(() => getWeekStartFromIndex(semesterStart, week), [semesterStart, week]);
  const parity: "odd" | "even" = React.useMemo(() => getParity(weekStart, { startMonday: semesterStart }), [weekStart, semesterStart]);
  const rangeText = React.useMemo(() => formatWeekRange(weekStart), [weekStart]);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchTeacherSchedule(user.id).then((res) => { if (alive) setData(res); });
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-center text-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Мій розклад</h1>
        </div>
      </motion.div>

      <Reveal y={0} blurPx={6} opacityFrom={0} delayMs={80}>
        <WeekPickerCard
          week={week}
          totalWeeks={totalWeeks}
          rangeText={rangeText}
          onChange={setWeek}
          currentWeek={Math.min(currentWeek, totalWeeks)}
          titleCenter={<div className="text-center text-sm text-[var(--muted)]">{parity === "odd" ? "Непарний тиждень" : "Парний тиждень"}</div>}
        />
      </Reveal>

      <Crossfade stateKey={`${week}-${parity}`}>
        <Reveal y={0} blurPx={8} opacityFrom={0} delayMs={120}>
          <WeekCalendar
            lessons={data.lessons}
            parity={parity}
            weekStart={weekStart}
            renderLesson={(lesson, isToday) => (
              <LessonCard
                lesson={lesson}
                isToday={isToday}
                userRole="teacher"
                subjectId={lesson.id} // For teachers, we use the lesson ID as the subject ID
              />
            )}
          />
        </Reveal>
      </Crossfade>
    </div>
  );
};

export default TeacherSchedule;
