// src/components/HomeworkWeek.tsx
import React, { useMemo } from "react";
import type { HomeworkTask } from "@/types/homework";
import WeekPickerCard from "@/components/WeekPickerCard";              // ⬅️ додано
import {
  getWeekIndexFromStart,
  getWeekStartFromIndex,
  getWeekDates,
  formatDM,
  formatWeekRange,
  getParity
} from "@/lib/time/academicWeek";

function parseYmdLocal(ymd: string): Date {
  const [y, m, d] = ymd.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
function truncate(s: string, max = 140) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}
function isSameYmd(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

type Props = {
  tasks: HomeworkTask[];
  week: number;                    // обраний тиждень (1-based)
  setWeek: (w: number) => void;
  totalWeeks?: number;             // з бекенду
  semesterStart: Date;             // одна точка відліку
};

const weekdays = [
  { k: 1, label: "Пн" }, { k: 2, label: "Вт" }, { k: 3, label: "Ср" },
  { k: 4, label: "Чт" }, { k: 5, label: "Пт" }, { k: 6, label: "Сб" }, { k: 7, label: "Нд" },
];

const HomeworkWeek: React.FC<Props> = ({ tasks, week, setWeek, totalWeeks, semesterStart }) => {
  const computedTotalWeeks = totalWeeks && totalWeeks > 0 ? totalWeeks : 16;

  // ✅ дати вибраного тижня
  const weekStart = useMemo(() => getWeekStartFromIndex(semesterStart, week), [semesterStart, week]);
  const weekDays = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekRangeText = useMemo(() => formatWeekRange(weekStart), [weekStart]);

  const today = new Date();
  const currentWeekOfToday = getWeekIndexFromStart(semesterStart, today, computedTotalWeeks);
  const parity: "odd" | "even" = React.useMemo(
    () => getParity(weekStart, { startMonday: semesterStart }),
    [weekStart, semesterStart]
  );
  // групування за днем всередині вибраного тижня
  const byDay = useMemo(() => {
    const map = new Map<number, HomeworkTask[]>();
    weekdays.forEach(wd => map.set(wd.k, []));
    tasks.forEach(t => {
      const d = parseYmdLocal(t.dueDate); // локально, без UTC-зсуву
      const w = getWeekIndexFromStart(semesterStart, d, computedTotalWeeks);
      if (w !== week) return;
      const day = ((d.getDay() + 6) % 7) + 1; // 1=Пн ... 7=Нд
      map.get(day)!.push(t);
    });
    for (const arr of map.values()) arr.sort((a,b) => a.dueDate.localeCompare(b.dueDate));
    return map;
  }, [tasks, week, semesterStart, computedTotalWeeks]);

  return (
    <div className="space-y-4">
      {/* 🔹 Уніфікований селектор тижня */}
      <WeekPickerCard
        week={week}
        totalWeeks={computedTotalWeeks}
        rangeText={weekRangeText}
        onChange={(w) => setWeek(Math.max(1, Math.min(computedTotalWeeks, w)))}
        titleCenter={
            <div className="text-center text-sm text-[var(--muted)]">
              {parity === "odd" ? "Непарний тиждень" : "Парний тиждень"}
            </div>
          }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {weekdays.map((wd, i) => {
          const dateObj = weekDays[i]; // Пн=0 ... Нд=6
          const dateShort = formatDM(dateObj);
          const isToday = currentWeekOfToday === week && isSameYmd(dateObj, today);
          return (
            <div
              key={wd.k}
              className={[
                isToday
                  ? "glasscardToday rounded-xl p-4 card-smooth hover-shadow"
                  : "glasscard rounded-xl p-4 card-smooth hover-shadow"
              ].join(" ")}
              aria-current={isToday ? "date" : undefined}
            >
              <div className="font-semibold mb-3 flex items-center gap-2">
                <span>{wd.label}, {dateShort}</span>
                {isToday && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                    сьогодні
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {byDay.get(wd.k)!.length === 0 && (
                  <div className="text-[var(--muted)] text-sm">Нічого не здається</div>
                )}
                {byDay.get(wd.k)!.map((t, idx) => (
                  <a
                    key={`${t.id}-${idx}`} // унікальний key на випадок кількох задач в один день
                    href={t.classroomUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block glasscard rounded-xl p-3 smooth hover-lift pressable"
                    title="Відкрити завдання у Classroom"
                  >
                    <div className="text-sm text-[var(--muted)]">{t.subject}</div>
                    <div className="font-medium">{truncate(t.text, 160)}</div>
                    <div className="text-sm text-[var(--muted)]">
                      До {parseYmdLocal(t.dueDate).toLocaleDateString()}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomeworkWeek;
