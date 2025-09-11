// src/lib/fakeApi/teacher.ts
import { ok, uid } from "./index";
import type { TeacherSchedule } from "@/types/schedule";
import type { Student } from "@/types/students";
import type { HomeworkTask } from "@/types/homework";

// Стандартні часові слоти пар (узгоджено зі студентським фейком)
const PAIRS = {
  1: { start: "08:30", end: "10:05" },
  2: { start: "10:25", end: "12:00" },
  3: { start: "12:10", end: "13:45" },
  4: { start: "14:00", end: "15:35" },
  5: { start: "15:45", end: "17:20" },
} as const;

type PairNo = keyof typeof PAIRS;
type Weekday = 1|2|3|4|5|6|7; // 1=Пн

// Хелпер для створення заняття
const L = (
  weekday: Weekday,
  pair: PairNo,
  subject: string,
  group: { id: string; name: string; subgroup?: "a" | "b" | null },
  location: string,
  parity: "any" | "even" | "odd" = "any",
) => ({
  id: uid(),
  weekday,
  time: PAIRS[pair],
  subject,
  location,
  group,
  parity,
});

export async function fetchTeacherSchedule(teacherId: string): Promise<TeacherSchedule> {
  // ГРУПИ
  // 1 курс
  const G11a = { id: "g11", name: "КН-11", subgroup: "a" as const };
  const G11b = { id: "g11", name: "КН-11", subgroup: "b" as const };
  const G12a = { id: "g12", name: "КН-12", subgroup: "a" as const };
  const G12b = { id: "g12", name: "КН-12", subgroup: "b" as const };

  // 2 курс
  const G21a = { id: "g21", name: "КН-21", subgroup: "a" as const };
  const G21b = { id: "g21", name: "КН-21", subgroup: "b" as const };
  const G22a = { id: "g22", name: "КН-22", subgroup: "a" as const };
  const G22b = { id: "g22", name: "КН-22", subgroup: "b" as const };
  const G23a = { id: "g23", name: "КН-23", subgroup: "a" as const };
  const G23b = { id: "g23", name: "КН-23", subgroup: "b" as const };

  // 4 курс (без підгруп)
  const G41  = { id: "g41", name: "КН-41", subgroup: null };
  const G42  = { id: "g42", name: "КН-42", subgroup: null };

  // РОЗКЛАД
  const lessons = [
    // ===== 1 курс: МЕДІАКОНТРОЛЬ (в підгрупах) =====
    // Пн: КН-11 (а/б) — рознесено по парності, щоб перевірити перемикач тижнів
    L(1, 2, "Медіаконтроль (лаб.)", G11a, "лаб. 1-02", "odd"),
    L(1, 2, "Медіаконтроль (лаб.)", G11b, "лаб. 1-03", "even"),

    // Вт: КН-12 (а/б) — одночасні підгрупи
    L(2, 3, "Медіаконтроль (лаб.)", G12a, "лаб. 1-05", "any"),
    L(2, 3, "Медіаконтроль (лаб.)", G12b, "лаб. 1-06", "any"),

    // Чт: КН-11 (зміна підгруп по парності)
    L(4, 1, "Медіаконтроль (семінар)", G11a, "ауд. 207", "even"),
    L(4, 1, "Медіаконтроль (семінар)", G11b, "ауд. 208", "odd"),

    // ===== 2 курс: ООП (поділено на 2 підгрупи в 3 групах) =====
    // Ср: КН-21
    L(3, 2, "ООП (лекція)",         { id: "g21", name: "КН-21", subgroup: null }, "ауд. 502", "any"),
    L(3, 3, "ООП (практика)",       G21a, "лаб. 2-10", "any"),
    L(3, 3, "ООП (практика)",       G21b, "лаб. 2-11", "any"),

    // Пт: КН-22 — підгрупи з парністю
    L(5, 1, "ООП (лекція)",         { id: "g22", name: "КН-22", subgroup: null }, "ауд. 401", "any"),
    L(5, 2, "ООП (практика)",       G22a, "лаб. 2-07", "odd"),
    L(5, 2, "ООП (практика)",       G22b, "лаб. 2-08", "even"),

    // Сб: КН-23 — пізні пари
    L(6, 3, "ООП (лекція)",         { id: "g23", name: "КН-23", subgroup: null }, "ауд. 305", "any"),
    L(6, 4, "ООП (практика)",       G23a, "лаб. 2-03", "any"),
    L(6, 4, "ООП (практика)",       G23b, "лаб. 2-04", "any"),

    // ===== 4 курс: Розробка баз даних (2 групи) =====
    // Вт: вечірні лекції
    L(2, 5, "Розробка баз даних (лекція)", G41, "ауд. 114", "any"),
    // Чт: практикум для обох груп — чергується по парності
    L(4, 4, "Розробка баз даних (практикум)", G41, "лаб. 3-12", "odd"),
    L(4, 4, "Розробка баз даних (практикум)", G42, "лаб. 3-12", "even"),
    // Нд: разові консультації — щоб показати різні дні
    L(7, 2, "Розробка БД (консультація)",    G42, "ауд. 214", "any"),
  ];

  // За бажанням можна додати totalWeeks:
  // return ok({ teacherId, lessons, totalWeeks: 16 } as any);
  return ok({ teacherId, lessons });
}

export async function fetchMyStudents(teacherId: string): Promise<Student[]> {
  // Набросали побільше студентів по групах/підгрупах
  const S = (name: string, email: string, groupId: string, subgroup?: "a"|"b") =>
    ({ id: uid(), name, email, groupId, subgroup });

  return ok([
    // КН-11
    S("Анна І.",  "anna.i@uni.ua",  "g11", "a"),
    S("Богдан О.", "bohdan.o@uni.ua","g11", "a"),
    S("Віктор П.", "viktor.p@uni.ua","g11", "b"),
    S("Галина Д.", "halyna.d@uni.ua","g11", "b"),
    // КН-12
    S("Дмитро Л.","dmytro.l@uni.ua","g12", "a"),
    S("Єва С.",   "yeva.s@uni.ua", "g12", "a"),
    S("Жанна М.", "zhanna.m@uni.ua","g12", "b"),
    S("Зорян К.", "zoryan.k@uni.ua","g12", "b"),

    // КН-21
    S("Іван Т.",  "ivan.t@uni.ua", "g21", "a"),
    S("Катря Р.", "katrya.r@uni.ua","g21", "b"),
    // КН-22
    S("Леся Н.",  "lesya.n@uni.ua", "g22", "a"),
    S("Мирон Ф.", "myron.f@uni.ua", "g22", "b"),
    // КН-23
    S("Надія Ч.", "nadiya.ch@uni.ua","g23", "a"),
    S("Олег Ш.",  "oleh.sh@uni.ua", "g23", "b"),

    // КН-41
    S("Павло Ю.", "pavlo.y@uni.ua", "g41"),
    S("Роксолана В.","roksolana.v@uni.ua","g41"),
    // КН-42
    S("Софія Г.", "sofia.h@uni.ua", "g42"),
    S("Тарас Ж.", "taras.zh@uni.ua","g42"),
  ]);
}

export async function createAssignment(task: Omit<HomeworkTask, "id" | "createdAt">): Promise<HomeworkTask> {
  return ok({ ...task, id: uid(), createdAt: new Date().toISOString() });
}
