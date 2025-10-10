// src/pages/teacher/TeacherStudents.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { fetchMyStudents } from "@/lib/fakeApi/teacher";
import type { Student } from "@/types/students";
import { useAuth } from "@/types/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronDown, Users, FileText, Download, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ---------------------------------- types --------------------------------- */
type GroupKey = { groupId: string; subgroup?: string | null };
type GroupBucket = { key: GroupKey; label: string; students: Student[] };

/* --------------------------------- utils ---------------------------------- */
const keyOf = (k: GroupKey) => `${k.groupId}${k.subgroup ? `/${k.subgroup}` : ""}`;
const slug = (s: string) =>
  s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");

/** завантаження текстового контенту як файлу */
function downloadText(text: string, filename: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** CSV з BOM для коректного відкриття кирилиці в Excel/Google Sheets */
function downloadCsv(rows: string[][], filename: string) {
  const esc = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
  const body = rows.map(r => r.map(esc).join(",")).join("\r\n");
  const csv = "\uFEFF" + body; // BOM
  downloadText(csv, filename, "text/csv;charset=utf-8");
}

function groupStudents(students: Student[]): GroupBucket[] {
  const map = new Map<string, GroupBucket>();
  for (const s of students) {
    const k: GroupKey = { groupId: String(s.groupId), subgroup: s.subgroup ?? undefined };
    const kk = keyOf(k);
    if (!map.has(kk)) map.set(kk, { key: k, label: kk, students: [] });
    map.get(kk)!.students.push(s);
  }
  // сортування груп: за groupId (числово, якщо можливо), потім за subgroup
  return Array.from(map.values()).sort((a, b) => {
    if (a.key.groupId === b.key.groupId) {
      const asg = a.key.subgroup ?? "", bsg = b.key.subgroup ?? "";
      return asg.localeCompare(bsg, "uk");
    }
    const an = Number(a.key.groupId), bn = Number(b.key.groupId);
    if (!Number.isNaN(an) && !Number.isNaN(bn)) return an - bn;
    return a.key.groupId.localeCompare(b.key.groupId, "uk");
  });
}

/* ------------------------------ GroupPanel -------------------------------- */
const GroupPanel = React.memo(function GroupPanel({
  bucket,
  isOpen,
  onToggle,
  onExportTxt,
  onExportCsv,
  onExportSheets,
  revealDelay,
}: {
  bucket: GroupBucket;
  isOpen: boolean;
  onToggle: (kk: string) => void;
  onExportTxt: (b: GroupBucket) => void;
  onExportCsv: (b: GroupBucket) => void;
  onExportSheets: (b: GroupBucket) => void;
  revealDelay: number;
}) {
  // студенти відсортовані за ПІБ
  const studentsSorted = React.useMemo(
    () => bucket.students.slice().sort((a, b) => a.name.localeCompare(b.name, "uk")),
    [bucket.students]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.4, delay: revealDelay * 0.001 }}
    >
      <Card className={`overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 glass glass-card backdrop-blur-sm border border-border/20 ${!isOpen ? 'glass-collapsed' : ''}`}>
        {/* Хедер групи */}
        <CardHeader className={`backdrop-blur-sm border-b border-border/10 ${isOpen ? 'bg-card/60' : 'bg-card/40'}`}>
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="ghost"
              className="flex-1 flex items-center gap-3 text-left h-auto p-0 justify-start hover:bg-accent/30 rounded-lg px-2 py-1 transition-colors"
              onClick={() => onToggle(bucket.label)}
              aria-expanded={isOpen}
            >
              <Badge variant="outline" className="chip-primary-border bg-primary/10 text-primary border-primary/50">
                {studentsSorted.length}
              </Badge>
              <div>
                <CardTitle className="font-medium text-left text-foreground">{bucket.label}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Група{bucket.key.subgroup ? "/Підгрупа" : ""}
                </div>
              </div>
            </Button>

            {/* Кнопки експорту */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onExportTxt({ ...bucket, students: studentsSorted }); }}
                title="Експортувати TXT (нумерований список)"
                className="hover:scale-105 transition-transform duration-200 bg-background/50 border-border/60 hover:bg-background/80"
              >
                <FileText className="w-4 h-4 mr-1" />
                TXT
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onExportCsv({ ...bucket, students: studentsSorted }); }}
                title="Експортувати CSV (Google Sheets)"
                className="hover:scale-105 transition-transform duration-200 bg-background/50 border-border/60 hover:bg-background/80"
              >
                <Download className="w-4 h-4 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onExportSheets({ ...bucket, students: studentsSorted }); }}
                title="Відкрити Google Sheets і вставити список"
                className="hover:scale-105 transition-transform duration-200 bg-background/50 border-border/60 hover:bg-background/80"
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                Sheets
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onToggle(bucket.label)}
                aria-label={isOpen ? "Згорнути" : "Розгорнути"}
                title={isOpen ? "Згорнути" : "Розгорнути"}
                className="hover:scale-105 transition-all duration-200 hover:bg-accent/30 text-foreground"
              >
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Розкривна частина */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }}
            >
              <CardContent className="p-4 space-y-2 bg-card/30 backdrop-blur-sm">
                {studentsSorted.map((s, j) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: j * 0.05, duration: 0.3 }}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/30 transition-colors duration-200 border border-border/10 bg-background/50"
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/15 text-primary font-medium text-sm border border-primary/20">
                        {s.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate text-foreground">{s.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{s.email}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/30">
                      {j + 1}
                    </Badge>
                  </motion.div>
                ))}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
});

/* ---------------------------- Page Component ------------------------------- */
const TeacherStudents: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchMyStudents(user.id).then((res) => { if (alive) setStudents(res); });
    return () => { alive = false; };
  }, [user]);

  const buckets = useMemo(() => groupStudents(students), [students]);

  const columns = useMemo(() => {
    const cols: { b: GroupBucket; i: number }[][] = [[], []];
    buckets.forEach((b, i) => cols[i % 2].push({ b, i }));
    return cols;
  }, [buckets]);

  const handleToggle = useCallback((kk: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(kk) ? next.delete(kk) : next.add(kk);
      return next;
    });
  }, []);

  /* ---------------------------- EXPORT HANDLERS --------------------------- */
  const exportTxt = useCallback((bucket: GroupBucket) => {
    const list = bucket.students
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, "uk"))
      .map((s, idx) => `${idx + 1}. ${s.name}${s.email ? ` — ${s.email}` : ""}`)
      .join("\r\n");

    const header = `Список студентів ${bucket.label}\r\n`;
    const content = `${header}\r\n${list}\r\n`;
    const name = `students-${slug(bucket.label)}.txt`;
    downloadText(content, name);
  }, []);

  const exportCsv = useCallback((bucket: GroupBucket) => {
    const rows: string[][] = [
      ["№", "ПІБ", "Email", "Група", "Підгрупа"],
    ];
    const sorted = bucket.students.slice().sort((a, b) => a.name.localeCompare(b.name, "uk"));
    sorted.forEach((s, i) => {
      rows.push([
        String(i + 1),
        s.name,
        s.email ?? "",
        String(s.groupId ?? ""),
        s.subgroup ?? "",
      ]);
    });
    const name = `students-${slug(bucket.label)}.csv`;
    downloadCsv(rows, name);
  }, []);

  /** Легкий варіант "відкрити Sheets": копіюємо TSV у буфер і відкриваємо нову таблицю */
  const exportSheets = useCallback(async (bucket: GroupBucket) => {
    const sorted = bucket.students.slice().sort((a, b) => a.name.localeCompare(b.name, "uk"));
    const rows: string[][] = [
      ["№", "ПІБ", "Email", "Група", "Підгрупа"],
      ...sorted.map((s, i) => [String(i + 1), s.name, s.email ?? "", String(s.groupId ?? ""), s.subgroup ?? ""]),
    ];
    const toTsv = (r: string[][]) => r.map(row => row.map(v => (v ?? "").replace(/\t/g, " ")).join("\t")).join("\r\n");
    const tsv = toTsv(rows);

    try {
      await navigator.clipboard.writeText(tsv);
    } catch (_e) {
      // Якщо не вдалося (HTTP або permission), дамо юзеру текст для копіювання вручну
      // eslint-disable-next-line no-alert
      window.alert("Не вдалось автоматично скопіювати. Після відкриття таблиці натисніть Ctrl+V.");
    } finally {
      window.open("https://docs.google.com/spreadsheets/create?hl=uk", "_blank", "noopener");
      // юзер одразу натискає Ctrl+V у A1
    }
  }, []);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-center text-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Студенти</h1>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start"
      >
        {columns.map((col, colIdx) => (
          <motion.div
            key={colIdx}
            initial={{ opacity: 0, x: colIdx === 0 ? -50 : 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 + colIdx * 0.1 }}
            className="flex flex-col gap-4"
          >
            {col.map(({ b, i }) => (
              <GroupPanel
                key={b.label}
                bucket={b}
                isOpen={expanded.has(b.label)}
                onToggle={handleToggle}
                onExportTxt={exportTxt}
                onExportCsv={exportCsv}
                onExportSheets={exportSheets}
                revealDelay={80 + i * 40}
              />
            ))}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default TeacherStudents;