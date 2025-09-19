// src/lib/fakeApi/student.ts
import { ok, uid } from "./index";
import type { StudentSchedule, Lesson } from "@/types/schedule";
import type { HomeworkTask, StudentHomeworkResponse } from "@/types/homework";
import type {
  GradeItem,
  StudentGradesResponse,
  SubjectGrades,
} from "@/types/grades";
import { slugify } from "../slug";
import type { SubjectDetails, SubjectMaterial } from "@/types/subject";

/* ──────────────────────────────────────────────────────────────────────────────
   Канонічні назви предметів (мають відповідати тому, що бачить студент в UI)
   ────────────────────────────────────────────────────────────────────────────── */
const SUBJECTS = [
  "Математика",
  "ОПП",
  "Алгоритми і структури даних",
  "Англійська мова",
  "Бази даних",
  "Комп'ютерні мережі",
  "Фізика",
  "Теорія ймовірностей",
  "Операційні системи",
  "Комп'ютерна графіка",
  "Філософія",
  "Веб-технології",
  "Проєктний практикум",
  "Англійська мова (розмовна)",
  "ОПП (практика)",
  "Бази даних (лаб.)",
] as const;

type Canon = (typeof SUBJECTS)[number];
type CanonSlug = string;

/* ──────────────────────────────────────────────────────────────────────────────
   Аліаси (щоб “БД” з ДЗ/оцінок прирівнювалось до “Бази даних” і т. ін.)
   ────────────────────────────────────────────────────────────────────────────── */
const SUBJECT_ALIASES: Record<CanonSlug, string[]> = {
  [slugify("Бази даних")]: [slugify("БД"), slugify("Бази даних (лаб.)")],
  [slugify("ОПП")]: [
    slugify("ОПП (практика)"),
    slugify("Об'єктно-орієнтоване програмування"),
  ],
  [slugify("Англійська мова")]: [slugify("Англійська мова (розмовна)")],

  // інші без аліасів
  [slugify("Математика")]: [],
  [slugify("Алгоритми і структури даних")]: [],
  [slugify("Комп'ютерні мережі")]: [],
  [slugify("Фізика")]: [],
  [slugify("Теорія ймовірностей")]: [],
  [slugify("Операційні системи")]: [],
  [slugify("Комп'ютерна графіка")]: [],
  [slugify("Філософія")]: [],
  [slugify("Веб-технології")]: [],
  [slugify("Проєктний практикум")]: [],
  [slugify("ОПП (практика)")]: [], // не канон, лишається порожнім
  [slugify("Бази даних (лаб.)")]: [], // не канон, лишається порожнім
  [slugify("Англійська мова (розмовна)")]: [],
};

/* ──────────────────────────────────────────────────────────────────────────────
   Метадані предметів (викладачі)
   ────────────────────────────────────────────────────────────────────────────── */
const SUBJECT_META: Record<
  CanonSlug,
  { name: Canon; teacher: { id: string; name: string; email?: string } }
> = {
  [slugify("Математика")]: {
    name: "Математика",
    teacher: {
      id: "t_math",
      name: "проф. Ірина Коваль",
      email: "i.koval@univ.edu",
    },
  },
  [slugify("ОПП")]: {
    name: "ОПП",
    teacher: { id: "t_oop", name: "доц. Андрій Петренко" },
  },
  [slugify("Алгоритми і структури даних")]: {
    name: "Алгоритми і структури даних",
    teacher: { id: "t_algo", name: "д-р Сергій Литвин" },
  },
  [slugify("Англійська мова")]: {
    name: "Англійська мова",
    teacher: { id: "t_eng", name: "Ольга Руденко" },
  },
  [slugify("Бази даних")]: {
    name: "Бази даних",
    teacher: { id: "t_db", name: "ас. Марія Гнатюк" },
  },
  [slugify("Комп'ютерні мережі")]: {
    name: "Комп'ютерні мережі",
    teacher: { id: "t_net", name: "доц. Дмитро Сай" },
  },
  [slugify("Фізика")]: {
    name: "Фізика",
    teacher: { id: "t_phy", name: "проф. Олег Вербицький" },
  },
  [slugify("Теорія ймовірностей")]: {
    name: "Теорія ймовірностей",
    teacher: { id: "t_prob", name: "доц. Наталія Таран" },
  },
  [slugify("Операційні системи")]: {
    name: "Операційні системи",
    teacher: { id: "t_os", name: "ас. Володимир Дяченко" },
  },
  [slugify("Комп'ютерна графіка")]: {
    name: "Комп'ютерна графіка",
    teacher: { id: "t_cg", name: "ас. Аліса Кравець" },
  },
  [slugify("Філософія")]: {
    name: "Філософія",
    teacher: { id: "t_phil", name: "проф. Лариса Бойко" },
  },
  [slugify("Веб-технології")]: {
    name: "Веб-технології",
    teacher: { id: "t_web", name: "доц. Павло Козак" },
  },
  [slugify("Проєктний практикум")]: {
    name: "Проєктний практикум",
    teacher: { id: "t_proj", name: "ментор Ірина Бондар" },
  },
  [slugify("Англійська мова (розмовна)")]: {
    name: "Англійська мова (розмовна)",
    teacher: { id: "t_eng2", name: "Ольга Руденко" },
  },
  [slugify("ОПП (практика)")]: {
    name: "ОПП (практика)",
    teacher: { id: "t_oop_lab", name: "доц. Андрій Петренко" },
  },
  [slugify("Бази даних (лаб.)")]: {
    name: "Бази даних (лаб.)",
    teacher: { id: "t_db_lab", name: "ас. Марія Гнатюк" },
  },
};

/* ──────────────────────────────────────────────────────────────────────────────
   РОЗКЛАД
   ────────────────────────────────────────────────────────────────────────────── */
export async function fetchStudentSchedule(
  studentId: string
): Promise<StudentSchedule> {
  const group = { id: "g1", name: "КН-41", subgroup: "a" as const };

  const PAIRS = {
    1: { start: "08:30", end: "10:05" },
    2: { start: "10:25", end: "12:00" },
    3: { start: "12:10", end: "13:45" },
    4: { start: "14:00", end: "15:35" },
    5: { start: "15:45", end: "17:20" },
  } as const;

  const L = (
    weekday: 1 | 2 | 3 | 4 | 5 | 6,
    pair: 1 | 2 | 3 | 4 | 5,
    subject: Canon,
    location: string,
    parity: "any" | "even" | "odd" = "any",
    meetingUrl?: string
  ): Lesson => ({
    id: uid(),
    weekday,
    time: PAIRS[pair],
    subject,
    location,
    group,
    parity,
    meetingUrl,
  });

  const meet = (code: string) => `https://meet.google.com/${code}`;
  const zoom = (id: string) => `https://zoom.us/j/${id}`;

  return ok({
    studentId,
    group,
    lessons: [
      L(1, 1, "Математика", "ауд. 204", "any", meet("abc-defg-hij")),
      L(1, 2, "ОПП", "ауд. 312", "even", zoom("9991112223")),
      L(
        1,
        3,
        "Алгоритми і структури даних",
        "ауд. 221",
        "odd",
        meet("kln-opqr-stu")
      ),
      L(1, 5, "Англійська мова", "ауд. 507", "any", meet("eng-aaaa-bbb")),

      L(2, 2, "Бази даних", "ауд. 107", "any", meet("db1-xyza-zzz")),
      L(2, 3, "Комп'ютерні мережі", "ауд. 405", "even", zoom("7775552222")),
      L(2, 4, "Фізика", "ауд. 118", "odd", meet("phy-0000-111")),

      L(3, 1, "Теорія ймовірностей", "ауд. 210", "any", meet("prob-222-333")),
      L(3, 3, "Комп'ютерна графіка", "ауд. 316", "odd", meet("cgf-444-555")),
      L(3, 3, "Операційні системи", "ауд. 122", "even", zoom("1231231234")),

      L(4, 2, "Математика", "ауд. 204", "any", meet("math-666-777")),
      L(4, 3, "Веб-технології", "ауд. 229", "even", meet("web-888-999")),
      L(4, 4, "ОПП (практика)", "лаб. 3-12", "odd", zoom("8880001111")),

      L(5, 1, "Бази даних (лаб.)", "лаб. 2-07", "even", meet("dbl-222-111")),
      L(
        5,
        2,
        "Алгоритми і структури даних",
        "ауд. 221",
        "any",
        meet("alg-333-222")
      ),
      L(5, 5, "Філософія", "ауд. 314", "odd", zoom("5554443333")),

      L(
        6,
        2,
        "Англійська мова (розмовна)",
        "ауд. 509",
        "any",
        zoom("1112223334")
      ),
      L(6, 4, "Проєктний практикум", "ауд. 101", "any", meet("proj-555-666")),
    ],
  });
}

/* ──────────────────────────────────────────────────────────────────────────────
   ДОМАШНІ ЗАВДАННЯ (повний семестр, частина вже минула)
   ────────────────────────────────────────────────────────────────────────────── */
export async function fetchStudentHomework(
  studentId: string
): Promise<StudentHomeworkResponse> {
  console.log(studentId);
  const today = new Date();
  const mkDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  // утиліта
  const T = (
    subject: string,
    text: string,
    dueOffsetDays: number,
    teacherId: string,
    classroomUrl?: string,
    done: boolean = false
  ): HomeworkTask => ({
    id: uid(),
    subject,
    text,
    createdAt: new Date().toISOString(),
    dueDate: mkDate(dueOffsetDays),
    groupId: "g1",
    teacherId,
    classroomUrl,
    done,
  });

  // зробимо 3 завдання на предмет: минуле / близьке / майбутнє
  const mkSubjectHW = (
    canonId: string,
    displayName: string,
    teacherId: string
  ) => [
    T(
      displayName,
      `${displayName}: Домашка №1`,
      -18,
      teacherId,
      `https://classroom.google.com/c/${canonId}/a/HW1`,
      true
    ),
    T(
      displayName,
      `${displayName}: Домашка №2`,
      -4,
      teacherId,
      `https://classroom.google.com/c/${canonId}/a/HW2`,
      false
    ),
    T(
      displayName,
      `${displayName}: Домашка №3`,
      9,
      teacherId,
      `https://classroom.google.com/c/${canonId}/a/HW3`,
      false
    ),
  ];

  // згенеруємо для всіх предметів з SUBJECT_META
  const tasks: HomeworkTask[] = Object.entries(SUBJECT_META).flatMap(
    ([canonId, meta]) => {
      const hw = mkSubjectHW(canonId, meta.name, meta.teacher.id);
      return hw;
    }
  );

  // бонус: одна додаткова “аліасна” ДЗ для БД як "БД"
  const bdId = Object.keys(SUBJECT_META).find(
    (k) => SUBJECT_META[k].name === "Бази даних"
  );
  if (bdId) {
    tasks.push(
      T(
        "БД",
        "БД: Додаткове завдання (аліас-перевірка)",
        3,
        SUBJECT_META[bdId].teacher.id,
        `https://classroom.google.com/c/${bdId}/a/ALIAS`,
        false
      )
    );
  }

  return ok({ tasks, totalWeeks: 16 });
}

/* ──────────────────────────────────────────────────────────────────────────────
   ОЦІНКИ (частина вже є)
   ────────────────────────────────────────────────────────────────────────────── */
export async function fetchStudentGrades(
  studentId: string
): Promise<StudentGradesResponse> {
  const now = new Date();
  const mk = (
    subject: string,
    points: number,
    comment: string,
    daysAgo: number,
    classroomUrl?: string,
    max?: number
  ): GradeItem => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return {
      id: uid(),
      subject,
      points,
      max,
      comment,
      createdAt: d.toISOString(),
      classroomUrl,
    };
  };

  // 2–3 оцінки для кожного видимого в розкладі/метаданих предмета
  const mkSubjectGrades = (canonId: string, displayName: string) => [
    mk(
      displayName,
      8,
      `${displayName}: Контрольна/квіз`,
      21,
      `https://classroom.google.com/c/${canonId}/a/G1`,
      10
    ),
    mk(
      displayName,
      9,
      `${displayName}: Лабораторна/практика`,
      8,
      `https://classroom.google.com/c/${canonId}/a/G2`,
      10
    ),
    mk(
      displayName,
      10,
      `${displayName}: Микрокейс/есе`,
      2,
      `https://classroom.google.com/c/${canonId}/a/G3`,
      10
    ),
  ];

  // 1) Згенерили всі оцінки (у т.ч. для "…(лаб.)")
  const allItems: GradeItem[] = [];
  for (const [canonId, meta] of Object.entries(SUBJECT_META)) {
    allItems.push(...mkSubjectGrades(canonId, meta.name));
  }
  // бонус: “БД” як короткий аліас, щоб перевірити злиття
  const bdCanon = Object.keys(SUBJECT_META).find(
    (k) => SUBJECT_META[k].name === "Бази даних"
  );
  if (bdCanon) {
    allItems.push(
      mk(
        "БД",
        10,
        "БД: Захист лаби (аліас)",
        5,
        `https://classroom.google.com/c/${bdCanon}/a/G-ALIAS`,
        10
      )
    );
  }

  // 2) Агрегуємо в бакети за КАНОНІЧНИМ subjectId (lecture+lab+alias → один)
  const buckets = new Map<string, { name: string; items: GradeItem[] }>();
  for (const it of allItems) {
    const canonId = resolveCanonicalId(it.subject); // ← мапить “БД”, “Бази даних (лаб.)” → “бази-даних”
    const name = SUBJECT_META[canonId]?.name ?? it.subject; // людська назва для відображення
    if (!buckets.has(canonId)) buckets.set(canonId, { name, items: [] });
    buckets.get(canonId)!.items.push(it);
  }

  // 3) Формуємо підсумковий масив SubjectGrades (із сумою)
  const subjects: SubjectGrades[] = Array.from(buckets.entries())
    .map(([canonId, b]) => {
      console.log(canonId + "parsed");
      // за бажанням: відсортувати оцінки усередині предмета за датою (новіші зверху)
      b.items.sort((a, c) => c.createdAt.localeCompare(a.createdAt));
      return {
        subject: b.name,
        items: b.items,
        total: b.items.reduce((s, it) => s + it.points, 0),
      };
    })
    // опційне сортування карток за назвою
    .sort((a, b) => a.subject.localeCompare(b.subject, "uk"));

  return ok({
    studentId,
    subjects,
    updatedAt: now.toISOString(),
  });
}

// Канонізація будь-якого subjectId (у т.ч. аліасів) до канонічного slug
function resolveCanonicalId(anyId: string): string {
  const id = slugify(anyId);

  // 1) пряме попадання в канон
  if (SUBJECT_META[id]) return id;

  // 2) пошук серед аліасів → повертаємо ключ (канон)
  for (const canonId of Object.keys(SUBJECT_META)) {
    const aliases = SUBJECT_ALIASES[canonId] ?? [];
    if (aliases.includes(id)) return canonId;
  }

  // 3) нічого не знайшли — повертаємо як є (міг бути новий предмет)
  return id;
}

// Універсальний матч назви предмету (людська назва) з будь-яким subjectId/алiасом
function matchById(anyId: string, humanName: string): boolean {
  const canonId = resolveCanonicalId(anyId);
  const s = slugify(humanName);
  if (s === canonId) return true;
  const aliases = SUBJECT_ALIASES[canonId] ?? [];
  return aliases.includes(s);
}

/* ──────────────────────────────────────────────────────────────────────────────
   СТОРІНКА ПРЕДМЕТУ (агрегація з трьох джерел + матеріали)
   ────────────────────────────────────────────────────────────────────────────── */
export async function fetchStudentSubject(
  studentId: string,
  subjectId: string
): Promise<SubjectDetails> {
  const [hw, grades, schedule] = await Promise.all([
    fetchStudentHomework(studentId),
    fetchStudentGrades(studentId),
    fetchStudentSchedule(studentId),
  ]);

  // ✅ приводимо будь-який subjectId (у т.ч. бд/…-лаб.) до канонічного
  const canonId = resolveCanonicalId(subjectId);
  const meta = SUBJECT_META[canonId] ?? {
    name: subjectId as any,
    teacher: { id: "t", name: "Викладач" },
  };

  // ✅ перше посилання на пару (з урахуванням аліасів), і завжди string
  const meetingUrl =
    schedule.lessons.find((l) => matchById(canonId, l.subject))?.meetingUrl ??
    "";

  const materials: SubjectMaterial[] = [
    {
      id: uid(),
      title: "Програма курсу",
      url: "https://drive.google.com/file/d/course",
      kind: "doc",
    },
    {
      id: uid(),
      title: "Слайди лекції 1",
      url: "https://drive.google.com/file/d/slides1",
      kind: "slides",
    },
    {
      id: uid(),
      title: "Відео лабораторної №1",
      url: "https://youtu.be/dQw4w9WgXcQ",
      kind: "video",
    },
    {
      id: uid(),
      title: "Приклад репозиторію",
      url: "https://github.com/example/course",
      kind: "repo",
    },
  ];

  // ✅ ДЗ для всіх варіантів назви цього предмету
  const upcomingHomework = hw.tasks
    .filter((t) => matchById(canonId, t.subject))
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)
    .map((t) => ({
      id: t.id,
      text: t.text,
      dueDate: t.dueDate,
      classroomUrl: t.classroomUrl,
    }));

  // ✅ Оцінки теж по канону/алiасах
  const recentGrades = grades.subjects
    .filter((s) => matchById(canonId, s.subject))
    .flatMap((s) => s.items)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map((g) => ({
      id: g.id,
      comment: g.comment,
      points: g.points,
      max: g.max,
      createdAt: g.createdAt,
      classroomUrl: g.classroomUrl,
    }));

  return ok({
    id: canonId, // ✅ зберігаємо канонічний id у відповіді
    name: meta.name, // показуємо “Бази даних”, навіть якщо URL був “бд” або “…-лаб.”
    teacher: meta.teacher,
    meetingUrl,
    description:
      "Короткий опис курсу, критерії оцінювання, політика дедлайнів, посилання на Classroom.",
    materials,
    upcomingHomework,
    recentGrades,
    updatedAt: new Date().toISOString(),
  });
}
