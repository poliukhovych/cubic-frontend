// src/pages/teacher/TeacherSubject.tsx
import React from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/types/auth";
import { fetchTeacherSubject, type TeacherSubjectDetails } from "@/lib/fakeApi/teacher";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, ExternalLink, Video, FileText, Users, ArrowUpDown, Mail, Calendar } from "lucide-react";
import { ClassroomIcon } from "@/components/ClassroomIcon";


const Chip: React.FC<{ children: React.ReactNode; variant?: "default" | "secondary" | "destructive" | "outline"; className?: string }> = ({ children, variant = "secondary", className }) => (
  <Badge variant={variant} className={`text-xs font-medium ${className || ""}`}>{children}</Badge>
);

const RowLink: React.FC<{ href: string; children: React.ReactNode; title?: string }> = ({ href, children, title }) => (
  <a
    href={href}
    target="_blank"
    rel="noreferrer"
    className="inline-flex items-center gap-2 underline hover:opacity-80 break-all [overflow-wrap:anywhere] transition-opacity duration-200"
    title={title}
  >
    {children} <ExternalLink className="w-4 h-4" />
  </a>
);

const TeacherSubject: React.FC = () => {
  const { subjectId = "" } = useParams<{ subjectId: string }>();
  const { user } = useAuth();
  const [data, setData] = React.useState<TeacherSubjectDetails | null>(null);
  type SortKey = "name" | "email" | "group" | "total";
type SortDir = "asc" | "desc";
const [sort, setSort] = React.useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });
const rows = React.useMemo(() => {
  const list = (data?.students ?? []).map(({ student, grades }) => ({
    student,
    grades,
    total: grades.reduce((s, g) => s + g.points, 0),
    name: student.name,
    email: student.email ?? "",
    group: student.groupId + (student.subgroup ? `/${student.subgroup}` : ""),
  }));
  return list;
}, [data?.students]);

const sorted = React.useMemo(() => {
  const arr = [...rows];
  const { key, dir } = sort;
  arr.sort((a, b) => {
    const va = a[key];
    const vb = b[key];
    if (key === "total") {
      return dir === "asc" ? (va as number) - (vb as number) : (vb as number) - (va as number);
    }
    // рядкове порівняння, case-insensitive
    const sa = String(va).toLocaleLowerCase();
    const sb = String(vb).toLocaleLowerCase();
    if (sa < sb) return dir === "asc" ? -1 : 1;
    if (sa > sb) return dir === "asc" ? 1 : -1;
    return 0;
  });
  return arr;
}, [rows, sort]);

function toggleSort(key: SortKey) {
  setSort((prev) => (prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }));
}

function ariaFor(key: SortKey): React.AriaAttributes["aria-sort"] {
  if (sort.key !== key) return "none";
  return sort.dir === "asc" ? "ascending" : "descending";
}

  React.useEffect(() => {
    if (!user || !subjectId) return;
    let alive = true;
    fetchTeacherSubject(user.id, subjectId).then(res => { if (alive) setData(res); });
    return () => { alive = false; };
  }, [user, subjectId]);

  // ✅ Хуки/обчислення — ДО будь-яких умовних return
  const grades = data?.recentGrades ?? [];
  React.useMemo(() => {
        const sumPoints = grades.reduce((s, g) => s + g.points, 0);
        const sumMaxVal = grades.reduce((s, g) => s + (typeof g.max === "number" ? g.max : 0), 0);
        return { sumPoints, sumMax: sumMaxVal > 0 ? sumMaxVal : undefined, countGrades: grades.length };
    }, [grades]);

  const classroomUrl =
    data?.upcomingHomework.find(h => h.classroomUrl)?.classroomUrl ||
    data?.recentGrades.find(g => g.classroomUrl)?.classroomUrl;

  if (!data) return <div className="text-[var(--muted)]">Завантаження...</div>;


  return (
    <div className="space-y-6 break-words [overflow-wrap:anywhere]">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground break-words [overflow-wrap:anywhere]">{data.name}</h1>
        </div>
      </motion.div>

      {/* Верхній інформаційний блок */}
      <motion.div 
        initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.06 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300 glass glass-card backdrop-blur-sm border border-border/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${data.teacher.name}`} />
                <AvatarFallback>{data.teacher.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 min-w-0">
                <div className="text-sm text-muted-foreground">Викладач</div>
                <div className="font-semibold text-lg break-words [overflow-wrap:anywhere]">
                  {data.teacher.name}
                </div>
                {data.teacher.email && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">
                    <Mail className="w-3 h-3" />
                    {data.teacher.email}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {data.meetingUrl ? (
                <Button asChild className="hover:scale-105 transition-transform duration-200">
                  <a href={data.meetingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">
                    <Video className="w-4 h-4" /> Посилання на пару
                  </a>
                </Button>
              ) : (
                <span className="text-muted-foreground text-sm">Посилання на пару не вказано</span>
              )}
              {classroomUrl && (
                <ClassroomIcon href={classroomUrl} className="w-8 h-8" />
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.09 }}
      >
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {/* Матеріали */}
          <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 glass glass-card backdrop-blur-sm border border-border/20">
            <CardHeader className="bg-card/60 backdrop-blur-sm border-b border-border/10">
              <div className="flex items-center justify-between">
                <CardTitle className="font-semibold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Матеріали
                </CardTitle>
                <Chip variant="outline" className="chip-primary-border">{data.materials.length}</Chip>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {data.materials.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-4">Матеріалів ще немає</div>
              ) : (
                data.materials.map((m, index) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between gap-2 py-3 border-b border-border/50 last:border-b-0 hover:bg-accent/50 px-3 rounded transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <div className="break-words [overflow-wrap:anywhere] max-w-full font-medium">{m.title}</div>
                    </div>
                    {m.url.includes('classroom.google.com') ? (
                      <ClassroomIcon href={m.url} className="w-6 h-6" />
                    ) : (
                      <RowLink href={m.url}>Відкрити</RowLink>
                    )}
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Найближчі ДЗ */}
          <Card className="overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 glass glass-card backdrop-blur-sm border border-border/20">
            <CardHeader className="bg-card/60 backdrop-blur-sm border-b border-border/10">
              <div className="flex items-center justify-between">
                <CardTitle className="font-semibold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Найближчі ДЗ
                </CardTitle>
                <Chip variant="outline" className="chip-primary-border">{data.upcomingHomework.length}</Chip>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {data.upcomingHomework.length === 0 ? (
                <div className="text-muted-foreground text-sm text-center py-4">Немає запланованих завдань</div>
              ) : (
                data.upcomingHomework.map((hw, index) => (
                  <motion.div 
                    key={hw.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="py-3 border-b border-border/50 last:border-b-0 hover:bg-accent/50 px-3 rounded transition-colors duration-200"
                  >
                    <div className="font-medium break-words [overflow-wrap:anywhere] mb-2">{hw.text}</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Дедлайн: {new Date(hw.dueDate).toLocaleDateString()}
                      </div>
                      {hw.classroomUrl && (
                        <ClassroomIcon href={hw.classroomUrl} className="w-5 h-5" />
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.06 }}
      >
        <Card className="p-6 hover:shadow-lg transition-all duration-300 glass glass-card backdrop-blur-sm border border-border/20">
          <div className="flex items-center justify-between mb-4">
            <CardTitle className="font-semibold inline-flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" /> 
              Студенти
            </CardTitle>
            <Chip variant="outline" className="chip-primary-border">{rows.length}</Chip>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-muted-foreground">
                <tr className="border-b border-border/60">
                  <th className="text-left py-2 pr-3 w-10">#</th>

                  <th
                    role="button"
                    aria-sort={ariaFor("name")}
                    onClick={() => toggleSort("name")}
                    className="text-left py-2 pr-3 cursor-pointer select-none hover:text-foreground transition-colors"
                    title="Сортувати за ПІБ"
                  >
                    <span className="inline-flex items-center gap-1">
                      Студент
                      <ArrowUpDown className="w-4 h-4 opacity-70" />
                    </span>
                  </th>

                  <th
                    role="button"
                    aria-sort={ariaFor("email")}
                    onClick={() => toggleSort("email")}
                    className="text-left py-2 pr-3 cursor-pointer select-none hover:text-foreground transition-colors"
                    title="Сортувати за email"
                  >
                    <span className="inline-flex items-center gap-1">
                      Email
                      <ArrowUpDown className="w-4 h-4 opacity-70" />
                    </span>
                  </th>

                  <th
                    role="button"
                    aria-sort={ariaFor("group")}
                    onClick={() => toggleSort("group")}
                    className="text-left py-2 pr-3 cursor-pointer select-none hover:text-foreground transition-colors"
                    title="Сортувати за групою"
                  >
                    <span className="inline-flex items-center gap-1">
                      Група
                      <ArrowUpDown className="w-4 h-4 opacity-70" />
                    </span>
                  </th>

                  <th
                    role="button"
                    aria-sort={ariaFor("total")}
                    onClick={() => toggleSort("total")}
                    className="text-right py-2 cursor-pointer select-none hover:text-foreground transition-colors"
                    title="Сортувати за сумою балів"
                  >
                    <span className="inline-flex items-center gap-1 justify-end w-full">
                      Сума балів
                      <ArrowUpDown className="w-4 h-4 opacity-70" />
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {sorted.map(({ student, email, group, total }, idx) => (
                  <tr key={student.id} className="border-b border-border/40 last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="py-3 pr-3 text-muted-foreground">{idx + 1}</td>
                    <td className="py-3 pr-3 font-medium">{student.name}</td>
                    <td className="py-3 pr-3">
                      {email ? <a href={`mailto:${email}`} className="underline hover:text-primary transition-colors">{email}</a> : <span className="text-muted-foreground">—</span>}
                    </td>
                    <td className="py-3 pr-3">{group}</td>
                    <td className="py-3 text-right font-semibold">{total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>

      {data.description && (
        <motion.div 
          initial={{ opacity: 0, y: 6, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.06 }}
        >
          <Card className="p-4 hover:shadow-lg transition-all duration-300 glass glass-card backdrop-blur-sm border border-border/20">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="font-semibold">Про курс</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <p className="text-muted-foreground break-words [overflow-wrap:anywhere]">{data.description}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default TeacherSubject;
