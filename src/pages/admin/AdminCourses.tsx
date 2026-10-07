// src/pages/admin/AdminCourses.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, User, Plus, Edit2, Trash2 } from "lucide-react";
import type { Course } from "@/types/courses";
import type { Group } from "@/types/students";
import type { Teacher } from "@/types/teachers";
import {
  fetchCoursesApi,
  createCourseApi,
  updateCourseApi,
  deleteCourseApi,
} from "@/lib/api/courses-api";
import { fetchGroupsApi } from "@/lib/api/groups-api";
import { fetchTeachersApi } from "@/lib/api/teachers-api";

const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [q, setQ] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    code: "",
    title: "",
    duration: "",
    teacherId: "",
    groupIds: [] as string[],
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [coursesData, groupsData, teachersData] = await Promise.all([
        fetchCoursesApi(),
        fetchGroupsApi(),
        fetchTeachersApi(),
      ]);
      setCourses(coursesData);
      setGroups(groupsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error("Failed to load data:", error);
    }
  };

  const groupNameById = useMemo(() => {
    const m = new Map<string, string>();
    groups.forEach((g) => m.set(g.id, g.name));
    return m;
  }, [groups]);

  const teacherNameById = useMemo(() => {
    const m = new Map<string, string>();
    teachers.forEach((t) => m.set(t.id, t.name));
    return m;
  }, [teachers]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return courses;
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(s) ||
        c.code.toLowerCase().includes(s) ||
        (c.teacherId &&
          teacherNameById.get(c.teacherId)?.toLowerCase().includes(s)) ||
        c.groupIds.some((gid) =>
          groupNameById.get(gid)?.toLowerCase().includes(s),
        ),
    );
  }, [courses, q, teacherNameById, groupNameById]);

  // Спільна валідація для create / update
  const parseDurationOrAlert = (): number | null => {
    if (!courseForm.duration.trim()) {
      alert("Введіть довжину курсу");
      return null;
    }
    const durationNumber = Number(courseForm.duration);
    if (!Number.isFinite(durationNumber) || durationNumber <= 0) {
      alert("Довжина курсу має бути додатним числом");
      return null;
    }
    return durationNumber;
  };

  const buildTeacherIds = (): string[] =>
    courseForm.teacherId && courseForm.teacherId.length > 0
      ? [courseForm.teacherId]
      : [];

  // CREATE
  const handleCreate = async () => {
    if (!courseForm.title.trim()) {
      alert("Введіть назву курсу");
      return;
    }
    const durationNumber = parseDurationOrAlert();
    if (durationNumber == null) return;

    try {
      const created = await createCourseApi({
        name: courseForm.title,
        duration: durationNumber,
        group_ids: courseForm.groupIds,
        teacher_ids: buildTeacherIds(),
      });

      const newCourse: Course = {
        ...created,
        code: courseForm.code || created.code || "",
      };

      setCourses([...courses, newCourse]);
      setDialogOpen(false);
      setCourseForm({
        code: "",
        title: "",
        duration: "",
        teacherId: "",
        groupIds: [],
      });
    } catch (err: any) {
      console.error("Failed to create course:", err);
      alert(err.detail || "Не вдалося створити курс");
    }
  };

  // UPDATE
  const handleUpdate = async () => {
    if (!editingCourse) return;
    if (!courseForm.title.trim()) {
      alert("Введіть назву курсу");
      return;
    }
    const durationNumber =
      courseForm.duration.trim().length > 0
        ? parseDurationOrAlert()
        : editingCourse.duration ?? null;
    if (durationNumber == null) {
      alert("Немає тривалості курсу (duration)");
      return;
    }

    try {
      const updated = await updateCourseApi(editingCourse.id, {
        name: courseForm.title,
        duration: durationNumber,
        group_ids: courseForm.groupIds,
        teacher_ids: buildTeacherIds(),
      });

      const next: Course = {
        ...updated,
        code: courseForm.code || updated.code || "",
      };

      setCourses(courses.map((c) => (c.id === next.id ? next : c)));

      setDialogOpen(false);
      setEditingCourse(null);
      setCourseForm({
        code: "",
        title: "",
        duration: "",
        teacherId: "",
        groupIds: [],
      });
    } catch (err: any) {
      console.error("Failed to update course:", err);
      alert(err.detail || "Не вдалося оновити курс");
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Видалити цей курс?")) return;
    try {
      await deleteCourseApi(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err: any) {
      console.error("Failed to delete course:", err);
      alert(err.detail || "Не вдалося видалити курс");
    }
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      title: course.title,
      duration:
        course.duration !== undefined && course.duration !== null
          ? String(course.duration)
          : "",
      teacherId: course.teacherId || "",
      groupIds: course.groupIds,
    });
    setDialogOpen(true);
  };

  const toggleGroup = (groupId: string) => {
    setCourseForm((prev) => ({
      ...prev,
      groupIds: prev.groupIds.includes(groupId)
        ? prev.groupIds.filter((g) => g !== groupId)
        : [...prev.groupIds, groupId],
    }));
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
          <BookOpen className="w-10 h-10" />
          Курси
        </h1>
      </motion.div>

      {/* Search & Add */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex gap-4 flex-wrap"
      >
        <div className="flex-1 min-w-[250px]">
          <Input
            placeholder="Пошук за назвою, кодом, викладачем або групою..."
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setEditingCourse(null);
            setCourseForm({
              code: "",
              title: "",
              duration: "",
              teacherId: "",
              groupIds: [],
            });
            setDialogOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Додати курс
        </Button>
      </motion.div>

      {/* Courses Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glasscard">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Список курсів
            </CardTitle>
            <CardDescription>
              Знайдено {filtered.length} з {courses.length} курсів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted font-medium">Код</th>
                    <th className="text-left p-3 text-muted font-medium">Назва</th>
                    <th className="text-left p-3 text-muted font-medium">Викладач</th>
                    <th className="text-left p-3 text-muted font-medium">Групи</th>
                    <th className="text-right p-3 text-muted font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, index) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="border-b border-border/50 hover:bg-surface-2/30 transition-colors"
                    >
                      <td className="p-3">
                        <Badge
                          variant="outline"
                          className="font-mono bg-blue-500/20 text-blue-300 border-blue-500/30"
                        >
                          {c.code}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{c.title}</td>
                      <td className="p-3 text-muted">
                        {c.teacherId ? (
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            {teacherNameById.get(c.teacherId) ?? c.teacherId}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {c.groupIds.length > 0 ? (
                            c.groupIds.map((gid, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                              >
                                {groupNameById.get(gid) ?? gid}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Немає груп
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openEditDialog(c)}
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(c.id)}
                          >
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

      {/* Course Dialog */}
      {dialogOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setDialogOpen(false)}
        >
          <div
            className="glasscardMd w-full max-w-md p-6 m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-2">
              {editingCourse ? "Редагувати курс" : "Новий курс"}
            </h2>
            <p className="text-sm text-muted mb-6">
              {editingCourse ? "Оновіть дані курсу" : "Додайте новий курс"}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Довжина курсу
                </label>
                <Input
                  placeholder="Напр. 40"
                  type="number"
                  value={courseForm.duration}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, duration: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Назва курсу
                </label>
                <Input
                  placeholder="Бази даних"
                  value={courseForm.title}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, title: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Код курсу (локальний)
                </label>
                <Input
                  placeholder="DB101 (не зберігається в бекенді)"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, code: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Викладач
                </label>
                <select
                  className="input w-full"
                  value={courseForm.teacherId}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, teacherId: e.target.value })
                  }
                >
                  <option value="">Не призначено</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Групи</label>
                <div className="space-y-2 max-h-40 overflow-y-auto border border-border rounded-md p-3">
                  {groups.map((group) => (
                    <label
                      key={group.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-surface-2/30 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={courseForm.groupIds.includes(group.id)}
                        onChange={() => toggleGroup(group.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{group.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="btn flex-1"
              >
                Скасувати
              </Button>
              <Button
                onClick={editingCourse ? handleUpdate : handleCreate}
                className="btn-primary flex-1"
              >
                {editingCourse ? "Зберегти" : "Створити"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
