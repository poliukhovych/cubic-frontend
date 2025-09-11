// src/components/WeekDots.tsx
import React from "react";

type Props = {
  total: number;         // скільки тижнів
  value: number;         // обраний тиждень (1-based)
  onChange: (week: number) => void;
};

const WeekDots: React.FC<Props> = ({ total, value, onChange }) => {
  return (
    <div className="flex justify-center gap-2 flex-wrap">
      {Array.from({ length: total }, (_, i) => {
        const week = i + 1;
        const active = week === value;
        return (
          <button
            key={week}
            onClick={() => onChange(week)}
            className={[
              "w-4 h-4 rounded-full transition-colors glasscard", // зробив трохи більші
              active
                ? "bg-[var(--primary)]/80" // активна: напівпрозора синя
                : "bg-[var(--muted)]/10 hover:bg-[var(--muted)]/60" // неактивна: сіріша, ще більш прозора
            ].join(" ")}
            aria-label={`Тиждень ${week}`}
          />
        );
      })}
    </div>
  );
};

export default WeekDots;
