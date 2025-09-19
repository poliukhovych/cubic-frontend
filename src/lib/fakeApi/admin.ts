// src/lib/fakeApi/admin.ts
import { ok, uid } from "./index";
import type { Teacher } from "@/types/teachers";
import type { TeacherSchedule } from "@/types/schedule";
import type { Student, Group } from "@/types/students";
import type { Course } from "@/types/courses";
import type { FacultyLesson, Parity } from "@/types/schedule";
import type { ScheduleSnapshot } from "@/types/schedule";
import { SEED_BACHELOR, SEED_MASTER } from "@/lib/fakeApi/facultyScheduleSeed";

/* ------------------------------ TEACHERS --------------------------------- */
export async function fetchTeachers(): Promise<Teacher[]> {
  return ok([
    { id: "t1", name: "Проф. Іваненко", email: "ivan@uni.ua", subjects: ["БД"] },
    { id: "t2", name: "Доцент Петренко", email: "petro@uni.ua", subjects: ["ОПП", "ПП"] },
  ]);
}

export async function fetchTeacherDetailedSchedule(teacherId: string): Promise<TeacherSchedule> {
  return ok({
    teacherId,
    lessons: [
      { id: uid(), weekday: 1, time: { start: "10:00", end: "11:35" }, subject: "БД", location: "107", group: { id: "g1", name: "КН-41" } },
    ],
  });
}

/** Імітація “оновити загальний розклад” */
export async function updateGlobalSchedule(_: unknown): Promise<{ ok: true }> {
  return ok({ ok: true });
}

export async function fetchAdminStats(): Promise<{ students: number; teachers: number; courses: number; }> {
  return ok({ students: 55, teachers: 69, courses: 14 });
}

/* -------------------------------- LOGS ----------------------------------- */
export type AdminLog = { id: string; ts: string; level: "info" | "warn" | "error"; message: string };

export async function fetchAdminLogs(): Promise<AdminLog[]> {
  return ok([
    { id: uid(), ts: new Date().toISOString(), level: "info",  message: "System warmed up" },
    { id: uid(), ts: new Date().toISOString(), level: "warn",  message: "Cache miss for /courses" },
    { id: uid(), ts: new Date().toISOString(), level: "error", message: "Teacher sync failed: timeout" },
  ]);
}

/* ---------------------------- CHANGE HISTORY ----------------------------- */
export type ChangeItem = {
  id: string;
  ts: string;                              // ISO
  entity: "schedule" | "teacher" | "course" | "student";
  action: "created" | "updated" | "deleted";
  title: string;                           // короткий опис
  actor: string;                           // хто змінив
  trend?: number[];                        // для спарклайну (опц.)
};

const LS_CHANGES_KEY = "fh.admin.changes";

function readChangeStore(): ChangeItem[] {
  try {
    const raw = localStorage.getItem(LS_CHANGES_KEY);
    return raw ? (JSON.parse(raw) as ChangeItem[]) : [];
  } catch { return []; }
}

function writeChangeStore(list: ChangeItem[]) {
  try { localStorage.setItem(LS_CHANGES_KEY, JSON.stringify(list)); } catch {}
}

/** Додати запис у локальний “архів” */
export async function pushAdminChange(
  partial: Omit<ChangeItem, "id"|"ts"> & { ts?: string }
): Promise<void> {
  const list = readChangeStore();
  list.unshift({
    id: uid(),
    ts: partial.ts ?? new Date().toISOString(),
    entity: partial.entity,
    action: partial.action,
    title: partial.title,
    actor: partial.actor,
    trend: partial.trend,
  });
  writeChangeStore(list.slice(0, 200));
}

/** Отримати історію (сіди + те, що накопичили в LS) */
export async function fetchChangeHistory(limit = 6): Promise<ChangeItem[]> {
  const now = Date.now();
  const seeds: ChangeItem[] = [
    { id: uid(), ts: new Date(now - 3_600_000).toISOString(),  entity: "schedule", action: "updated", title: "Правка розкладу КН-41", actor: "Admin", trend: [3,6,4,8,7,9] },
    { id: uid(), ts: new Date(now - 7_200_000).toISOString(),  entity: "teacher",  action: "updated", title: "Оновлено e-mail викладача", actor: "Admin", trend: [2,2,3,3,4,5] },
    { id: uid(), ts: new Date(now - 12_000_000).toISOString(), entity: "student",  action: "created", title: "Додано студента",           actor: "Admin", trend: [1,2,2,3,4,4] },
    { id: uid(), ts: new Date(now - 25_000_000).toISOString(), entity: "course",   action: "deleted", title: "Видалено дубль курсу",     actor: "Admin", trend: [9,7,5,6,4,3] },
    { id: uid(), ts: new Date(now - 36_000_000).toISOString(), entity: "schedule", action: "updated", title: "Перенесено пару",          actor: "Admin", trend: [5,6,5,7,6,7] },
    { id: uid(), ts: new Date(now - 48_000_000).toISOString(), entity: "teacher",  action: "created", title: "Додано викладача",         actor: "Admin", trend: [0,1,2,4,6,8] },
  ];
  const ls = readChangeStore();
  return ok([...ls, ...seeds].slice(0, limit));
}

/* ------------------------- FACULTY SCHEDULE (NEW) ------------------------ */
/** Версію сховища тримаємо окремо — щоб легко пересідувати */
const LS_SCHEDULE_KEY = "fh.faculty.schedule.v2";

type Level = "bachelor" | "master";

type ScheduleBucket = {
  level: Level;
  lessons: FacultyLesson[];
};

function assignUid(l: FacultyLesson): FacultyLesson {
  return (!l.id || l.id.startsWith("seed-")) ? { ...l, id: uid() } : l;
}

function normalizeGroup(l: FacultyLesson): FacultyLesson {
  // якщо в сіді ще старе поле speciality — підставляємо його як group
  if (!l.group && (l as any).speciality) {
    return { ...l, group: (l as any).speciality as string };
  }
  return l;
}

function seedBuckets(): ScheduleBucket[] {
  return [
    { level: "bachelor", lessons: SEED_BACHELOR.map(normalizeGroup).map(assignUid) },
    { level: "master",   lessons: SEED_MASTER  .map(normalizeGroup).map(assignUid) },
  ];
}

function readScheduleStore(): ScheduleBucket[] {
  try {
    const raw = localStorage.getItem(LS_SCHEDULE_KEY);
    if (raw) return JSON.parse(raw) as ScheduleBucket[];
  } catch {}
  const seed = seedBuckets();
  writeScheduleStore(seed);
  return seed;
}

function writeScheduleStore(data: ScheduleBucket[]) {
  try { localStorage.setItem(LS_SCHEDULE_KEY, JSON.stringify(data)); } catch {}
}

/** Публічні утиліти */
export function resetFacultySchedule() {
  try { localStorage.removeItem(LS_SCHEDULE_KEY); } catch {}
}
export function forceReseedFacultySchedule() {
  writeScheduleStore(seedBuckets());
}

/** CRUD */
export async function fetchFacultySchedule(level: Level): Promise<FacultyLesson[]> {
  const store = readScheduleStore();
  const bucket = store.find(b => b.level === level);
  return ok(bucket ? bucket.lessons : []);
}

export async function saveFacultySchedule(level: Level, lessons: FacultyLesson[]): Promise<{ ok: true }> {
  const store = readScheduleStore();
  const idx = store.findIndex(b => b.level === level);
  const next = { level, lessons: lessons.map(normalizeGroup).map(assignUid) };
  if (idx >= 0) store[idx] = next; else store.push(next);
  writeScheduleStore(store);

  await pushAdminChange({
    entity: "schedule",
    action: "updated",
    title: `Оновлено розклад (${level})`,
    actor: "Admin",
  });

  return ok({ ok: true });
}

/** Список унікальних ГРУП (колонки в таблиці) */
export async function fetchFacultyGroups(level: Level): Promise<string[]> {
  const lessons = await fetchFacultySchedule(level);
  const set = new Set(lessons.map(l => (l.group ?? (l as any).speciality ?? "").toString()).filter(Boolean));
  return ok(Array.from(set));
}

/** (Залишили для сумісності; можна не використовувати в UI) */
export async function fetchFacultySpecialities(level: Level): Promise<string[]> {
  const lessons = await fetchFacultySchedule(level);
  const set = new Set((lessons as any[]).map(l => l.speciality ?? l.group ?? "").filter(Boolean));
  return ok(Array.from(set));
}

/** Фільтрація за курсом/парністю */
export function filterFacultyLessons(opts: {
  lessons: FacultyLesson[];
  course?: number;
  parity?: Parity;
}) {
  const { lessons, course, parity } = opts;
  return lessons.filter(l =>
    (course ? l.course === course : true) &&
    (parity && parity !== "any" ? (l.parity === "any" || l.parity === parity) : true)
  );
}
/* ------------------------------ ARCHIVE SNAPSHOTS ------------------------------ */


const SNAP_KEY = "cubic:scheduleSnapshots";

function readSnaps(): ScheduleSnapshot[] {
  try {
    const raw = localStorage.getItem(SNAP_KEY);
    return raw ? (JSON.parse(raw) as ScheduleSnapshot[]) : [];
  } catch { return []; }
}
function writeSnaps(next: ScheduleSnapshot[]) {
  try { localStorage.setItem(SNAP_KEY, JSON.stringify(next)); } catch {}
}

// Список (для таблиці архіву)
export async function listScheduleSnapshots(): Promise<
  Array<Pick<ScheduleSnapshot, "id" | "title" | "createdAt" | "parity" | "createdBy" | "comment">>
> {
  return readSnaps()
    .map(s => ({
      id: s.id,
      title: s.title,
      createdAt: s.createdAt,
      parity: s.parity,
      createdBy: s.createdBy,
      comment: s.comment,
    }))
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

// Повний знімок
export async function getScheduleSnapshot(id: string): Promise<ScheduleSnapshot | null> {
  return readSnaps().find(s => s.id === id) ?? null;
}

// Створення знімка
export async function createScheduleSnapshot(
  title: string,
  comment: string,
  parity: "odd" | "even" | "both",
  createdBy: string,
  lessons: FacultyLesson[]
): Promise<ScheduleSnapshot> {
  const snap: ScheduleSnapshot = {
    id: (crypto as any).randomUUID?.() ?? Math.random().toString(36).slice(2),
    title,
    comment,
    parity,
    createdAt: new Date().toISOString(),
    createdBy,
    lessons,
  };
  const next = [snap, ...readSnaps()];
  writeSnaps(next);
  return snap;
}

export async function deleteScheduleSnapshot(id: string): Promise<void> {
  writeSnaps(readSnaps().filter(s => s.id !== id));
}

/* ----------------------------- GROUPS/STUDENTS/COURSES --------------------------- */
// Групи
export async function fetchAdminGroups(): Promise<Group[]> {
  return ok([
    { id: "g1", name: "КН-41", size: 28 },
    { id: "g2", name: "КН-42", size: 27 },
    { id: "g3", name: "КН-43", size: 26 },
  ]);
}

// Студенти
export async function fetchAdminStudents(): Promise<Student[]> {
  return ok([
    { id: uid(), name: "Андрій Сидоренко", email: "andriy@uni.ua", groupId: "g1" },
    { id: uid(), name: "Марія Коваленко",  email: "maria@uni.ua",  groupId: "g1", subgroup: "a" },
    { id: uid(), name: "Ірина Василенко",  email: "iryna@uni.ua",  groupId: "g2" },
    { id: uid(), name: "Олег Ткаченко",    email: "oleh@uni.ua",   groupId: "g3", subgroup: "b" },
  ]);
}

// Курси
export async function fetchAdminCourses(): Promise<Course[]> {
  return ok([
    { id: uid(), code: "DB101",  title: "Бази даних",                   groupIds: ["g1","g2"], teacherId: "t1" },
    { id: uid(), code: "CS201",  title: "Операційні системи",           groupIds: ["g2"],      teacherId: "t2" },
    { id: uid(), code: "PR301",  title: "Проєктний практикум",          groupIds: ["g1","g3"], teacherId: "t2" },
    { id: uid(), code: "ALG150", title: "Алгоритми та структури даних", groupIds: ["g3"],      teacherId: "t1" },
  ]);
}