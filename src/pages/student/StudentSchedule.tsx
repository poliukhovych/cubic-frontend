// src/pages/student/StudentSchedule.tsx
import React, { useEffect, useState } from "react";
import { getStudentSchedule, getStudentByUserId } from "@/lib/api/students-api";
import { convertAssignmentsToLessons } from "@/lib/api/schedule-converters";
import type { Lesson } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import { formatWeekRange, getFirstTeachingMonday, getParity, getWeekIndex, getWeekStartFromIndex } from "@/lib/time/academicWeek";
import { Calendar } from "lucide-react";
import WeekPickerCard from "@/components/WeekPickerCard";
import WeekCalendar from "@/components/WeekCalendar";
import LessonCard from "@/components/LessonCard";
import { motion, AnimatePresence } from "framer-motion";
import Spinner from "@/components/Spinner";

const StudentSchedule: React.FC = () => {
  const { user } = useAuth();
  const semesterStart = React.useMemo(
    () => getFirstTeachingMonday(new Date()),
    []
  );
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    if (!user?.id) return;
    
    let alive = true;
    
    const loadSchedule = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Отримуємо student_id з user_id
        const student = await getStudentByUserId(user.id);
        
        // Отримуємо розклад з бекенду
        const assignments = await getStudentSchedule(student.studentId);
        
        // Конвертуємо в формат Lesson
        const convertedLessons = await convertAssignmentsToLessons(assignments);
        
        if (alive) {
          setLessons(convertedLessons);
        }
      } catch (err) {
        console.error("Failed to load student schedule:", err);
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

  // Отримуємо групу з першого заняття (якщо є)
  const firstLesson = lessons[0];
  const groupName = firstLesson?.group?.name || "Група";
  const subgroup = firstLesson?.group?.subgroup;

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
            Мій розклад — {groupName}{subgroup ? `/${subgroup}` : ""}
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
            lessons={lessons} 
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
