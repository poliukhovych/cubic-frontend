// src/pages/student/StudentHomework.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchStudentHomework } from "@/lib/fakeApi/student";
import type { HomeworkTask } from "@/types/homework";
import { useAuth } from "@/types/auth";
import HomeworkList from "@/components/HomeworkList";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";
import HomeworkWeek from "@/components/HomeworkWeek";
import { getFirstTeachingMonday, getWeekIndex } from "@/lib/time/academicWeek";

function getISOWeek(date: Date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

const StudentHomework: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [mode, setMode] = useState<"list" | "week">("list");
  const semesterStart = React.useMemo(() => getFirstTeachingMonday(new Date()), []);
  const [week, setWeek] = useState<number>(() => getWeekIndex(new Date(), { startMonday: semesterStart }));
  const [totalWeeks, setTotalWeeks] = useState<number>(16);

useEffect(() => {
  if (!user) return;
  fetchStudentHomework(user.id).then(({ tasks, totalWeeks }) => {
    setTasks(tasks);
    setTotalWeeks(totalWeeks ?? 16);
    setWeek(w => Math.min(Math.max(1, w), totalWeeks ?? 16));
  });
}, [user]);

  const year = new Date().getFullYear();
  const dueSorted = useMemo(
    () => [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks]
  );

  return (
    <div className="space-y-4">
      <Reveal className="relative z-10 flex items-center justify-center text-center" delayMs={120} y={10} opacityFrom={0}>
        <div className="text-2xl font-semibold">Домашні завдання</div>
      </Reveal>

      <Reveal y={0} blurPx={6} opacityFrom={0} delayMs={80}>
        <div className="glasscard rounded-2xl p-2 flex gap-2 w-max mx-auto">
          <button
            className={[
              "px-4 py-2 rounded-xl transition",
              mode === "list" ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "hover:bg-[var(--muted)]/15"
            ].join(" ")}
            onClick={() => setMode("list")}
          >
            Список
          </button>
          <button
            className={[
              "px-4 py-2 rounded-xl transition",
              mode === "week" ? "bg-[var(--primary)] text-[var(--primary-contrast)]" : "hover:bg-[var(--muted)]/15"
            ].join(" ")}
            onClick={() => setMode("week")}
          >
            Тиждень
          </button>
        </div>
      </Reveal>

      <Crossfade stateKey={mode === "list" ? "list" : `week-${week}`}>
        {mode === "list" ? (
          <Reveal y={10} blurPx={8} opacityFrom={0} delayMs={100}>
            <HomeworkList tasks={dueSorted} />
          </Reveal>
        ) : (
          <Reveal y={10} blurPx={8} opacityFrom={0} delayMs={100}>
           <HomeworkWeek
  tasks={tasks}
  week={week}
  setWeek={setWeek}
  totalWeeks={totalWeeks}
  semesterStart={semesterStart}   // 🔹 однакова точка відліку
/>

          </Reveal>
        )}
      </Crossfade>
    </div>
  );
};

export default StudentHomework;
