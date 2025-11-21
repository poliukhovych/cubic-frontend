// src/pages/student/StudentSchedule.tsx
import React, { useEffect, useState } from "react";
import { fetchStudentSchedule } from "@/lib/fakeApi/student";
import type { StudentSchedule as T } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import { formatWeekRange, getFirstTeachingMonday, getParity, getWeekIndex, getWeekStartFromIndex } from "@/lib/time/academicWeek";
import { Calendar } from "lucide-react";
import WeekPickerCard from "@/components/WeekPickerCard";
import WeekCalendar from "@/components/WeekCalendar";
import LessonCard from "@/components/LessonCard";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="space-y-6">
      {/* 1) Заголовок */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-center text-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <Calendar className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">
            Мій розклад — {data.group.name}{data.group.subgroup ? `/${data.group.subgroup}` : ""}
          </h1>
        </div>
      </motion.div>

      {/* 2) Панель з вибором тижня */}
      <motion.div 
        initial={{ opacity: 0, y: 0, filter: "blur(6px)" }} 
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
        transition={{ delay: 0.08 }}
      >
        <WeekPickerCard
          week={week}
          totalWeeks={totalWeeks}
          rangeText={rangeText}
          onChange={setWeek}
          currentWeek={Math.min(currentWeek, totalWeeks)}
          titleCenter={
            <div className="text-center text-sm text-muted-foreground">
              {parity === "odd" ? "Непарний тиждень" : "Парний тиждень"}
            </div>
          }
        />
      </motion.div>

      {/* 3) Сітка з днями — вся разом (і при перемиканні тижня теж разом) */}
      <AnimatePresence mode="wait">
        <motion.div
          key={week}
          initial={{ opacity: 0, y: 0, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 0, filter: "blur(8px)" }}
          transition={{ duration: 0.3 }}
        >
          <WeekCalendar 
            lessons={data.lessons} 
            parity={parity} 
            weekStart={weekStart} 
            renderLesson={(lesson, isToday) => (
              <LessonCard 
                lesson={lesson} 
                isToday={isToday} 
                userRole="student"
              />
            )}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default StudentSchedule;
