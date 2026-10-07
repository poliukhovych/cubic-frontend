// src/pages/admin/AdminTeachers.tsx
import React, { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Plus, Edit2, Trash2, Users } from "lucide-react";
import type { Teacher, TeacherStatus } from "@/types/teachers";
import type { Course } from "@/types/courses";
import {
  fetchTeachersApi,
  createTeacherApi,
  updateTeacherApi,
  deleteTeacherApi,
  getTeacherApi,
} from "@/lib/api/teachers-api";
import { fetchCoursesApi, updateCourseApi } from "@/lib/api/courses-api";

// Розбиває "Петренко Іван Олександрович" → lastName/firstName/patronymic
function splitFullName(fullName: string): {
  lastName: string;
  firstName: string;
  patronymic: string;
} {
  const parts = fullName.trim().split(/\s+/);
  const [lastName = "", firstName = "", ...rest] = parts;
  const patronymic = rest.join(" ");
  return { lastName, firstName, patronymic };
}

function statusBadgeClass(status: TeacherStatus | undefined): string {
  switch (status) {
    case "active":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "pending":
      return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
    case "inactive":
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
}

const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState("");

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [teacherForm, setTeacherForm] = useState<{
    name: string;
    status: TeacherStatus;
    courseIds: string[];
  }>({
    name: "",
    status: "active",
    courseIds: [],
  });

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [teachersData, coursesData] = await Promise.all([
        fetchTeachersApi(),
        fetchCoursesApi(),
      ]);
      setTeachers(teachersData);
      setCourses(coursesData);
    } catch (error) {
      console.error("Failed to load teachers/courses:", error);
    }
  };

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return teachers;

    return teachers.filter((t) => {
      const statusLabel =
        t.status === "active"
          ? "активний"
          : t.status === "pending"
          ? "очікує"
          : t.status === "inactive"
          ? "неактивний"
          : "";
      const teacherCourses = courses.filter((c) => c.teacherId === t.id);
      const coursesString = teacherCourses.map((c) => c.title).join(" ").toLowerCase();

      return (
        t.name.toLowerCase().includes(s) ||
        statusLabel.includes(s) ||
        coursesString.includes(s)
      );
    });
  }, [teachers, courses, q]);

  // Синхронізація курсів викладача з бекендом:
  // виставляємо teacherId у курсів, де він обраний, і прибираємо там, де зняли галочку
  const syncTeacherCourses = async (teacherId: string, selectedCourseIds: string[]) => {
    const changes = courses.filter((c) => {
      const isSelected = selectedCourseIds.includes(c.id);
      const hasThisTeacher = c.teacherId === teacherId;
      return (isSelected && !hasThisTeacher) || (!isSelected && hasThisTeacher);
    });

    if (changes.length === 0) return;

    await Promise.all(
      changes.map((c) =>
        updateCourseApi(c.id, {
          name: c.title,
          duration: c.duration ?? 40,
          group_ids: c.groupIds,
          teacher_ids: selectedCourseIds.includes(c.id) ? [teacherId] : [],
        }),
      ),
    );

    // Перечитати курси, щоб таблиця/форма бачили свіжі звʼязки
    const updatedCourses = await fetchCoursesApi();
    setCourses(updatedCourses);
  };

  // CREATE (через бекенд)
  const handleCreate = async () => {
    if (!teacherForm.name.trim()) {
      alert("Введіть ПІБ");
      return;
    }

    const { lastName, firstName, patronymic } = splitFullName(teacherForm.name);
    if (!lastName || !firstName) {
      alert("ПІБ має містити принаймні прізвище та імʼя");
      return;
    }

    setIsSaving(true);
    try {
      const created = await createTeacherApi({
        first_name: firstName,
        last_name: lastName,
        patronymic,
        status: teacherForm.status,
        user_id: null,
      });

      // Спочатку зберігаємо викладача, потім зв'язуємо курси
      await syncTeacherCourses(created.id, teacherForm.courseIds);

      setTeachers((prev) => [...prev, { ...created, subjects: [] }]);
      setDialogOpen(false);
      setEditingTeacher(null);
      setTeacherForm({ name: "", status: "active", courseIds: [] });
    } catch (err: any) {
      console.error("Failed to create teacher:", err);
      alert(err.detail || "Не вдалося створити викладача");
    } finally {
      setIsSaving(false);
    }
  };

  // UPDATE (через бекенд)
  const handleUpdate = async () => {
    if (!editingTeacher) return;
    if (!teacherForm.name.trim()) {
      alert("Введіть ПІБ");
      return;
    }

    const { lastName, firstName, patronymic } = splitFullName(teacherForm.name);
    if (!lastName || !firstName) {
      alert("ПІБ має містити принаймні прізвище та імʼя");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateTeacherApi(editingTeacher.id, {
        first_name: firstName,
        last_name: lastName,
        patronymic,
        status: teacherForm.status,
        user_id: null,
      });

      await syncTeacherCourses(updated.id, teacherForm.courseIds);

      setTeachers((prev) =>
        prev.map((t) => (t.id === updated.id ? { ...updated, subjects: t.subjects } : t)),
      );

      setDialogOpen(false);
      setEditingTeacher(null);
      setTeacherForm({ name: "", status: "active", courseIds: [] });
    } catch (err: any) {
      console.error("Failed to update teacher:", err);
      alert(err.detail || "Не вдалося оновити викладача");
    } finally {
      setIsSaving(false);
    }
  };

  // DELETE (через бекенд)
  const handleDelete = async (id: string) => {
    if (!confirm("Видалити цього викладача?")) return;

    try {
      await deleteTeacherApi(id);
      setTeachers((prev) => prev.filter((t) => t.id !== id));
      // курси автоматично перестануть показувати цього викладача, якщо бекенд чистить звʼязок;
      // якщо ні – можна окремо пройтися й обнулити teacherId через updateCourseApi
    } catch (err: any) {
      console.error("Failed to delete teacher:", err);
      alert(err.detail || "Не вдалося видалити викладача");
    }
  };

  const openEditDialog = async (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setDialogOpen(true);
    setIsSaving(false);

    try {
      const backend = await getTeacherApi(teacher.id);
      const fullName =
        backend.full_name && backend.full_name.trim().length > 0
          ? backend.full_name
          : `${backend.lastName} ${backend.firstName} ${backend.patronymic}`.trim();

      const teacherCourses = courses.filter((c) => c.teacherId === teacher.id);

      setTeacherForm({
        name: fullName,
        status: backend.status,
        courseIds: teacherCourses.map((c) => c.id),
      });
    } catch (e) {
      console.error("Failed to load teacher details:", e);
      const fallbackCourses = courses.filter((c) => c.teacherId === teacher.id);
      setTeacherForm({
        name: teacher.name,
        status: teacher.status ?? "active",
        courseIds: fallbackCourses.map((c) => c.id),
      });
    }
  };

  const toggleCourse = (courseId: string) => {
    setTeacherForm((prev) => ({
      ...prev,
      courseIds: prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId],
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
          <Users className="w-10 h-10" />
          Викладачі
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
            placeholder="Пошук за ПІБ, статусом або курсом..."
            className="input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button
          onClick={() => {
            setEditingTeacher(null);
            setTeacherForm({ name: "", status: "active", courseIds: [] });
            setDialogOpen(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Додати викладача
        </Button>
      </motion.div>

      {/* Teachers Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="glasscard">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Список викладачів
            </CardTitle>
            <CardDescription>
              Знайдено {filtered.length} з {teachers.length} викладачів
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-3 text-muted font-medium">ПІБ</th>
                    <th className="text-left p-3 text-muted font-medium">Статус</th>
                    <th className="text-left p-3 text-muted font-medium">Курси</th>
                    <th className="text-right p-3 text-muted font-medium">Дії</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t, index) => {
                    const teacherCourses = courses.filter(
                      (c) => c.teacherId === t.id,
                    );
                    return (
                      <motion.tr
                        key={t.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="border-b border-border/50 hover:bg-surface-2/30 transition-colors"
                      >
                        <td className="p-3 font-medium">{t.name}</td>
                        <td className="p-3">
                          <Badge className={statusBadgeClass(t.status)}>
                            {t.status === "active"
                              ? "Активний"
                              : t.status === "pending"
                              ? "Очікує"
                              : t.status === "inactive"
                              ? "Неактивний"
                              : "—"}
                          </Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex flex-wrap gap-1">
                            {teacherCourses.length > 0 ? (
                              teacherCourses.map((course) => (
                                <Badge
                                  key={course.id}
                                  variant="outline"
                                  className="bg-blue-500/20 text-blue-300 border-blue-500/30"
                                >
                                  {course.title}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                Немає курсів
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => openEditDialog(t)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(t.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-muted">
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

      {/* Teacher Dialog */}
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
              {editingTeacher ? "Редагувати викладача" : "Новий викладач"}
            </h2>
            <p className="text-sm text-muted mb-6">
              {editingTeacher ? "Оновіть дані викладача" : "Додайте нового викладача"}
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">ПІБ</label>
                <Input
                  placeholder="Прізвище Ім'я По батькові"
                  value={teacherForm.name}
                  onChange={(e) =>
                    setTeacherForm({ ...teacherForm, name: e.target.value })
                  }
                  className="input"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Статус</label>
                <select
                  className="input w-full"
                  value={teacherForm.status}
                  onChange={(e) =>
                    setTeacherForm({
                      ...teacherForm,
                      status: e.target.value as TeacherStatus,
                    })
                  }
                >
                  <option value="active">Активний</option>
                  <option value="pending">Очікує</option>
                  <option value="inactive">Неактивний</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Курси викладача
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-md p-3">
                  {courses.map((course) => (
                    <label
                      key={course.id}
                      className="flex items-center gap-2 cursor-pointer hover:bg-surface-2/30 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={teacherForm.courseIds.includes(course.id)}
                        onChange={() => toggleCourse(course.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">
                        {course.title} {course.code ? `(${course.code})` : ""}
                      </span>
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
                disabled={isSaving}
              >
                Скасувати
              </Button>
              <Button
                onClick={editingTeacher ? handleUpdate : handleCreate}
                className="btn-primary flex-1"
                disabled={isSaving}
              >
                {editingTeacher ? "Зберегти" : "Створити"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTeachers;
