// src/pages/admin/AdminCourses.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminCourses, fetchAdminGroups, fetchTeachers } from "@/lib/fakeApi/admin";
import type { Course } from "@/types/courses";
import type { Group } from "@/types/students";
import type { Teacher } from "@/types/teachers";

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
    <div className="space-y-4">
      <div className="text-2xl font-semibold">Курси</div>
      <div className="flex gap-3">
        <input
          className="input max-w-md"
          placeholder="Пошук за назвою / кодом / викладачем / групою"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Код</th>
              <th className="px-4 py-3">Назва</th>
              <th className="px-4 py-3">Викладач</th>
              <th className="px-4 py-3">Групи</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="border-t" style={{borderColor:"color-mix(in oklab, var(--border), transparent 40%)"}}>
                <td className="px-4 py-3">{c.code}</td>
                <td className="px-4 py-3">{c.title}</td>
                <td className="px-4 py-3">{c.teacherId ? (teacherNameById.get(c.teacherId) ?? c.teacherId) : "—"}</td>
                <td className="px-4 py-3">
                  {c.groupIds.map(gid => groupNameById.get(gid) ?? gid).join(", ")}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-[var(--muted)]" colSpan={4}>Нічого не знайдено…</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCourses;
