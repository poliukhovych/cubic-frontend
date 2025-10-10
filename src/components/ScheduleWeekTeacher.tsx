// src/components/ScheduleWeekTeacher.tsx
import React, { useMemo } from "react";
import { formatDM, getWeekDates } from "@/lib/time/academicWeek"; // якщо вже є утиліти
import { Video, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

type Lesson = {
  id: string;
  weekday: 1|2|3|4|5|6|7;
  time: { start: string; end: string };
  subject: string;
  subjectId: string;
  location: string;
  group: { id: string; name: string; subgroup?: "a"|"b"|null };
  parity: "any"|"even"|"odd";
  meetingUrl?: string;
};

type Props = {
  lessons: Lesson[];
  parity: "odd" | "even";
  weekStart: Date;
  
};

const weekdays = [
  { k: 1, label: "Пн" }, { k: 2, label: "Вт" }, { k: 3, label: "Ср" },
  { k: 4, label: "Чт" }, { k: 5, label: "Пт" }, { k: 6, label: "Сб" }, { k: 7, label: "Нд" },
];

// ✅ локальний хелпер для порівняння дат "рік-місяць-день"
function isSameYmd(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}


const ScheduleWeekTeacher: React.FC<Props> = ({ lessons, parity, weekStart }) => {
  const days = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const today = new Date(); // ✅

  // фільтруємо по парності
  const visible = useMemo(
    () => lessons.filter(l => l.parity === "any" || l.parity === parity),
    [lessons, parity]
  );

  // групуємо по днях
  const byDay = useMemo(() => {
    const m = new Map<number, Lesson[]>();
    weekdays.forEach(w => m.set(w.k, []));
    visible.forEach(l => m.get(l.weekday)!.push(l));
    for (const arr of m.values()) arr.sort((a,b) => a.time.start.localeCompare(b.time.start));
    return m;
  }, [visible]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {weekdays.map((wd, i) => {
        const dateObj = days[i];
        const dateShort = formatDM(dateObj);

        const isToday = isSameYmd(dateObj, today); // ✅

        return (
          <div
            key={wd.k}
            className={[
              isToday
                ? "glasscardToday rounded-xl p-4 card-smooth hover-shadow hover-lift" // ✅ як у студента
                : "glasscard rounded-xl p-4 card-smooth hover-shadow hover-lift"
            ].join(" ")}
          >
            <div className="font-semibold mb-3 flex items-center gap-2">
              <span>{wd.label}, {dateShort}</span>
              {isToday && (
                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                  сьогодні
                </span>
              )}
            </div>

            {byDay.get(wd.k)!.length === 0 && (
              <div className="text-[var(--muted)] text-sm">Пари відсутні</div>
            )}

            <div className="space-y-3">
              {byDay.get(wd.k)!.map(l => (
                <div key={l.id} className="rounded-xl hover-lift p-3 bg-[var(--surface-2)]/60 border border-[var(--border)]">
                  <div className="font-medium">{l.subject}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {l.time.start}–{l.time.end} · {l.location} · {l.group.name}{l.group.subgroup ? `/${l.group.subgroup}` : ""}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <a
                      href={l.meetingUrl || "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="hover-lift px-2 py-1 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] inline-flex items-center gap-1 text-sm"
                    >
                      <Video className=" hover-lift w-4 h-4" /> Відеопара
                    </a>

                    <Link
                      to={`/teacher/subject/${encodeURIComponent(l.subjectId)}`}
                      className="hover-lift px-2 py-1 rounded-lg bg-[var(--muted)]/15 text-[var(--text)] inline-flex items-center gap-1 text-sm hover:opacity-90"
                    >
                      <BookOpen className=" hover-lift w-4 h-4" /> Сторінка предмету
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ScheduleWeekTeacher;