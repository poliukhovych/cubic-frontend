// src/pages/student/StudentGrades.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/types/auth";
import { fetchStudentGrades } from "@/lib/fakeApi/student";
import type { SubjectGrades, GradeItem } from "@/types/grades";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X, CheckCircle } from "lucide-react";
import { slugify } from "@/lib/slug";
import { motion, AnimatePresence } from "framer-motion";

const Row: React.FC<{ item: GradeItem }> = ({ item }) => {
  // Використовуємо сірі кольори для всіх оцінок, як предмети на сторінці з домашніми завданнями
  return (
    <motion.div 
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-background/60 transition-colors"
    >
      <div className="space-y-1 flex-1">
        <div className="font-medium text-foreground">{item.comment || "Оцінювання"}</div>
        <div className="text-sm text-muted-foreground">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      </div>
      <Badge 
        variant="outline"
        className="ml-3 font-medium px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground border border-muted/30"
      >
        {item.points} б.
      </Badge>
    </motion.div>
  );
};

const SubjectCard: React.FC<{ data: SubjectGrades }> = ({ data }) => {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="break-inside-avoid"
    >
      <Link to={`/student/subjects/${slugify(data.subject)}`}>
        <div className="glass glass-card overflow-hidden hover:shadow-lg transition-all duration-300 rounded-xl">
          <div className="p-4">
            <h3 className="text-lg font-semibold leading-tight mb-3 text-foreground">{data.subject}</h3>
          </div>
          <div className="px-4 pb-4 space-y-3">
            <div className="space-y-2">
              {data.items.map((item) => (
                <Row key={`${item.id}-${item.createdAt}`} item={item} />
              ))}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border/30">
              <span className="text-sm text-muted-foreground">Загальна сума</span>
              <Badge variant="outline" className="font-medium px-2 py-0.5 text-xs rounded-full bg-muted/20 text-muted-foreground border border-muted/30">
                {data.total} балів
              </Badge>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
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
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-center text-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <CheckCircle className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Оцінки</h1>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
      >
        <div className="glass glass-card p-4 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              Оновлено: {updatedAt ? new Date(updatedAt).toLocaleString() : "—"}
            </div>

            <div className="w-full sm:w-80">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Пошук предмету…"
                  className="pl-9 pr-9"
                />
                {q && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQ("")}
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="text-center py-8"
          >
            <div className="glass glass-card p-8 rounded-xl">
              <p className="text-muted-foreground">
                {q ? `Нічого не знайдено за запитом "${q}"` : "Оцінок ще немає"}
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="columns-1 sm:columns-2 xl:columns-3 gap-6 space-y-0"
          >
            {filtered.map((s, index) => (
              <motion.div
                key={s.subject}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="break-inside-avoid mb-6"
              >
                <SubjectCard data={s} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentGrades;
