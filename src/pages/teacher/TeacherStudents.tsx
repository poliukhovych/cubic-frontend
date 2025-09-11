// src/pages/teacher/TeacherStudents.tsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { fetchMyStudents } from "@/lib/fakeApi/teacher";
import type { Student } from "@/types/students";
import { useAuth } from "@/types/auth";
import Reveal from "@/components/Reveal";
import { cls } from "@/lib/utils/cls";

/* ---------------------------------- types --------------------------------- */
type GroupKey = { groupId: string; subgroup?: string | null };
type GroupBucket = { key: GroupKey; label: string; students: Student[] };

/* --------------------------------- utils ---------------------------------- */
const keyOf = (k: GroupKey) => `${k.groupId}${k.subgroup ? `/${k.subgroup}` : ""}`;

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
  onToggle,       // (kk: string) => void
  revealDelay,
}: {
  bucket: GroupBucket;
  isOpen: boolean;
  onToggle: (kk: string) => void;
  revealDelay: number;
}) {
  // студенти відсортовані за ПІБ
  const studentsSorted = React.useMemo(
    () => bucket.students.slice().sort((a, b) => a.name.localeCompare(b.name, "uk")),
    [bucket.students]
  );

  // локальний лічильник відкриттів саме цієї групи — щоб при кожному open програти анімацію студентів
  const [openVersion, setOpenVersion] = React.useState(0);
  const wasOpen = React.useRef(isOpen);
  React.useEffect(() => {
    if (!wasOpen.current && isOpen) setOpenVersion(v => v + 1); // інкремент тільки на переході closed -> open
    wasOpen.current = isOpen;
  }, [isOpen]);

  return (
    <Reveal delayMs={revealDelay} y={8} opacityFrom={0.02} blurPx={6}>
      <div className={cls(
        "glasscard rounded-2xl overflow-hidden border transition-shadow",
        isOpen ? "shadow-lg" : "shadow"
      )}>
        {/* Хедер групи */}
        <button
          type="button"
          className="w-full flex items-center justify-between gap-4 p-4 hover:bg-white/5 transition-colors text-left"
          aria-expanded={isOpen}
          onClick={() => onToggle(bucket.label)}
        >
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full flex items-center justify-center text-sm font-semibold bg-[var(--primary)]/15 border border-[var(--border)]">
              {studentsSorted.length}
            </div>
            <div>
              <div className="font-medium">{bucket.label}</div>
              <div className="text-sm text-[var(--muted)]">
                Група{bucket.key.subgroup ? "/Підгрупа" : ""}
              </div>
            </div>
          </div>
          <div className={cls(
            "i-lucide-chevron-down transition-transform duration-300",
            isOpen && "rotate-180"
          )}/>
        </button>

        {/* Розкривна частина: тільки CSS-висота (без Crossfade), щоб не чіпати сусідів */}
        <div
          className={cls(
            "grid transition-[grid-template-rows] duration-400 ease-out",
            isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          )}
          aria-hidden={!isOpen}
        >
          <div className="overflow-hidden">
            {/* Ключ міняється при кожному відкритті саме цієї групи → анімація студентів відпрацьовує знову */}
            <div key={openVersion} className="px-4 pb-4">
              {/* студенти у стовпчик з нумерацією */}
              <div className="space-y-2">
                {studentsSorted.map((s, j) => (
                  <Reveal key={s.id} delayMs={40 + j * 20} y={6} opacityFrom={0}>
                    <div className="card p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {/* порядковий номер */}
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
  const [expanded, setExpanded] = useState<Set<string>>(new Set()); // відкриті групи

  useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchMyStudents(user.id).then((res) => { if (alive) setStudents(res); });
    return () => { alive = false; };
  }, [user]);

  const buckets = useMemo(() => groupStudents(students), [students]);

  // стабільний onToggle, щоб React.memo не змушував сусідні групи ререндеритись
  const handleToggle = useCallback((kk: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(kk) ? next.delete(kk) : next.add(kk);
      return next;
    });
  }, []);

  return (
    <div className="space-y-4">
      {/* Заголовок із м’яким входом, один раз */}
      <Reveal className="relative z-10 flex items-center justify-center text-center" delayMs={100} y={10} opacityFrom={0}>
        <div className="text-2xl font-semibold">Студенти</div>
      </Reveal>

      {/* Грід груп: 1 колонка мобілка, 2 колонки >= sm */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {buckets.map((b, i) => (
          <GroupPanel
            key={b.label}
            bucket={b}
            isOpen={expanded.has(b.label)}
            onToggle={handleToggle}
            revealDelay={80 + i * 40}
          />
        ))}
      </div>
    </div>
  );
};

export default TeacherStudents;
