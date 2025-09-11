// src/lib/fakeApi/student.ts
import { ok, uid } from "./index";
import type { StudentSchedule } from "@/types/schedule";
import type { HomeworkTask, StudentHomeworkResponse } from "@/types/homework";

export async function fetchStudentSchedule(studentId: string): Promise<StudentSchedule> {
  const group = { id: "g1", name: "КН-41", subgroup: "a" as const };

  const PAIRS = {
    1: { start: "08:30", end: "10:05" },
    2: { start: "10:25", end: "12:00" },
    3: { start: "12:10", end: "13:45" },
    4: { start: "14:00", end: "15:35" },
    5: { start: "15:45", end: "17:20" },
  } as const;

  const L = (
    weekday: 1|2|3|4|5|6,
    pair: 1|2|3|4|5,
    subject: string,
    location: string,
    parity: "any"|"even"|"odd" = "any",
    meetingUrl?: string
  ) => ({
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
    // (можеш додати totalWeeks і для розкладу, якщо треба)
    lessons: [
      L(1,1,"Математика","ауд. 204","any",      meet("abc-defg-hij")),
      L(1,2,"ОПП","ауд. 312","even",            zoom("9991112223")),
      L(1,3,"Алгоритми і структури даних","ауд. 221","odd", meet("kln-opqr-stu")),
      L(1,5,"Англійська мова","ауд. 507","any", meet("eng-aaaa-bbb")),

      L(2,2,"Бази даних","ауд. 107","any",      meet("db1-xyza-zzz")),
      L(2,3,"Комп'ютерні мережі","ауд. 405","even", zoom("7775552222")),
      L(2,4,"Фізика","ауд. 118","odd",          meet("phy-0000-111")),

      L(3,1,"Теорія ймовірностей","ауд. 210","any", meet("prob-222-333")),
      L(3,3,"Комп'ютерна графіка","ауд. 316","odd", meet("cgf-444-555")),
      L(3,3,"Операційні системи","ауд. 122","even", zoom("1231231234")),

      L(4,2,"Математика","ауд. 204","any",      meet("math-666-777")),
      L(4,3,"Веб-технології","ауд. 229","even", meet("web-888-999")),
      L(4,4,"ОПП (практика)","лаб. 3-12","odd", zoom("8880001111")),

      L(5,1,"Бази даних (лаб.)","лаб. 2-07","even", meet("dbl-222-111")),
      L(5,2,"Алгоритми (практика)","ауд. 221","any", meet("alg-333-222")),
      L(5,5,"Філософія","ауд. 314","odd",          zoom("5554443333")),

      L(6,2,"Англійська мова (розмовна)","ауд. 509","any", zoom("1112223334")),
      L(6,4,"Проєктний практикум","ауд. 101","any",      meet("proj-555-666")),
    ],
  });
}

// 🔹 тепер повертаємо { tasks, totalWeeks } і додано більше завдань
export async function fetchStudentHomework(studentId: string): Promise<StudentHomeworkResponse> {
  console.log("fetchStudentHomework", { studentId });
  const today = new Date();
  const mkDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().slice(0, 10); // YYYY-MM-DD
  };

  const tasks: HomeworkTask[] = [
    {
      id: uid(),
      subject: "БД",
      text: "Нормалізувати схему до 3НФ. Зверніть увагу на аномалії вставки/оновлення/видалення та наведіть приклади.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(-4), // ближній дедлайн
      groupId: "g1",
      teacherId: "t1",
      classroomUrl: "https://classroom.google.com/c/ABCD1234/a/XYZ111",
      files: [{ id: uid(), url: "https://drive.google.com/file/d/xyz/view", title: "Приклад" }],
    },
    {
      id: uid(),
      subject: "ОПП",
      text: "Реалізувати патерн Observer",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(-3),
      groupId: "g1",
      teacherId: "t2",
      classroomUrl: "https://classroom.google.com/c/EFGH5678/a/XYZ222",
    },
    {
      id: uid(),
      subject: "ОПП",
      text: "Реалізувати патерн Observer ",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(-1),
      groupId: "g1",
      teacherId: "t2",
      classroomUrl: "https://classroom.google.com/c/EFGH5678/a/XYZ222",
    },
    {
      id: uid(),
      subject: "ОПП",
      text: "Реалізувати патерн KISS.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(7),
      groupId: "g1",
      teacherId: "t2",
      classroomUrl: "https://classroom.google.com/c/EFGH5678/a/XYZ222",
    },
    {
      id: uid(),
      subject: "Алгоритми",
      text: "ДП: мінімальна вартість шляху по матриці. Реалізація + аналіз складності.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(13),
      groupId: "g1",
      teacherId: "t3",
      classroomUrl: "https://classroom.google.com/c/ALGO1/a/A1",
    },
    {
      id: uid(),
      subject: "Веб-технології",
      text: "Сторінка з формою входу: валідація, анімації, адаптив, ARIA-атрибути.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(15),
      groupId: "g1",
      teacherId: "t4",
      classroomUrl: "https://classroom.google.com/c/WEB1/a/W1",
    },
    {
      id: uid(),
      subject: "Комп'ютерні мережі",
      text: "Побудувати таблицю маршрутизації для заданої топології. Пояснити алгоритм SPF.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(20),
      groupId: "g1",
      teacherId: "t5",
      classroomUrl: "https://classroom.google.com/c/NET1/a/N1",
    },
    {
      id: uid(),
      subject: "Фізика",
      text: "Розв'язати 5 задач з оптики. Коротко описати модель і припущення.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(23),
      groupId: "g1",
      teacherId: "t6",
      classroomUrl: "https://classroom.google.com/c/PHY1/a/P1",
    },
    {
      id: uid(),
      subject: "Теорія ймовірностей",
      text: "Закон великих чисел: довести формулювання Чебишева на прикладі.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(28),
      groupId: "g1",
      teacherId: "t7",
      classroomUrl: "https://classroom.google.com/c/PROB1/a/PR1",
    },
    {
      id: uid(),
      subject: "Операційні системи",
      text: "Порівняти планувальники: FIFO, SJF, RR. Імітація в коді.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(32),
      groupId: "g1",
      teacherId: "t8",
      classroomUrl: "https://classroom.google.com/c/OS1/a/O1",
    },
    {
      id: uid(),
      subject: "Комп'ютерна графіка",
      text: "UV-розгортка і запікання нормалей. Підготувати коротке демо.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(38),
      groupId: "g1",
      teacherId: "t9",
      classroomUrl: "https://classroom.google.com/c/CG1/a/C1",
    },
    {
      id: uid(),
      subject: "Філософія",
      text: "Есе: «Технооптимізм vs техноскепсис». 800–1000 слів.",
      createdAt: new Date().toISOString(),
      dueDate: mkDate(45),
      groupId: "g1",
      teacherId: "t10",
      classroomUrl: "https://classroom.google.com/c/PHIL1/a/F1",
    },
  ];

  // наприклад, семестр 16 тижнів:
  return ok({ tasks, totalWeeks: 16 });
}
