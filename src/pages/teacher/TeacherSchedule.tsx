// src/pages/teacher/TeacherSchedule.tsx
import React, { useEffect, useState } from "react";
import { getTeacherSchedule, getTeacherByUserId } from "@/lib/api/teachers-api-real";
import { convertAssignmentsToLessons } from "@/lib/api/schedule-converters";
import type { Lesson } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import { getFirstTeachingMonday, getParity, getWeekIndex, getWeekStartFromIndex, formatWeekRange } from "@/lib/time/academicWeek";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";
import WeekPickerCard from "@/components/WeekPickerCard";
import WeekCalendar from "@/components/WeekCalendar";
import LessonCard from "@/components/LessonCard";
import Spinner from "@/components/Spinner";

const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();
  const semesterStart = React.useMemo(() => getFirstTeachingMonday(new Date()), []);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [week, setWeek] = useState<number>(() => getWeekIndex(new Date(), { startMonday: semesterStart }));

  const currentWeek = React.useMemo(() => getWeekIndex(new Date(), { startMonday: semesterStart }), [semesterStart]);
  const weekStart = React.useMemo(() => getWeekStartFromIndex(semesterStart, week), [semesterStart, week]);
  const parity: "odd" | "even" = React.useMemo(() => getParity(weekStart, { startMonday: semesterStart }), [weekStart, semesterStart]);
  const rangeText = React.useMemo(() => formatWeekRange(weekStart), [weekStart]);

  useEffect(() => {
    if (!user?.id) return;
    let alive = true;
    
    const loadSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Отримуємо teacher_id з user_id
        const teacher = await getTeacherByUserId(user.id);
        
        // Отримуємо розклад викладача
        const assignments = await getTeacherSchedule(teacher.teacherId);
        
        // Конвертуємо в формат Lesson
        const convertedLessons = await convertAssignmentsToLessons(assignments);
        
        if (alive) {
          setLessons(convertedLessons);
        }
      } catch (err) {
        console.error("Failed to load teacher schedule:", err);
        if (alive) {
          setError("Не вдалося завантажити розклад");
        }
      } finally {
        if (alive) {
          setLoading(false);
        }
      }
    };

    void loadSchedule();
    return () => { alive = false; };
  }, [user]);

  const totalWeeks = 16;

  if (loading) return <Spinner />;
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
          >
            Спробувати знову
          </button>
        </div>
      </div>
    );
  }

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
            lessons={lessons}
            parity={parity}
            weekStart={weekStart}
            renderLesson={(lesson, isToday) => (
              <LessonCard
                lesson={lesson}
                isToday={isToday}
                userRole="teacher"
                subjectId={lesson.id}
              />
            )}
          />
        </Reveal>
      </Crossfade>
    </div>
  );
};

export default TeacherSchedule;
