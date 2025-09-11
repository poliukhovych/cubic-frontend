// src/components/HomeworkList.tsx
import React, { useMemo } from "react";
import type { HomeworkTask } from "@/types/homework";

function truncate(s: string, max = 140) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

type Props = { tasks: HomeworkTask[] };

const HomeworkList: React.FC<Props> = ({ tasks }) => {
  const sorted = useMemo(
    () => [...tasks].sort((a,b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks]
  );

  return (
    <div className="space-y-3">
      {sorted.map(t => {
        const Wrapper: React.ElementType = t.classroomUrl ? "a" : "div";
        const wrapperProps = t.classroomUrl
          ? { href: t.classroomUrl, target: "_blank", rel: "noopener noreferrer" }
          : {};

        return (
          <Wrapper
            key={t.id}
            {...wrapperProps}
            className={[
              "glasscard rounded-xl border border-[var(--border)] p-4 smooth hover-lift pressable block",
              t.classroomUrl ? "cursor-pointer" : ""
            ].join(" ")}
            title={t.classroomUrl ? "Відкрити завдання у Classroom" : undefined}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-[var(--muted)]">{t.subject}</div>
                <div className="font-medium">{truncate(t.text, 160)}</div>
              </div>
              <div className="shrink-0 text-sm text-[var(--muted)]">
                До {new Date(t.dueDate).toLocaleDateString()}
              </div>
            </div>
          </Wrapper>
        );
      })}
      {sorted.length === 0 && (
        <div className="text-[var(--muted)]">Домашніх завдань поки немає</div>
      )}
    </div>
  );
};

export default HomeworkList;
