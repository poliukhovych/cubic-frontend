// src/components/HomeworkList.tsx
import React, { useMemo, useState } from "react";
import type { HomeworkTask } from "@/types/homework";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";

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
    <div className="space-y-4">
      {/* 🔹 Панель фільтрів */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="glass glass-card p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Статус:</label>
              <Select value={status} onValueChange={(v) => setStatus(v as "all" | "done" | "todo")}>
                <SelectTrigger className="w-[130px] glass border-border/30 bg-background/50 text-foreground hover:bg-background/70 focus:bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/30 bg-background/95 backdrop-blur-md">
                  <SelectItem value="all" className="text-foreground hover:bg-accent/40 focus:bg-accent/50 focus:text-accent-foreground">Усі</SelectItem>
                  <SelectItem value="todo" className="text-foreground hover:bg-accent/40 focus:bg-accent/50 focus:text-accent-foreground">Невиконані</SelectItem>
                  <SelectItem value="done" className="text-foreground hover:bg-accent/40 focus:bg-accent/50 focus:text-accent-foreground">Виконані</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator orientation="vertical" className="h-6 bg-border/20" />

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground">Предмет:</label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="w-[180px] glass border-border/30 bg-background/50 text-foreground hover:bg-background/70 focus:bg-background/80">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass border-border/30 bg-background/95 backdrop-blur-md">
                  {subjects.map((s) => (
                    <SelectItem key={s} value={s} className="text-foreground hover:bg-accent/40 focus:bg-accent/50 focus:text-accent-foreground">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="ml-auto">
              <span className="px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground border border-muted/30">
                {filtered.length} завдань
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 🔹 Список після фільтрації */}
      <div className="space-y-3">
        {filtered.map((t, index) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            {t.classroomUrl ? (
              <a
                href={t.classroomUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                title="Відкрити завдання у Classroom"
              >
                <div className="glass glass-card p-4 hover:shadow-lg transition-all duration-300 cursor-pointer hover:bg-background/60 rounded-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground border border-muted/30">{t.subject}</span>
                        <ExternalLink className="w-3 h-3 text-muted-foreground/60" />
                      </div>
                      <div className="font-medium text-foreground">{truncate(t.text, 160)}</div>
                    </div>

                    <div className="shrink-0 text-right space-y-2">
                      <div className="text-sm text-muted-foreground/80">
                        До {new Date(t.dueDate).toLocaleDateString()}
                      </div>
                      <span 
                        className={`px-2 py-0.5 text-xs rounded-full border ${t.done 
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" 
                          : "bg-red-500/15 text-red-600 border-red-500/30"
                        }`}
                      >
                        {t.done ? "Виконано" : "Невиконано"}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ) : (
              <div className="glass glass-card p-4 rounded-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground border border-muted/30">{t.subject}</span>
                    </div>
                    <div className="font-medium text-foreground">{truncate(t.text, 160)}</div>
                  </div>

                  <div className="shrink-0 text-right space-y-2">
                    <div className="text-sm text-muted-foreground/80">
                      До {new Date(t.dueDate).toLocaleDateString()}
                    </div>
                    <span 
                      className={`px-2 py-0.5 text-xs rounded-full border ${t.done 
                        ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" 
                        : "bg-red-500/15 text-red-600 border-red-500/30"
                      }`}
                    >
                      {t.done ? "Виконано" : "Невиконано"}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ))}

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="glass glass-card p-8 rounded-xl">
              <p className="text-muted-foreground">
                Нічого не знайдено за обраними фільтрами
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomeworkList;
