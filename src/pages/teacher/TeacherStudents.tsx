// src/pages/teacher/TeacherStudents.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { fetchMyStudents } from "@/lib/fakeApi/teacher";
import type { Student } from "@/types/students";
import { useAuth } from "@/types/auth";
import Reveal from "@/components/Reveal";
import { cls } from "@/lib/utils/cls";
import { ChevronDown } from "lucide-react";

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

  // локальний лічильник відкриттів саме цієї групи
  const [openVersion, setOpenVersion] = React.useState(0);
  const wasOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (!wasOpen.current && isOpen) setOpenVersion(v => v + 1);
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <Reveal delayMs={revealDelay} y={8} opacityFrom={0.02} blurPx={6}>
      <div className={cls(
        "glasscard rounded-2xl overflow-hidden border transition-shadow hover-lift",
        isOpen ? "shadow-lg" : "shadow"
      )}>
        {/* Хедер групи */}
        <div className="w-full flex items-center justify-between gap-4 p-4">
          <button
            type="button"
            className="flex-1 flex items-center gap-3 text-left"
            aria-expanded={isOpen}
            onClick={() => onToggle(bucket.label)}
            title="Показати/сховати список"
          >
            <div className="size-8 rounded-full flex items-center justify-center text-sm font-semibold bg-[var(--primary)]/15 border border-[var(--border)]">
              {studentsSorted.length}
            </div>
            <div>
              <div className="font-medium">{bucket.label}</div>
              <div className="text-sm text-[var(--muted)]">
                Група{bucket.key.subgroup ? "/Підгрупа" : ""}
              </div>
            </div>
          </button>

          {/* Кнопки експорту — компактні, в стилі .btn */}
          <div className="flex items-center gap-2">
            <button
              className="btn px-3 py-1.5 rounded-xl text-sm hover-shadow"
              onClick={(e) => { e.stopPropagation(); onExportTxt({ ...bucket, students: studentsSorted }); }}
              title="Експортувати TXT (нумерований список)"
            >
              TXT
            </button>
            <button
              className="btn px-3 py-1.5 rounded-xl text-sm hover-shadow"
              onClick={(e) => { e.stopPropagation(); onExportCsv({ ...bucket, students: studentsSorted }); }}
              title="Експортувати CSV (Google Sheets)"
            >
              CSV
            </button>
            <button
              className="btn px-3 py-1.5 rounded-xl text-sm hover-shadow"
              onClick={(e) => { e.stopPropagation(); onExportSheets({ ...bucket, students: studentsSorted }); }}
              title="Відкрити Google Sheets і вставити список"
            >
              Sheets
            </button>
            <button
              type="button"
              className="btn px-2 py-1.5 rounded-xl"
              onClick={() => onToggle(bucket.label)}
              aria-label={isOpen ? "Згорнути" : "Розгорнути"}
              title={isOpen ? "Згорнути" : "Розгорнути"}
            >
              <ChevronDown className={cls("h-5 w-5 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>
          </div>
        </div>

        {/* Розкривна частина */}
        <div
          className={cls(
            "grid transition-[grid-template-rows] duration-400 ease-out",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
          aria-hidden={!isOpen}
        >
          <div className="overflow-hidden">
            <div key={openVersion} className="px-4 pb-4 mt-2">
              <div className="space-y-2">
                {studentsSorted.map((s, j) => (
                  <Reveal key={s.id} delayMs={40 + j * 20} y={6} opacityFrom={0}>
                    <div className="card hover-lift p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[var(--primary)]/20 text-sm font-medium shrink-0">
                          {j + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium truncate">{s.name}</div>
                          <div className="text-sm text-[var(--muted)] truncate">{s.email}</div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Reveal>
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

  /** Легкий варіант “відкрити Sheets”: копіюємо TSV у буфер і відкриваємо нову таблицю */
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
    <div className="space-y-4">
      <Reveal className="relative z-10 flex items-center justify-center text-center" delayMs={100} y={10} opacityFrom={0}>
        <div className="text-2xl font-semibold">Студенти</div>
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        {columns.map((col, colIdx) => (
          <div key={colIdx} className="flex flex-col gap-4">
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
          </div>
        ))}
      </div>
    </div>
  );
};
export default TeacherStudents;
