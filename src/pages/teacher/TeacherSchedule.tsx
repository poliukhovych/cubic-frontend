import React, { useEffect, useMemo, useState } from "react";
import { fetchTeacherSchedule } from "@/lib/fakeApi/teacher";
import type { TeacherSchedule as T } from "@/types/schedule";
import { useAuth } from "@/types/auth";
import { getWeekIndex } from "@/lib/time/academicWeek";
import WeekDots from "@/components/WeekDots";

const TeacherSchedule: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [week, setWeek] = useState<number>(() => getWeekIndex());
  const parity: "odd" | "even" = week % 2 === 1 ? "odd" : "even";

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

  const totalWeeks: number = (data as any)?.totalWeeks ?? 16;

  const byDay = useMemo(() => {
    const m = new Map<number, T["lessons"]>();
    for (let i = 1; i <= 7; i++) m.set(i, []);
    const lessons = (data?.lessons ?? []).filter(
      (l) => !l.parity || l.parity === "any" || l.parity === parity
    );
    lessons.forEach((l) => m.get(l.weekday)!.push(l));
    return m;
  }, [data, parity]);

  if (!data) return <div className="text-[var(--muted)]">Завантаження...</div>;

  return (
    <div className="space-y-4">
      <div className="text-2xl font-semibold">Мій розклад (викладач)</div>

      <div className="glasscard rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--muted)]">
            Тиждень: #{week} ({parity === "odd" ? "непарний" : "парний"})
          </span>
        </div>
        <WeekDots total={totalWeeks} value={week} onChange={setWeek} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1,2,3,4,5,6,7].map((d) => (
          <div className="glasscard rounded-2xl p-4" key={d}>
            <div className="font-semibold mb-2">{["","Пн","Вт","Ср","Чт","Пт","Сб","Нд"][d]}</div>
            <div className="space-y-2">
              {byDay.get(d)!.length === 0 && (
                <div className="text-[var(--muted)] text-sm">Немає занять</div>
              )}
              {byDay.get(d)!.map((l) => (
                <div key={l.id} className="rounded-xl glasscard p-3">
                  <div className="text-sm">{l.time.start} — {l.time.end}</div>
                  <div className="font-medium">{l.subject}</div>
                  <div className="text-sm text-[var(--muted)]">
                    Група: {l.group.name}{l.group.subgroup ? `/${l.group.subgroup}` : ""} · {l.location ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherSchedule;
