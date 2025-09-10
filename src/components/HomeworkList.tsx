//src/components/HomeworkList.tsx
import React from "react";
import type { HomeworkTask } from "@/types/homework";

const HomeworkList: React.FC<{ tasks: HomeworkTask[] }> = ({ tasks }) => {
  return (
    <div className="grid gap-4">
      {tasks.map(t => (
        <div key={t.id} className="card p-4 bg-[var(--card)]/30 backdrop-blur-sm rounded-lg border border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className="font-semibold">{t.subject}</div>
            <div className="badge">Дедлайн: {t.dueDate}</div>
          </div>
          <div className="mt-2">{t.text}</div>
          {t.files?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {t.files.map(f => (
                <a key={f.id} href={f.url} target="_blank" className="badge hover:brightness-110">{f.title ?? "Файл"}</a>
              ))}
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
};

export default HomeworkList;
