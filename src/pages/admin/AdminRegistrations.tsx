import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Check, X, Pencil } from "lucide-react";
import type { RegistrationRequest, RegistrationUpdateRequest } from "@/types/registrations";
import type { Group } from "@/types/students";
import {
  fetchAdminRegistrations,
  updateRegistration,
  approveRegistration,
  rejectRegistration,
} from "@/lib/api/admin-registrations";
import { fetchGroupsApi } from "@/lib/api/groups-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState<RegistrationRequest[]>([]);
  const [filteredRegistrations, setFilteredRegistrations] = useState<RegistrationRequest[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "student" | "teacher">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  // Модальні вікна
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<RegistrationRequest | null>(null);
  const [editFormData, setEditFormData] = useState<RegistrationUpdateRequest>({});

  // ==================== FETCH ====================
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      const [regs, grps] = await Promise.all([
        fetchAdminRegistrations(),
        fetchGroupsApi(),
      ]);
      console.log('✅ Завантажено груп:', grps.length, grps.slice(0, 3));
      setRegistrations(regs);
      setFilteredRegistrations(regs);
      setGroups(grps);
    } catch (error) {
      console.error("Помилка завантаження заявок:", error);
    } finally {
      setLoading(false);
    }
  }

  // ==================== FILTER ====================
  useEffect(() => {
    let filtered = registrations;

    // Фільтр за роллю
    if (roleFilter !== "all") {
      filtered = filtered.filter((r) => r.role === roleFilter);
    }

    // Фільтр за статусом
    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter);
    }

    // Пошук
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.fullName.toLowerCase().includes(query) ||
          r.email.toLowerCase().includes(query) ||
          (r.groupName && r.groupName.toLowerCase().includes(query)) ||
          (r.subjects && r.subjects.some((s: string) => s.toLowerCase().includes(query)))
      );
    }

    setFilteredRegistrations(filtered);
  }, [searchQuery, roleFilter, statusFilter, registrations]);

  // ==================== EDIT ====================
  function handleOpenEdit(registration: RegistrationRequest) {
    console.log('🔧 Відкриття діалогу редагування. Доступно груп:', groups.length);
    setEditingRegistration(registration);
    setEditFormData({
      fullName: registration.fullName,
      email: registration.email,
      groupId: registration.groupId,
      subjects: registration.subjects,
    });
    setIsEditOpen(true);
  }

  async function handleUpdateRegistration() {
    if (!editingRegistration) return;
    try {
      await updateRegistration(editingRegistration.id, editFormData);
      await loadData();
      setIsEditOpen(false);
    } catch (error) {
      console.error("Помилка оновлення заявки:", error);
      alert("Не вдалося оновити заявку");
    }
  }

  // ==================== APPROVE / REJECT ====================
  async function handleApprove(id: string) {
    try {
      const result = await approveRegistration(id);
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error("Помилка схвалення:", error);
      alert("Не вдалося схвалити заявку");
    }
  }

  async function handleReject(id: string) {
    try {
      const result = await rejectRegistration(id);
      alert(result.message);
      await loadData();
    } catch (error) {
      console.error("Помилка відхилення:", error);
      alert("Не вдалося відхилити заявку");
    }
  }

  // ==================== RENDER ====================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted">Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="glasscard p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Заявки на реєстрацію</h1>
            <p className="text-muted mt-1">
              Всього заявок: {filteredRegistrations.length}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <Input
                placeholder="Пошук за ПІБ, email, групою..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <select
              className="input w-full sm:w-[180px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as "all" | "student" | "teacher")}
            >
              <option value="all">Всі ролі</option>
              <option value="student">Студенти</option>
              <option value="teacher">Викладачі</option>
            </select>

            <select
              className="input w-full sm:w-[180px]"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "pending" | "approved" | "rejected")}
            >
              <option value="all">Всі статуси</option>
              <option value="pending">Очікує</option>
              <option value="approved">Схвалено</option>
              <option value="rejected">Відхилено</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="glasscard overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border/30">
                <tr>
                  <th className="text-left p-4 font-semibold">ПІБ</th>
                  <th className="text-left p-4 font-semibold">Email</th>
                  <th className="text-left p-4 font-semibold">Роль</th>
                  <th className="text-left p-4 font-semibold">Деталі</th>
                  <th className="text-left p-4 font-semibold">Статус</th>
                  <th className="text-right p-4 font-semibold">Дії</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((reg, idx) => (
                  <motion.tr
                    key={reg.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-border/20 hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="p-4 font-medium">{reg.fullName}</td>
                    <td className="p-4 text-muted">{reg.email}</td>
                    <td className="p-4">
                      <Badge
                        className={
                          reg.role === "student"
                            ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
                            : "bg-purple-500/20 text-purple-300 border-purple-500/30"
                        }
                      >
                        {reg.role === "student" ? "Студент" : "Викладач"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      {reg.role === "student" && reg.groupName && (
                        <span className="text-sm">{reg.groupName}</span>
                      )}
                      {reg.role === "teacher" && reg.subjects && (
                        <div className="flex flex-wrap gap-1">
                          {reg.subjects.map((subject: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs text-foreground">
                              {subject}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          reg.status === "pending"
                            ? "default"
                            : reg.status === "approved"
                            ? "default"
                            : "destructive"
                        }
                        className="text-foreground"
                      >
                        {reg.status === "pending" && "Очікує"}
                        {reg.status === "approved" && "Схвалено"}
                        {reg.status === "rejected" && "Відхилено"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        {reg.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenEdit(reg)}
                              title="Редагувати"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleApprove(reg.id)}
                              className="text-success hover:text-success"
                              title="Схвалити"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleReject(reg.id)}
                              className="text-danger hover:text-danger"
                              title="Відхилити"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 && (
            <div className="text-center py-12 text-muted">
              Заявки не знайдено
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редагувати заявку</DialogTitle>
            <DialogDescription>
              Змініть дані перед схваленням заявки
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="fullName">ПІБ</Label>
              <Input
                id="fullName"
                value={editFormData.fullName || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, fullName: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editFormData.email || ""}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, email: e.target.value })
                }
              />
            </div>

            {editingRegistration?.role === "student" && (
              <div>
                <Label htmlFor="groupId">Група</Label>
                <select
                  id="groupId"
                  className="input w-full"
                  value={editFormData.groupId || ""}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, groupId: e.target.value })
                  }
                >
                  <option value="">Оберіть групу</option>
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name} ({group.type}, {group.course} курс)
                    </option>
                  ))}
                </select>
              </div>
            )}

            {editingRegistration?.role === "teacher" && (
              <div>
                <Label htmlFor="subjects">Предмети (через кому)</Label>
                <Input
                  id="subjects"
                  placeholder="Алгоритми, Структури даних"
                  value={editFormData.subjects?.join(", ") || ""}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      subjects: e.target.value.split(",").map((s) => s.trim()),
                    })
                  }
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Скасувати
            </Button>
            <Button onClick={handleUpdateRegistration} className="btn-primary">
              Зберегти
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
