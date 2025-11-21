// src/pages/admin/AdminCourses.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminCourses, fetchAdminGroups, fetchTeachers } from "@/lib/fakeApi/admin";
import type { Course } from "@/types/courses";
import type { Group } from "@/types/students";
import type { Teacher } from "@/types/teachers";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, BookOpen, User, Users } from "lucide-react";

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { fetchAdminCourses().then(setCourses); }, []);
  useEffect(() => { fetchAdminGroups().then(setGroups); }, []);
  useEffect(() => { fetchTeachers().then(setTeachers); }, []);

  const groupNameById = useMemo(() => {
    const m = new Map<string, string>();
    groups.forEach(g => m.set(g.id, g.name));
    return m;
  }, [groups]);

  const teacherNameById = useMemo(() => {
    const m = new Map<string, string>();
    teachers.forEach(t => m.set(t.id, t.name));
    return m;
  }, [teachers]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return courses;
    return courses.filter(c =>
      c.title.toLowerCase().includes(s) ||
      c.code.toLowerCase().includes(s) ||
      (c.teacherId && (teacherNameById.get(c.teacherId)?.toLowerCase().includes(s))) ||
      c.groupIds.some(gid => groupNameById.get(gid)?.toLowerCase().includes(s))
    );
  }, [courses, q, teacherNameById, groupNameById]);

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
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Курси</h1>
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
            placeholder="Пошук за назвою / кодом / викладачем / групою"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Courses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Список курсів</CardTitle>
            </div>
            <CardDescription>
              Знайдено {filtered.length} з {courses.length} курсів
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="px-6 py-4 font-medium">Код</th>
                    <th className="px-6 py-4 font-medium">Назва</th>
                    <th className="px-6 py-4 font-medium">Викладач</th>
                    <th className="px-6 py-4 font-medium">Групи</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, index) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-t border-white/10 hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <Badge variant="outline" className="font-mono text-xs border-primary/30 text-primary">
                          {c.code}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{c.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {c.teacherId ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span>{teacherNameById.get(c.teacherId) ?? c.teacherId}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {c.groupIds.map((gid, idx) => (
                              <Badge 
                                key={idx} 
                                variant="secondary" 
                                className="text-xs bg-secondary/50"
                              >
                                {groupNameById.get(gid) ?? gid}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td className="px-6 py-12 text-center text-muted-foreground" colSpan={4}>
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

export default AdminCourses;
