// src/pages/admin/AdminStudents.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchAdminGroups, fetchAdminStudents } from "@/lib/fakeApi/admin";
import type { Group, Student } from "@/types/students";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Plus, Edit2, Trash2, GraduationCap, BookOpen } from "lucide-react";

const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [q, setQ] = useState("");

  // Group dialog state
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [groupForm, setGroupForm] = useState({ name: "", type: "bachelor" as "bachelor" | "master", course: 1 });

  // Student dialog state
  const [studentDialogOpen, setStudentDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentForm, setStudentForm] = useState({ fullName: "", groupId: "", status: "active" as "pending" | "active" | "inactive" });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsData, groupsData] = await Promise.all([
        fetchAdminStudents(),
        fetchAdminGroups()
      ]);

      setStudents(studentsData);
      setGroups(groupsData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

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

  // Group handlers
  const handleCreateGroup = async () => {
    if (!groupForm.name.trim()) {
      alert("Введіть назву групи");
      return;
    }
    
    console.log('[FAKE] Creating group:', groupForm);
    const newGroup: Group = {
      id: `g${Date.now()}`,
      name: groupForm.name,
      type: groupForm.type,
      course: groupForm.course,
      size: 0
    };
    
    setGroups([...groups, newGroup]);
    setGroupDialogOpen(false);
    setGroupForm({ name: "", type: "bachelor", course: 1 });
  };

  const handleUpdateGroup = async () => {
    if (!editingGroup) return;
    if (!groupForm.name.trim()) {
      alert("Введіть назву групи");
      return;
    }
    
    console.log('[FAKE] Updating group:', editingGroup.id, groupForm);
    setGroups(groups.map(g => 
      g.id === editingGroup.id 
        ? { ...g, name: groupForm.name, type: groupForm.type, course: groupForm.course }
        : g
    ));
    
    setGroupDialogOpen(false);
    setEditingGroup(null);
    setGroupForm({ name: "", type: "bachelor", course: 1 });
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm("Видалити цю групу?")) return;
    
    console.log('[FAKE] Deleting group:', id);
    setGroups(groups.filter(g => g.id !== id));
  };

  // Student handlers
  const handleUpdateStudent = async () => {
    if (!editingStudent) return;
    if (!studentForm.fullName.trim()) {
      alert("Введіть ПІБ студента");
      return;
    }
    
    console.log('[FAKE] Updating student:', editingStudent.id, studentForm);
    setStudents(students.map(s =>
      s.id === editingStudent.id
        ? { ...s, name: studentForm.fullName, groupId: studentForm.groupId, status: studentForm.status }
        : s
    ));
    
    setStudentDialogOpen(false);
    setEditingStudent(null);
    setStudentForm({ fullName: "", groupId: "", status: "active" });
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm("Видалити цього студента?")) return;
    
    console.log('[FAKE] Deleting student:', id);
    setStudents(students.filter(s => s.id !== id));
  };

  const openEditGroupDialog = (group: Group) => {
    setEditingGroup(group);
    setGroupForm({ name: group.name, type: group.type, course: group.course });
    setGroupDialogOpen(true);
  };

  const openEditStudentDialog = (student: Student) => {
    setEditingStudent(student);
    setStudentForm({ fullName: student.name, groupId: student.groupId, status: student.status });
    setStudentDialogOpen(true);
  };

  const getGroupBadgeColor = (type: string) => {
    return type === 'bachelor' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-purple-500/20 text-purple-300 border-purple-500/30';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
      default: return '';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Users className="w-10 h-10" />
          Студенти
        </h1>
      </motion.div>

      {/* Groups Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Card className="glasscard">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Групи
              </CardTitle>
              <CardDescription>Управління групами та курсами</CardDescription>
            </div>
            <Button 
              onClick={() => {
                setEditingGroup(null);
                setGroupForm({ name: "", type: "bachelor", course: 1 });
                setGroupDialogOpen(true);
              }} 
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Додати групу
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map((group) => (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glasscard p-4 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-2">{group.name}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={getGroupBadgeColor(group.type)}>
                          {group.type === 'bachelor' ? 'Бакалавр' : 'Магістр'}
                        </Badge>
                        <Badge variant="outline">{group.course} курс</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" onClick={() => openEditGroupDialog(group)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteGroup(group.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Input
          placeholder="Пошук студентів..."
          className="input"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </motion.div>

      {/* Students Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="glasscard">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Список студентів
            </CardTitle>
            <CardDescription>
              Знайдено {filtered.length} з {students.length} студентів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted font-medium">ПІБ</th>
                    <th className="text-left p-3 text-muted font-medium">Email</th>
                    <th className="text-left p-3 text-muted font-medium">Група</th>
                    <th className="text-left p-3 text-muted font-medium">Статус</th>
                    <th className="text-right p-3 text-muted font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, index) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-surface-2/30 transition-colors"
                    >
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3 text-muted">{s.email}</td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {(groupNameById.get(s.groupId) ?? s.groupId) || '—'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Badge className={getStatusBadgeColor(s.status)}>
                          {s.status === 'active' ? 'Активний' : s.status === 'pending' ? 'Очікує' : 'Неактивний'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="ghost" onClick={() => openEditStudentDialog(s)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => handleDeleteStudent(s.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted">
                        Нічого не знайдено...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Group Dialog */}
      {groupDialogOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setGroupDialogOpen(false)}
        >
          <div 
            className="glasscardMd w-full max-w-md p-6 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">
              {editingGroup ? "Редагувати групу" : "Нова група"}
            </h2>
            <p className="text-sm text-muted mb-6">
              {editingGroup ? "Оновіть дані групи" : "Створіть нову групу"}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Назва групи</label>
                <Input
                  placeholder="КН-301"
                  value={groupForm.name}
                  onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Тип освіти</label>
                <select
                  className="input w-full"
                  value={groupForm.type}
                  onChange={(e) => setGroupForm({ ...groupForm, type: e.target.value as "bachelor" | "master" })}
                >
                  <option value="bachelor">Бакалавр</option>
                  <option value="master">Магістр</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Курс</label>
                <select
                  className="input w-full"
                  value={groupForm.course}
                  onChange={(e) => setGroupForm({ ...groupForm, course: Number(e.target.value) })}
                >
                  {[1, 2, 3, 4, 5, 6].map(c => (
                    <option key={c} value={c}>{c} курс</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setGroupDialogOpen(false)} className="btn flex-1">
                Скасувати
              </Button>
              <Button onClick={editingGroup ? handleUpdateGroup : handleCreateGroup} className="btn-primary flex-1">
                {editingGroup ? "Зберегти" : "Створити"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Student Dialog */}
      {studentDialogOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setStudentDialogOpen(false)}
        >
          <div 
            className="glasscardMd w-full max-w-md p-6 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">Редагувати студента</h2>
            <p className="text-sm text-muted mb-6">Оновіть дані студента</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ПІБ</label>
                <Input
                  placeholder="Прізвище Ім'я По батькові"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Група</label>
                <select
                  className="input w-full"
                  value={studentForm.groupId}
                  onChange={(e) => setStudentForm({ ...studentForm, groupId: e.target.value })}
                >
                  <option value="">Оберіть групу</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Статус</label>
                <select
                  className="input w-full"
                  value={studentForm.status}
                  onChange={(e) => setStudentForm({ ...studentForm, status: e.target.value as any })}
                >
                  <option value="active">Активний</option>
                  <option value="pending">Очікує</option>
                  <option value="inactive">Неактивний</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={() => setStudentDialogOpen(false)} className="btn flex-1">
                Скасувати
              </Button>
              <Button onClick={handleUpdateStudent} className="btn-primary flex-1">
                Зберегти
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
