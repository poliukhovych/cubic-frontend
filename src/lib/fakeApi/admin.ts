// src/lib/fakeApi/admin.ts
import { ok, uid } from "./index";
import type { Teacher } from "@/types/teachers";
import type { TeacherSchedule } from "@/types/schedule";
import type { Student, Group, GroupCreateRequest, GroupUpdateRequest } from "@/types/students";
import type { Course } from "@/types/courses";
import type { FacultyLesson, Parity } from "@/types/schedule";
import type { ScheduleSnapshot } from "@/types/schedule";
import type { 
  RegistrationRequest, 
  RegistrationUpdateRequest, 
  RegistrationActionResponse 
} from "@/types/registrations";
import { SEED_BACHELOR, SEED_MASTER } from "@/lib/fakeApi/facultyScheduleSeed";

/* ------------------------------ TEACHERS --------------------------------- */
export async function fetchTeachers(): Promise<Teacher[]> {
  return ok([
    { id: "t1", name: "Проф. Іваненко", email: "ivan@uni.ua", subjects: ["БД"] },
    { id: "t2", name: "Доцент Петренко", email: "petro@uni.ua", subjects: ["ОПП", "ПП"] },
  ]);
}

export async function fetchAdminTeachers(): Promise<Teacher[]> {
  return fetchTeachers();
}

export async function createTeacher(data: Partial<Teacher>): Promise<Teacher> {
  return ok({
    id: uid(),
    name: data.name || "Новий викладач",
    subjects: data.subjects || [],
  });
}

export async function updateTeacher(id: string, data: Partial<Teacher>): Promise<Teacher> {
  return ok({
    id,
    name: data.name || "Оновлений викладач",
    subjects: data.subjects || [],
  });
}

export async function deleteTeacher(id: string): Promise<void> {
  // Fake API: не видаляємо реально, тільки логуємо
  await pushAdminChange({
    entity: "teacher",
    action: "deleted",
    title: `Видалено викладача (${id})`,
    actor: "Admin",
  });
  return ok(undefined);
}

export async function fetchTeacherDetailedSchedule(teacherId: string): Promise<TeacherSchedule> {
  return ok({
    teacherId,
    lessons: [
      { id: uid(), weekday: 1, time: { start: "10:00", end: "11:35" }, subject: "БД", location: "107", group: { id: "g1", name: "КН-41" } },
    ],
  });
}

/** Імітація "оновити загальний розклад" */
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
  ts: string;
  entity: "schedule" | "teacher" | "course" | "student";
  action: "created" | "updated" | "deleted";
  title: string;
  actor: string;
  trend?: number[];
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

/** Додати запис у локальний "архів" */
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

export function resetFacultySchedule() {
  try { localStorage.removeItem(LS_SCHEDULE_KEY); } catch {}
}

export function forceReseedFacultySchedule() {
  writeScheduleStore(seedBuckets());
}

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

export async function fetchFacultyGroups(level: Level): Promise<string[]> {
  const lessons = await fetchFacultySchedule(level);
  const set = new Set(lessons.map(l => (l.group ?? (l as any).speciality ?? "").toString()).filter(Boolean));
  return ok(Array.from(set));
}

export async function fetchFacultySpecialities(level: Level): Promise<string[]> {
  const lessons = await fetchFacultySchedule(level);
  const set = new Set((lessons as any[]).map(l => l.speciality ?? l.group ?? "").filter(Boolean));
  return ok(Array.from(set));
}

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

export async function getScheduleSnapshot(id: string): Promise<ScheduleSnapshot | null> {
  return readSnaps().find(s => s.id === id) ?? null;
}

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

/* ----------------------------- GROUPS (ОНОВЛЕНО) --------------------------- */
const LS_GROUPS_KEY = "cubic:groups";

let cachedGroups: Group[] | null = null;

function readGroups(): Group[] {
  if (cachedGroups) return cachedGroups;
  try {
    const raw = localStorage.getItem(LS_GROUPS_KEY);
    if (raw) {
      cachedGroups = JSON.parse(raw);
      return cachedGroups!;
    }
  } catch {}
  
  const seed: Group[] = [
    { id: "g1", name: "КН-41", type: "bachelor", course: 4, size: 28 },
    { id: "g2", name: "КН-42", type: "bachelor", course: 4, size: 27 },
    { id: "g3", name: "КН-43", type: "bachelor", course: 4, size: 26 },
  ];
  writeGroups(seed);
  return seed;
}

function writeGroups(groups: Group[]) {
  cachedGroups = groups;
  try { localStorage.setItem(LS_GROUPS_KEY, JSON.stringify(groups)); } catch {}
}

export async function fetchAdminGroups(): Promise<Group[]> {
  return ok([...readGroups()]);
}

export async function createGroup(data: GroupCreateRequest): Promise<Group> {
  const groups = readGroups();
  const newGroup: Group = {
    id: uid(),
    name: data.name,
    type: data.type,
    course: data.course,
    size: 0,
  };
  groups.push(newGroup);
  writeGroups(groups);
  
  await pushAdminChange({
    entity: "student",
    action: "created",
    title: `Створено групу ${data.name}`,
    actor: "Admin",
  });
  
  return ok(newGroup);
}

export async function updateGroup(id: string, data: GroupUpdateRequest): Promise<Group> {
  const groups = readGroups();
  const index = groups.findIndex(g => g.id === id);
  if (index === -1) throw new Error("Group not found");
  
  groups[index] = { ...groups[index], ...data };
  writeGroups(groups);
  
  await pushAdminChange({
    entity: "student",
    action: "updated",
    title: `Оновлено групу ${groups[index].name}`,
    actor: "Admin",
  });
  
  return ok(groups[index]);
}

export async function deleteGroup(id: string): Promise<void> {
  const students = await fetchAdminStudents();
  const hasStudents = students.some(s => s.groupId === id);
  
  if (hasStudents) {
    throw new Error("Неможливо видалити групу: є прив'язані студенти");
  }
  
  const groups = readGroups();
  const group = groups.find(g => g.id === id);
  writeGroups(groups.filter(g => g.id !== id));
  
  if (group) {
    await pushAdminChange({
      entity: "student",
      action: "deleted",
      title: `Видалено групу ${group.name}`,
      actor: "Admin",
    });
  }
  
  return ok(undefined);
}

/* ----------------------------- STUDENTS (ОНОВЛЕНО) --------------------------- */
const LS_STUDENTS_KEY = "cubic:students";

let cachedStudents: Student[] | null = null;

function readStudents(): Student[] {
  if (cachedStudents) return cachedStudents;
  try {
    const raw = localStorage.getItem(LS_STUDENTS_KEY);
    if (raw) {
      cachedStudents = JSON.parse(raw);
      return cachedStudents!;
    }
  } catch {}
  
  const seed: Student[] = [
    { id: uid(), name: "Андрій Сидоренко", email: "andriy@uni.ua", groupId: "g1", status: "active" },
    { id: uid(), name: "Марія Коваленко",  email: "maria@uni.ua",  groupId: "g1", subgroup: "a", status: "active" },
    { id: uid(), name: "Ірина Василенко",  email: "iryna@uni.ua",  groupId: "g2", status: "active" },
    { id: uid(), name: "Олег Ткаченко",    email: "oleh@uni.ua",   groupId: "g3", subgroup: "b", status: "active" },
  ];
  writeStudents(seed);
  return seed;
}

function writeStudents(students: Student[]) {
  cachedStudents = students;
  try { localStorage.setItem(LS_STUDENTS_KEY, JSON.stringify(students)); } catch {}
}

export async function fetchAdminStudents(): Promise<Student[]> {
  return ok([...readStudents()]);
}

export async function createStudent(data: Partial<Student>): Promise<Student> {
  const students = readStudents();
  const newStudent: Student = {
    id: uid(),
    name: data.name || "Новий студент",
    email: data.email || "student@example.com",
    groupId: data.groupId || "g1",
    status: data.status || "active",
  };
  students.push(newStudent);
  writeStudents(students);
  
  await pushAdminChange({
    entity: "student",
    action: "created",
    title: `Додано студента ${newStudent.name}`,
    actor: "Admin",
  });
  
  return ok(newStudent);
}

export async function updateStudent(id: string, data: Partial<Student>): Promise<Student> {
  const students = readStudents();
  const index = students.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Student not found");
  
  students[index] = { ...students[index], ...data };
  writeStudents(students);
  
  await pushAdminChange({
    entity: "student",
    action: "updated",
    title: `Оновлено студента ${students[index].name}`,
    actor: "Admin",
  });
  
  return ok(students[index]);
}

export async function deleteStudent(id: string): Promise<void> {
  const students = readStudents();
  const student = students.find(s => s.id === id);
  writeStudents(students.filter(s => s.id !== id));
  
  if (student) {
    await pushAdminChange({
      entity: "student",
      action: "deleted",
      title: `Видалено студента ${student.name}`,
      actor: "Admin",
    });
  }
  
  return ok(undefined);
}

/* ----------------------------- COURSES (ОНОВЛЕНО) --------------------------- */
const LS_COURSES_KEY = "cubic:courses";

let cachedCourses: Course[] | null = null;

function readCourses(): Course[] {
  if (cachedCourses) return cachedCourses;
  try {
    const raw = localStorage.getItem(LS_COURSES_KEY);
    if (raw) {
      cachedCourses = JSON.parse(raw);
      return cachedCourses!;
    }
  } catch {}
  
  const seed: Course[] = [
    { id: uid(), code: "DB101",  title: "Бази даних",                   groupIds: ["g1","g2"], teacherId: "t1" },
    { id: uid(), code: "CS201",  title: "Операційні системи",           groupIds: ["g2"],      teacherId: "t2" },
    { id: uid(), code: "PR301",  title: "Проєктний практикум",          groupIds: ["g1","g3"], teacherId: "t2" },
    { id: uid(), code: "ALG150", title: "Алгоритми та структури даних", groupIds: ["g3"],      teacherId: "t1" },
  ];
  writeCourses(seed);
  return seed;
}

function writeCourses(courses: Course[]) {
  cachedCourses = courses;
  try { localStorage.setItem(LS_COURSES_KEY, JSON.stringify(courses)); } catch {}
}

export async function fetchAdminCourses(): Promise<Course[]> {
  return ok([...readCourses()]);
}

export async function createCourse(data: Partial<Course>): Promise<Course> {
  const courses = readCourses();
  const newCourse: Course = {
    id: uid(),
    code: data.code || "NEW101",
    title: data.title || "Новий курс",
    groupIds: data.groupIds || [],
    teacherId: data.teacherId || null,
  };
  courses.push(newCourse);
  writeCourses(courses);
  
  await pushAdminChange({
    entity: "course",
    action: "created",
    title: `Створено курс ${newCourse.title}`,
    actor: "Admin",
  });
  
  return ok(newCourse);
}

export async function updateCourse(id: string, data: Partial<Course>): Promise<Course> {
  const courses = readCourses();
  const index = courses.findIndex(c => c.id === id);
  if (index === -1) throw new Error("Course not found");
  
  courses[index] = { ...courses[index], ...data };
  writeCourses(courses);
  
  await pushAdminChange({
    entity: "course",
    action: "updated",
    title: `Оновлено курс ${courses[index].title}`,
    actor: "Admin",
  });
  
  return ok(courses[index]);
}

export async function deleteCourse(id: string): Promise<void> {
  const courses = readCourses();
  const course = courses.find(c => c.id === id);
  writeCourses(courses.filter(c => c.id !== id));
  
  if (course) {
    await pushAdminChange({
      entity: "course",
      action: "deleted",
      title: `Видалено курс ${course.title}`,
      actor: "Admin",
    });
  }
  
  return ok(undefined);
}

/* ----------------------------- REGISTRATIONS (НОВИЙ) --------------------------- */
const LS_REGISTRATIONS_KEY = "cubic:registrations";

let cachedRegistrations: RegistrationRequest[] | null = null;

function readRegistrations(): RegistrationRequest[] {
  if (cachedRegistrations) return cachedRegistrations;
  try {
    const raw = localStorage.getItem(LS_REGISTRATIONS_KEY);
    if (raw) {
      cachedRegistrations = JSON.parse(raw);
      return cachedRegistrations!;
    }
  } catch {}
  
  const seed: RegistrationRequest[] = [
    {
      id: uid(),
      email: "new.student@example.com",
      fullName: "Андрій Новий",
      role: "student",
      status: "pending",
      submittedAt: new Date().toISOString(),
      groupId: "g1",
      groupName: "КН-41",
    },
    {
      id: uid(),
      email: "new.teacher@example.com",
      fullName: "Тетяна Викладач",
      role: "teacher",
      status: "pending",
      submittedAt: new Date().toISOString(),
      subjects: ["Алгоритми", "Структури даних"],
    },
  ];
  writeRegistrations(seed);
  return seed;
}

function writeRegistrations(regs: RegistrationRequest[]) {
  cachedRegistrations = regs;
  try { localStorage.setItem(LS_REGISTRATIONS_KEY, JSON.stringify(regs)); } catch {}
}

export async function fetchAdminRegistrations(): Promise<RegistrationRequest[]> {
  return ok([...readRegistrations()]);
}

export async function updateRegistration(
  id: string,
  data: RegistrationUpdateRequest
): Promise<RegistrationRequest> {
  const regs = readRegistrations();
  const index = regs.findIndex(r => r.id === id);
  if (index === -1) throw new Error("Registration not found");
  
  const groups = readGroups();
  regs[index] = {
    ...regs[index],
    ...data,
    ...(data.groupId && {
      groupName: groups.find(g => g.id === data.groupId)?.name || ''
    })
  };
  
  writeRegistrations(regs);
  return ok(regs[index]);
}

export async function approveRegistration(id: string): Promise<RegistrationActionResponse> {
  const regs = readRegistrations();
  const index = regs.findIndex(r => r.id === id);
  if (index === -1) throw new Error("Registration not found");
  
  const reg = regs[index];
  
  if (reg.role === "student") {
    await createStudent({
      name: reg.fullName,
      email: reg.email,
      groupId: reg.groupId!,
      status: "active",
    });
  } else if (reg.role === "teacher") {
    await createTeacher({
      name: reg.fullName,
      subjects: reg.subjects || [],
    });
  }
  
  regs[index].status = "approved";
  writeRegistrations(regs);
  
  return ok({
    success: true,
    message: `Заявку ${reg.fullName} схвалено`,
  });
}

export async function rejectRegistration(id: string): Promise<RegistrationActionResponse> {
  const regs = readRegistrations();
  const index = regs.findIndex(r => r.id === id);
  if (index === -1) throw new Error("Registration not found");
  
  const reg = regs[index];
  regs[index].status = "rejected";
  writeRegistrations(regs);
  
  return ok({
    success: true,
    message: `Заявку ${reg.fullName} відхилено`,
  });
}
