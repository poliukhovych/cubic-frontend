// src/pages/student/StudentGrades.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/types/auth";
import { fetchStudentGrades } from "@/lib/fakeApi/student";
import type { SubjectGrades, GradeItem } from "@/types/grades";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";
import { slugify } from "@/lib/slug";
import { Search, X } from "lucide-react";

const Row: React.FC<{ item: GradeItem }> = ({ item }) => {
  const date = new Date(item.createdAt).toLocaleDateString();
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-[var(--border)]/60">
      <div className="hover-lift min-w-0">
        <div className="font-medium truncate">{item.comment ?? "Оцінка"}</div>
        <div className="text-sm text-[var(--muted)]">
          {date}
          {item.classroomUrl ? (
            <>
              {" · "}
              <a className="underline hover:opacity-80" href={item.classroomUrl} target="_blank" rel="noreferrer">
                Classroom
              </a>
            </>
          ) : null}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-lg font-semibold hover-lift">
          {item.points}
          {typeof item.max === "number" ? <span className="text-[var(--muted)] text-sm"> / {item.max}</span> : null}
        </div>
      </div>
    </div>
  );
};

const SubjectCard: React.FC<{ data: SubjectGrades }> = ({ data }) => {
  const to = `/student/subject/${slugify(data.subject)}`;
  return (
    <Link
      to={to}
      className="block no-underline text-inherit break-inside-avoid mb-4"
      title={`Відкрити сторінку предмету: ${data.subject}`}
    >
      <div className="glasscard hover-lift rounded-2xl p-4 transition">
        <div className="flex items-center justify-between mb-2">
          <div className="text-lg font-semibold hover-lift">{data.subject}</div>
          <div className="text-sm text-[var(--muted)]">К-сть: {data.items.length}</div>
        </div>

        <div className="divide-y divide-[var(--border)]/60">
          {data.items.map((it) => (
            <Row key={it.id} item={it} />
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-[var(--border)]/60 flex items-center justify-between">
          <div className="text-sm text-[var(--muted)]">Сума балів</div>
          <div className="text-xl font-bold hover-lift">{data.total}</div>
        </div>
      </div>
    </Link>
  );
};

const StudentGrades: React.FC = () => {
  const { user } = useAuth();
  const [subjects, setSubjects] = React.useState<SubjectGrades[]>([]);
  const [updatedAt, setUpdatedAt] = React.useState<string>("");
  const [q, setQ] = React.useState<string>("");

  React.useEffect(() => {
    if (!user) return;
    let alive = true;
    fetchStudentGrades(user.id).then((res) => {
      if (!alive) return;
      // Перестраховка: якщо total не порахований — дорахуємо.
      const fixed = res.subjects.map((s) => ({
        ...s,
        total: typeof s.total === "number" ? s.total : s.items.reduce((acc, it) => acc + it.points, 0),
      }));
      setSubjects(fixed);
      setUpdatedAt(res.updatedAt);
    });
    return () => {
      alive = false;
    };
  }, [user]);

  const filtered = React.useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return subjects;
    return subjects.filter((s) => s.subject.toLowerCase().includes(needle));
  }, [subjects, q]);

  if (!user) return null;

  return (
    <div className="space-y-4">
      <Reveal className="relative z-10 flex items-center justify-center text-center" delayMs={120} y={10} opacityFrom={0}>
        <div className="text-2xl font-semibold">Оцінки</div>
      </Reveal>

      <Reveal y={0} blurPx={6} opacityFrom={0} delayMs={80}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left text-sm text-[var(--muted)]">
            Оновлено: {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
          </div>

          {/* Пошук */}
          <div className="w-full sm:w-80 hover-lift">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Пошук предмету…"
                aria-label="Пошук предмету"
                className="w-full pl-9 pr-9 py-2 rounded-xl glasscard border border-[var(--border)]/60 outline-none focus:ring-2 focus:ring-[var(--primary)]/40 transition"
              />
              {q && (
                <button
                  onClick={() => setQ("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-[var(--muted)]/10"
                  aria-label="Очистити пошук"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <Crossfade stateKey={[...filtered.map((s) => `${slugify(s.subject)}:${s.total}`), q].join("|")}>
        <Reveal y={8} blurPx={8} opacityFrom={0} delayMs={100}>
          {filtered.length === 0 ? (
            <div className="text-center text-[var(--muted)]">Нічого не знайдено за запитом “{q}”.</div>
          ) : (
            // Masonry-колонки замість grid, щоб не тягнуло блоки по висоті
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
              {filtered.map((s) => (
                <SubjectCard key={s.subject} data={s} />
              ))}
            </div>
          )}
        </Reveal>
      </Crossfade>
    </div>
  );
};

export default StudentGrades;
