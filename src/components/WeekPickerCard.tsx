// src/components/WeekPickerCard.tsx
import React from "react";
import WeekDots from "@/components/WeekDots";

type Props = {
  week: number;
  totalWeeks: number;
  rangeText: string;
  onChange: (w: number) => void;
  titleCenter?: React.ReactNode; // опціонально — довільний заголовок зверху/під ним
};

const WeekPickerCard: React.FC<Props> = ({ week, totalWeeks, rangeText, onChange, titleCenter }) => {
  return (
    <div className="glasscard rounded-2xl p-4 space-y-3">
      {titleCenter}
      <div className="text-center text-lg font-medium">Тиждень: #{week}</div>
      <div className="text-center text-sm text-[var(--muted)]">{rangeText}</div>
      <WeekDots total={totalWeeks} value={week} onChange={onChange} />
    </div>
  );
};

export default WeekPickerCard;
