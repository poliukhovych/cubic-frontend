// src/pages/admin/AdminStudents.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminStudents, fetchAdminGroups } from "@/lib/fakeApi/admin";
import type { Student, Group } from "@/types/students";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, User } from "lucide-react";

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => { fetchAdminStudents().then(setStudents); }, []);
  useEffect(() => { fetchAdminGroups().then(setGroups); }, []);

  const groupNameById = useMemo(() => {
    const m = new Map<string, string>();
    groups.forEach(g => m.set(g.id, g.name));
    return m;
  }, [groups]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return students;
    return students.filter(st =>
      st.name.toLowerCase().includes(s) ||
      st.email.toLowerCase().includes(s) ||
      groupNameById.get(st.groupId)?.toLowerCase().includes(s)
    );
  }, [students, q, groupNameById]);

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
          <Users className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Студенти</h1>
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
            placeholder="Пошук за ПІБ / email / група"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">Список студентів</CardTitle>
            </div>
            <CardDescription>
              Знайдено {filtered.length} з {students.length} студентів
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="px-6 py-4 font-medium">ПІБ</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Група</th>
                    <th className="px-6 py-4 font-medium">Підгрупа</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, index) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-t border-white/10 hover:bg-muted/10 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-muted-foreground">{s.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-primary/10 text-primary">
                          {groupNameById.get(s.groupId) ?? s.groupId}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {s.subgroup ? (
                          <Badge variant="outline" className="border-primary/30 text-primary">
                            {s.subgroup}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
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

export default AdminStudents;
