//src/lib/fakeApi/student.ts
import { ok, uid } from "./index";
import type { StudentSchedule } from "@/types/schedule";
import type { HomeworkTask } from "@/types/homework";

export async function fetchStudentSchedule(studentId: string): Promise<StudentSchedule> {
  const group = { id: "g1", name: "КН-41", subgroup: "a" as const };

  // типові "пари" університету
  const PAIRS = {
    1: { start: "08:30", end: "10:05" },
    2: { start: "10:25", end: "12:00" },
    3: { start: "12:10", end: "13:45" },
    4: { start: "14:00", end: "15:35" },
    5: { start: "15:45", end: "17:20" },
  } as const;

  const L = (weekday: 1|2|3|4|5|6, pair: 1|2|3|4|5, subject: string, location: string, parity: "any"|"even"|"odd" = "any") => ({
    id: uid(),
    weekday,
    time: PAIRS[pair],
    subject,
    location,
    group,
    parity,
  });

  return ok({
    studentId,
    group,
    lessons: [
      // ПОНЕДІЛОК (1): 1–3 без вікон + 5 (довгий день)
      L(1, 1, "Математика",            "ауд. 204", "any"),
      L(1, 2, "ОПП",                   "ауд. 312", "even"),
      L(1, 3, "Алгоритми і структури даних", "ауд. 221", "odd"),
      L(1, 5, "Англійська мова",       "ауд. 507", "any"),

      // ВІВТОРОК (2): початок з 2-ї (вікно на старті), потім 4-та
      L(2, 2, "Бази даних",            "ауд. 107", "any"),
      L(2, 3, "Комп'ютерні мережі",    "ауд. 405", "even"),
      L(2, 4, "Фізика",                "ауд. 118", "odd"),

      // СЕРЕДА (3): 1-ша, потім вікно, потім 3-я і 4-та
      L(3, 1, "Теорія ймовірностей",   "ауд. 210", "any"),
      // (вікно між 1 та 3)
      L(3, 3, "Комп'ютерна графіка",   "ауд. 316", "odd"),
      L(3, 4, "Операційні системи",    "ауд. 122", "even"),

      // ЧЕТВЕР (4): 2–4 підряд (без 1-ї)
      L(4, 2, "Математика",            "ауд. 204", "any"),
      L(4, 3, "Веб-технології",        "ауд. 229", "even"),
      L(4, 4, "ОПП (практика)",        "лаб. 3-12", "odd"),

      // П’ЯТНИЦЯ (5): 1-ша, 2-га, вікно, 5-та
      L(5, 1, "Бази даних (лаб.)",     "лаб. 2-07", "even"),
      L(5, 2, "Алгоритми (практика)",  "ауд. 221", "any"),
      // (вікно між 2 та 5)
      L(5, 5, "Філософія",              "ауд. 314", "odd"),

      // СУБОТА (6): короткий день з вікном: 2-га і 4-та
      L(6, 2, "Англійська мова (розмовна)", "ауд. 509", "any"),
      L(6, 4, "Проєктний практикум",        "ауд. 101", "any"),
    ],
  });
}


export async function fetchStudentHomework(studentId: string): Promise<HomeworkTask[]> {
  console.log("Fetching homework for student", studentId);
  return ok([
    { id: uid(), subject: "БД", text: "Нормалізувати схему до 3НФ", createdAt: new Date().toISOString(), dueDate: "2025-09-15", groupId: "g1", teacherId: "t1",
      files: [{ id: uid(), url: "https://drive.google.com/file/d/xyz/view", title: "Приклад" }] },
    { id: uid(), subject: "ОПП", text: "Реалізувати патерн Observer", createdAt: new Date().toISOString(), dueDate: "2025-09-18", groupId: "g1", teacherId: "t2" }
  ]);
}
