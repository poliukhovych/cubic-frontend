// src/components/ScheduleWeek.tsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import type { Lesson } from "@/types/schedule";
import { isEvenWeek } from "@/lib/utils/date";
import { addDays, formatDM } from "@/lib/time/academicWeek";
import { slugify } from "@/lib/slug";
import { BookOpen, Video } from "lucide-react";

const days = [
  { key: 1, label: "Пн", offset: 0 },
  { key: 2, label: "Вт", offset: 1 },
  { key: 3, label: "Ср", offset: 2 },
  { key: 4, label: "Чт", offset: 3 },
  { key: 5, label: "Пт", offset: 4 },
  { key: 6, label: "Сб", offset: 5 },
  { key: 7, label: "Нд", offset: 6 },
];

const byDay = (lessons: Lesson[]) => {
  const map = new Map<number, Lesson[]>();
  days.forEach((d) => map.set(d.key, []));
  lessons.forEach((l) => map.get(l.weekday)!.push(l));
  for (const arr of map.values()) arr.sort((a, b) => a.time.start.localeCompare(b.time.start));
  return map;
};

type Props = {
  lessons: Lesson[];
  parity?: "even" | "odd";
  weekStart?: Date; // понеділок обраного тижня (локальна дата)
};

function isSameYmd(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const ScheduleWeek: React.FC<Props> = ({ lessons, parity, weekStart }) => {
  const effectiveParity: "even" | "odd" = parity ?? (isEvenWeek() ? "even" : "odd");

  const filtered = useMemo(
    () =>
      lessons.filter((l) => !l.parity || l.parity === "any" || l.parity === effectiveParity),
    [lessons, effectiveParity]
  );

  const map = useMemo(() => byDay(filtered), [filtered]);

  const today = new Date();
  // JS: Нд=0..Сб=6 → 1..7 з Пн=1
  const todayIndex1to7 = ((today.getDay() + 6) % 7) + 1;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {days.map((d) => {
          const dateShort = weekStart ? formatDM(addDays(weekStart, d.offset)) : null;

          // якщо маємо weekStart — перевіряємо фактичну дату дня; інакше — лише індекс
          const dayDate = weekStart ? addDays(weekStart, d.offset) : null;
          const isToday = dayDate ? isSameYmd(dayDate, today) : todayIndex1to7 === d.key;

          return (
            <div
              key={d.key}
              className={[
                isToday
                  ? "glasscardToday rounded-xl p-4 card-smooth hover-shadow hover-lift"
                  : "glasscard rounded-xl p-4 border border-[var(--border)] card-smooth hover-shadow hover-lift",
              ].join(" ")}
              // Якщо хочеш явну смужку зліва для "сьогодні":
              // style={isToday ? { boxShadow: "inset 3px 0 0 var(--primary)" } : undefined}
            >
              <div className="font-semibold mb-3 flex items-center gap-2 ">
                <span>
                  {d.label}
                  {dateShort ? `, ${dateShort}` : ""}
                </span>
                {isToday && (
                  <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/15 text-[var(--primary)]">
                    сьогодні
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {map.get(d.key)!.length === 0 && (
                  <div className="text-[var(--muted)] text-sm">Немає пар</div>
                )}

                {map.get(d.key)!.map((l) => {
                  const subjectSlug = slugify(l.subject);

                  return (
                    <div
                      key={l.id}
                      className={["glasscard rounded-xl p-3 hover-lift", "w-full"].join(" ")}
                    >
                      <div className="text-sm">
                        {l.time.start} — {l.time.end}
                      </div>
                      <div className="font-medium">{l.subject}</div>
                      <div className="text-sm text-[var(--muted)]">
                        {l.location ?? "—"} · {l.group.name}
                        {l.group.subgroup ? `/${l.group.subgroup}` : ""}
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {l.meetingUrl && (
                          <a
                            href={l.meetingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover-lift px-2 py-1 rounded-lg bg-[var(--primary)]/15 text-[var(--primary)] inline-flex items-center gap-1 text-sm"
                            title="Відкрити посилання на пару"
                          >
                            <Video className="w-4 h-4 hover-lift" /> Відеопара
                          </a>
                        )}

                        <Link
                          to={`/student/subject/${subjectSlug}`}
                          className=" hover-lift px-2 py-1 rounded-lg bg-[var(--muted)]/15 text-[var(--text)] inline-flex items-center gap-1 text-sm hover:opacity-90"
                          title="Відкрити сторінку предмету"
                        >
                          <BookOpen className="w-4 h-4 hover-lift" /> Сторінка предмету
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ScheduleWeek;
