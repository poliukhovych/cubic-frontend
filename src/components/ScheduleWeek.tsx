//src/components/ScheduleWeek.tsx
import React, { useMemo } from "react";
import type { Lesson } from "@/types/schedule";
import { isEvenWeek } from "@/lib/utils/date";

const days: { key: number; label: string }[] = [
  { key:1, label:"Пн" },{ key:2, label:"Вт" },{ key:3, label:"Ср" },
  { key:4, label:"Чт" },{ key:5, label:"Пт" },{ key:6, label:"Сб" },{ key:7, label:"Нд" },
];

const byDay = (lessons: Lesson[]) => {
  const map = new Map<number, Lesson[]>();
  days.forEach(d => map.set(d.key, []));
  lessons.forEach(l => map.get(l.weekday)!.push(l));
  for (const arr of map.values()) arr.sort((a,b) => a.time.start.localeCompare(b.time.start));
  return map;
};

const ScheduleWeek: React.FC<{ lessons: Lesson[] }> = ({ lessons }) => {
  const even = isEvenWeek();
  const filtered = useMemo(
    () => lessons.filter(l => !l.parity || l.parity === "any" || (l.parity === "even") === even),
    [lessons, even]
  );
  const map = useMemo(() => byDay(filtered), [filtered]);

  return (
    <div className="space-y-4">
      <div className="badge">{even ? "Парний тиждень" : "Непарний тиждень"}</div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {days.map(d => (
          <div key={d.key} className="bg-[var(--card)]/30 backdrop-blur-sm rounded-xl p-4 border border-[var(--border)]">
            <div className="font-semibold mb-3">{d.label}</div>
            <div className="space-y-2">
              {map.get(d.key)!.length === 0 && <div className="text-[var(--muted)] text-sm">Немає пар</div>}
              {map.get(d.key)!.map(l => (
                <div key={l.id} className="bg-[var(--card)]/1 backdrop-blur-sm rounded-xl border border-[var(--border)] p-3">
                  <div className="text-sm">{l.time.start} — {l.time.end}</div>
                  <div className="font-medium">{l.subject}</div>
                  <div className="text-sm text-[var(--muted)]">
                    {l.location ?? "—"} · {l.group.name}{l.group.subgroup ? `/${l.group.subgroup}` : ""}
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

export default ScheduleWeek;
