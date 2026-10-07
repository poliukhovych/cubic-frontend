import React, { useEffect, useMemo, useState } from "react";
import {
  fetchSchedulesApi,
  activateScheduleApi,
  deleteScheduleApi,
  type ScheduleResponse,
} from "@/lib/api/schedule-api";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Archive, Search, Eye, Trash2, Calendar, CheckCircle } from "lucide-react";

const AdminArchive: React.FC = () => {
  const [list, setList] = useState<ScheduleResponse[]>([]);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => setList(await fetchSchedulesApi());
  useEffect(() => { reload().catch(() => setError("Не вдалося завантажити розклади")); }, []);

  const run = async (id: string, action: () => Promise<unknown>) => {
    setBusyId(id);
    setError(null);
    try {
      await action();
      await reload();
    } catch (e) {
      const err = e as { detail?: string; message?: string };
      setError(err?.detail || err?.message || "Щось пішло не так");
    } finally {
      setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return list;
    return list.filter(it =>
      it.label.toLowerCase().includes(s) ||
      new Date(it.createdAt).toLocaleString().toLowerCase().includes(s)
    );
  }, [list, q]);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <Archive className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Архів</h1>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex justify-center"
      >
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            className="pl-10 backdrop-blur-md bg-background/50 border-white/10"
            placeholder="Пошук за назвою / датою"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Archive Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Archive className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Збережені розклади</CardTitle>
            </div>
            <CardDescription>
              Знайдено {filtered.length} з {list.length}. Студенти й викладачі бачать активний розклад.
            </CardDescription>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="px-6 py-4 font-medium">Назва</th>
                    <th className="px-6 py-4 font-medium">Дата створення</th>
                    <th className="px-6 py-4 font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, index) => (
                    <motion.tr
                      key={s.scheduleId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-t border-white/10 hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{s.label}</span>
                          {s.isActive && (
                            <Badge variant="outline" className="ml-2 text-xs border-primary/30 text-primary">
                              Активний
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground">
                          {new Date(s.createdAt).toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="outline"
                            size="sm"
                            className="bg-background/50 backdrop-blur hover:bg-background/80"
                          >
                            <Link
                              to={`/admin/archive/${s.scheduleId}`}
                              target="_blank"
                              rel="noopener"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Переглянути
                            </Link>
                          </Button>
                          {!s.isActive && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busyId === s.scheduleId}
                              onClick={() => run(s.scheduleId, () => activateScheduleApi(s.scheduleId))}
                              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/30"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Зробити активним
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={s.isActive || busyId === s.scheduleId}
                            title={s.isActive ? "Активний розклад видалити не можна" : undefined}
                            onClick={() => {
                              if (!confirm(`Видалити «${s.label}» разом із заняттями?`)) return;
                              run(s.scheduleId, () => deleteScheduleApi(s.scheduleId));
                            }}
                            className="bg-destructive/10 hover:bg-destructive/20 text-destructive border-destructive/30"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Видалити
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-6 py-12 text-center text-muted-foreground" colSpan={3}>
                        <div className="flex flex-col items-center gap-2">
                          <Search className="w-8 h-8 text-muted-foreground/50" />
                          <span>Нічого не знайдено...</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminArchive;
