// src/pages/student/StudentSubject.tsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "@/types/auth";
import { fetchStudentSubject } from "@/lib/fakeApi/student";
import type { SubjectDetails } from "@/types/subject";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";
import { BookOpen, ExternalLink, Video, FileText, ChevronLeft, Link2, GraduationCap } from "lucide-react";

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="px-2 py-0.5 rounded-full bg-[var(--muted)]/10 text-[var(--muted)] text-xs">{children}</span>
);

const RowLink: React.FC<{ href: string; children: React.ReactNode; title?: string }> = ({ href, children, title }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-2 underline hover:opacity-80  "
    title={title}
  >
    {children} <ExternalLink className="w-4 h-4" />
  </a>
);

const StudentSubject: React.FC = () => {
  const { subjectId = "" } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const [data, setData] = React.useState<SubjectDetails | null>(null);

  React.useEffect(() => {
    if (!user || !subjectId) return;
    let alive = true;
    fetchStudentSubject(user.id, subjectId).then(res => {
      if (alive) setData(res);
    });
    return () => {
      alive = false;
    };
  }, [user, subjectId]);

  const grades = data?.recentGrades ?? [];
  const { sumPoints, sumMax, countGrades } = React.useMemo(() => {
    const sumPoints = grades.reduce((s, g) => s + g.points, 0);
    const sumMaxVal = grades.reduce((s, g) => s + (typeof g.max === "number" ? g.max : 0), 0);
    return { sumPoints, sumMax: sumMaxVal > 0 ? sumMaxVal : undefined, countGrades: grades.length };
  }, [grades]);

  if (!data) return <div className="text-[var(--muted)]">Завантаження...</div>;

  const classroomUrl =
    data?.upcomingHomework.find(h => h.classroomUrl)?.classroomUrl ||
    data?.recentGrades.find(g => g.classroomUrl)?.classroomUrl;

  return (
    <div className="space-y-5">
      <Reveal className="flex items-center justify-between" delayMs={80} y={8} opacityFrom={0}>
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-primary" />
          <div className="text-2xl font-semibold">{data.name}</div>
        </div>
        <Link
          to="/student/schedule"
          className="inline-flex items-center gap-2 text-sm hover:opacity-80   hover-lift"
        >
          <ChevronLeft className="w-4 h-4" /> До розкладу
        </Link>
      </Reveal>

      <Reveal y={6} blurPx={6} opacityFrom={0} delayMs={60}>
        <div className="glasscard hover-lift rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3  ">
          <div className="space-y-1">
            <div className="text-sm text-[var(--muted)]">Викладач</div>
            <div className="font-medium">
              {data.teacher.name}{" "}
              {data.teacher.email && <span className="text-[var(--muted)]">· {data.teacher.email}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {data.meetingUrl ? (
              <a
                href={data.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-contrast)] inline-flex items-center gap-2 hover-lift  "
              >
                <Video className="w-4 h-4" /> Посилання на пару
              </a>
            ) : (
              <span className="text-[var(--muted)] text-sm">Посилання на пару не вказано</span>
            )}
            {classroomUrl && (
              <a
                href={classroomUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2 rounded-xl bg-[var(--primary)] text-[var(--primary-contrast)] inline-flex items-center gap-2 hover-lift  "
              >
                <GraduationCap className="w-4 h-4" /> Classroom
              </a>
            )}
          </div>
        </div>
      </Reveal>

      <Crossfade stateKey={data.updatedAt}>
        <Reveal y={8} blurPx={8} opacityFrom={0} delayMs={90}>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Матеріали */}
            <div className="glasscard hover-lift rounded-2xl p-4  ">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Матеріали</div>
                <Chip>{data.materials.length}</Chip>
              </div>
              <div className="space-y-2">
                {data.materials.map(m => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between gap-2 py-2 border-b border-[var(--border)]/50 last:border-b-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4" />
                      <div className="truncate">{m.title}</div>
                    </div>
                    <RowLink href={m.url}>Відкрити</RowLink>
                  </div>
                ))}
              </div>
            </div>

            {/* Найближчі ДЗ */}
            <div className="glasscard hover-lift rounded-2xl p-4  ">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Найближчі ДЗ</div>
                <Chip>{data.upcomingHomework.length}</Chip>
              </div>
              <div className="space-y-2">
                {data.upcomingHomework.length === 0 && (
                  <div className="text-[var(--muted)] text-sm">Немає запланованих</div>
                )}
                {data.upcomingHomework.map(hw => (
                  <div key={hw.id} className="py-2 border-b border-[var(--border)]/50 last:border-b-0">
                    <div className="font-medium">{hw.text}</div>
                    <div className="text-sm text-[var(--muted)]">
                      Дедлайн: {new Date(hw.dueDate).toLocaleDateString()}
                    </div>
                    {hw.classroomUrl && (
                      <RowLink href={hw.classroomUrl}>
                        <Link2 className="w-4 h-4" /> Classroom
                      </RowLink>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Останні оцінки */}
            <div className="glasscard hover-lift rounded-2xl p-4  ">
              <div className="flex items-center justify-between mb-2">
                <div className="font-semibold">Останні оцінки</div>
                <Chip>
                  Сума: {sumPoints}
                  {typeof sumMax === "number" ? ` / ${sumMax}` : ""} · {countGrades}
                </Chip>
              </div>
              <div className="space-y-2">
                {grades.length === 0 && <div className="text-[var(--muted)] text-sm">Оцінок ще немає</div>}
                {grades.map(g => (
                  <div
                    key={g.id}
                    className="flex items-start justify-between gap-3 py-2 border-b border-[var(--border)]/50 last:border-b-0"
                  >
                    <div className="min-w-0">
                      <div className="font-medium truncate">{g.comment ?? "Оцінка"}</div>
                      <div className="text-sm text-[var(--muted)]">
                        {new Date(g.createdAt).toLocaleDateString()}
                      </div>
                      {g.classroomUrl && <RowLink href={g.classroomUrl}>Classroom</RowLink>}
                    </div>
                    <div className="shrink-0 font-semibold">
                      {g.points}
                      {typeof g.max === "number" ? <span className="text-[var(--muted)]"> / {g.max}</span> : null}
                    </div>
                  </div>
                ))}
                {countGrades > 0 && (
                  <div className="pt-2 text-sm text-right text-[var(--muted)]">
                    Разом: <span className="font-medium text-[var(--text)]">{sumPoints}</span>
                    {typeof sumMax === "number" && (
                      <>
                        {" "}
                        / <span className="font-medium text-[var(--text)]">{sumMax}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Crossfade>

      {data.description && (
        <Reveal y={6} blurPx={6} opacityFrom={0} delayMs={60}>
          <div className="glasscard hover-lift rounded-2xl p-4  ">
            <div className="font-semibold mb-2">Про курс</div>
            <p className="text-[var(--muted)]">{data.description}</p>
          </div>
        </Reveal>
      )}
    </div>
  );
};

export default StudentSubject;
