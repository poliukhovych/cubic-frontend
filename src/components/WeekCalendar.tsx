// src/components/WeekCalendar.tsx
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { formatDM, getWeekDates } from "@/lib/time/academicWeek";
import { Calendar } from "lucide-react";

// Import the Lesson type from the schedule
import type { Lesson } from "@/types/schedule";

// Day model
const weekdays = [
  { k: 1, label: "Пн" },
  { k: 2, label: "Вт" },
  { k: 3, label: "Ср" },
  { k: 4, label: "Чт" },
  { k: 5, label: "Пт" },
  { k: 6, label: "Сб" },
  { k: 7, label: "Нд" },
];

type Props = {
  lessons: Lesson[];
  parity: "odd" | "even";
  weekStart: Date;
  renderLesson: (lesson: Lesson, isToday: boolean) => React.ReactNode;
};

// Helper for comparing dates
function isSameYmd(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

const WeekCalendar: React.FC<Props> = ({ lessons, parity, weekStart, renderLesson }) => {
  const days = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const today = new Date();

  // Filter by parity
  const visibleLessons = useMemo(
    () => lessons.filter((l) => l.parity === "any" || l.parity === parity),
    [lessons, parity]
  );

  // Group by day
  const byDay = useMemo(() => {
    const m = new Map<number, Lesson[]>();
    weekdays.forEach((w) => m.set(w.k, []));
    visibleLessons.forEach((l) => m.get(l.weekday)!.push(l));
    for (const arr of m.values())
      arr.sort((a, b) => a.time.start.localeCompare(b.time.start));
    return m;
  }, [visibleLessons]);

  // No additional animation variables needed

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {weekdays.map((wd, i) => {
        const dateObj = days[i];
        const dateShort = formatDM(dateObj);
        const isToday = isSameYmd(dateObj, today);
        const lessons = byDay.get(wd.k)!;

        return (
          <motion.div
            key={wd.k}
            className={`glass glass-card relative overflow-hidden rounded-xl p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-500 ${
              isToday ? "border-primary/30" : ""
            }`}
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ 
              delay: i * 0.04, 
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            {/* Day header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary opacity-80" />
                <span className="font-semibold">{wd.label}, {dateShort}</span>
              </div>
              {isToday && (
                <motion.span
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05, duration: 0.5 }}
                  className="px-2 py-0.5 text-xs rounded-full bg-primary/15 text-primary font-medium"
                >
                  сьогодні
                </motion.span>
              )}
            </div>

            {/* Lessons container */}
            <div className="space-y-3 relative">
              {lessons.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="text-muted-foreground text-sm py-2 px-1"
                >
                  Немає пар
                </motion.div>
              )}

              {lessons.map((lesson, index) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.1 + index * 0.05,
                    duration: 0.5,
                    ease: [0.22, 1, 0.36, 1]
                  }}
                >
                  {renderLesson(lesson, isToday)}
                </motion.div>
              ))}
            </div>

            {/* Today indicator line */}
            {isToday && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="absolute left-0 bottom-0 h-[2px] w-full bg-gradient-to-r from-primary/30 via-primary/70 to-primary/30"
              ></motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
};

export default WeekCalendar;