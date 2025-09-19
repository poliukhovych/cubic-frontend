// src/components/HomeworkList.tsx
import React, { useMemo, useState } from "react";
import type { HomeworkTask } from "@/types/homework";
import NiceSelect from "@/ui/NiceSelect";

function truncate(s: string, max = 140) {
  if (s.length <= max) return s;
  return s.slice(0, max - 1).trimEnd() + "…";
}

type Props = { tasks: HomeworkTask[] };

const HomeworkList: React.FC<Props> = ({ tasks }) => {
  // ✅ завжди сортуємо за датою (зростаюче)
  const sorted = useMemo(
    () => [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks]
  );

  // ✅ варіанти предметів з даних
  const subjects = useMemo(() => {
    const u = new Set(sorted.map((t) => t.subject));
    return [
      "Усі предмети",
      ...Array.from(u).sort((a, b) => a.localeCompare(b, "uk")),
    ];
  }, [sorted]);

  // ✅ локальні фільтри
  const [status, setStatus] = useState<"all" | "done" | "todo">("all");
  const [subject, setSubject] = useState<string>("Усі предмети");

  const filtered = useMemo(() => {
    return sorted.filter((t) => {
      const bySubject = subject === "Усі предмети" || t.subject === subject;
      const byStatus =
        status === "all" ? true : status === "done" ? t.done : !t.done;
      return bySubject && byStatus;
    });
  }, [sorted, status, subject]);

  return (
    <div className="space-y-3">
      {/* 🔹 Панель фільтрів (мінімалістично у вашому стилі) */}
      <div className="glasscard rounded-2xl p-2 flex flex-wrap items-center gap-2">
        <label className="text-sm text-[var(--muted)] pl-1">Статус</label>
        <NiceSelect
          value={status}
          onChange={(v) => setStatus(v as "all" | "done" | "todo")}
          options={[
            { value: "all", label: "Усі" },
            { value: "todo", label: "Невиконані" },
            { value: "done", label: "Виконані" },
          ]}
        />

        <div className="h-5 w-px bg-[var(--border)] mx-1" />

        <label className="text-sm text-[var(--muted)] pl-1">Предмет</label>
        <NiceSelect
          value={subject}
          onChange={setSubject}
          options={subjects.map((s) => ({ value: s, label: s }))}
        />
      </div>

      {/* 🔹 Список після фільтрації */}
      {filtered.map((t) => {
        const Wrapper: React.ElementType = t.classroomUrl ? "a" : "div";
        const wrapperProps = t.classroomUrl
          ? {
              href: t.classroomUrl,
              target: "_blank",
              rel: "noopener noreferrer",
            }
          : {};

        return (
          <Wrapper
            key={t.id}
            {...wrapperProps}
            className={[
              "glasscard rounded-xl border border-[var(--border)] p-4 smooth hover-lift pressable block",
              t.classroomUrl ? "cursor-pointer" : "",
            ].join(" ")}
            title={t.classroomUrl ? "Відкрити завдання у Classroom" : undefined}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm text-[var(--muted)]">{t.subject}</div>
                <div className="font-medium">{truncate(t.text, 160)}</div>
              </div>

              <div className="shrink-0 text-right">
                <div className="text-sm text-[var(--muted)]">
                  До {new Date(t.dueDate).toLocaleDateString()}
                </div>
                <div
                  className={[
                    "inline-block mt-1 px-2 py-0.5 text-xs rounded-full border",
                    t.done
                      ? "bg-[var(--success)]/15 text-[var(--success)] border-[var(--success)]/25"
                      : "bg-[var(--warning)]/15 text-[var(--warning)] border-[var(--warning)]/25",
                  ].join(" ")}
                >
                  {t.done ? "Виконано" : "Невиконано"}
                </div>
              </div>
            </div>
          </Wrapper>
        );
      })}

      {filtered.length === 0 && (
        <div className="text-[var(--muted)]">
          Нічого не знайдено за обраними фільтрами
        </div>
      )}
    </div>
  );
};

export default HomeworkList;
