// src/pages/admin/AdminStudents.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminStudents, fetchAdminGroups } from "@/lib/fakeApi/admin";
import type { Student, Group } from "@/types/students";

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
    <div className="space-y-4">
      <div className="text-2xl font-semibold">Студенти</div>
      <div className="flex gap-3">
        <input
          className="input max-w-md"
          placeholder="Пошук за ПІБ / email / група"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </div>

      <div className="card p-0 overflow-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">ПІБ</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Група</th>
              <th className="px-4 py-3">Підгрупа</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id} className="border-t" style={{borderColor:"color-mix(in oklab, var(--border), transparent 40%)"}}>
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.email}</td>
                <td className="px-4 py-3">{groupNameById.get(s.groupId) ?? s.groupId}</td>
                <td className="px-4 py-3">{s.subgroup ?? "—"}</td>
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

export default AdminStudents;
