// src/lib/fakeApi/teacher.ts
import { ok, uid } from "./index";
import type { TeacherSchedule } from "@/types/schedule";
import type { Student } from "@/types/students";

// Стандартні часові слоти пар
const PAIRS = {
  1: { start: "08:30", end: "10:05" },
  2: { start: "10:25", end: "12:00" },
  3: { start: "12:10", end: "13:45" },
  4: { start: "14:00", end: "15:35" },
  5: { start: "15:45", end: "17:20" },
} as const;

type PairNo = keyof typeof PAIRS;
type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=Пн

/// маленький slugify для id предмету
const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]/g, "");

type Lesson = {
  id: string;
  weekday: Weekday;
  time: typeof PAIRS[PairNo];
  subject: string;
  subjectId: string;
  location: string;
  group: { id: string; name: string; subgroup?: "a" | "b" | null };
  parity: "any" | "even" | "odd";
  meetingUrl?: string;
};

// Хелпер заняття
const L = (
  weekday: Weekday,
  pair: PairNo,
  subject: string,
  group: { id: string; name: string; subgroup?: "a" | "b" | null },
  location: string,
  parity: "any" | "even" | "odd" = "any",
  meetingUrl?: string
): Lesson => ({
  id: uid(),
  weekday,
  time: PAIRS[pair],
  subject,
  subjectId: slug(subject),
  location,
  group,
  parity,
  meetingUrl,
});

export async function fetchTeacherSchedule(teacherId: string): Promise<TeacherSchedule & { lessons: Lesson[]; totalWeeks?: number }> {
  const IPS11a = { id: "ips11", name: "ІПС-11", subgroup: "a" as const };
  const IPS11b = { id: "ips11", name: "ІПС-11", subgroup: "b" as const };
  const KN21a = { id: "kn21", name: "КН-21", subgroup: "a" as const };
  const KN21b = { id: "kn21", name: "КН-21", subgroup: "b" as const };
  const PM41  = { id: "pm41", name: "ПМ-41", subgroup: null };
  const INF42 = { id: "inf42", name: "ІНФ-42", subgroup: null };

  const lessons: Lesson[] = [
    L(1, 2, "Медіаконтроль (лаб.)", IPS11a, "лаб. 1-02", "odd", "https://meet.uni/ips11a-media"),
    L(1, 2, "Медіаконтроль (лаб.)", IPS11b, "лаб. 1-03", "even", "https://meet.uni/ips11b-media"),
    L(4, 1, "Медіаконтроль (лаб.)", IPS11a, "ауд. 207", "even", "https://meet.uni/ips11a-media-2"),
    L(4, 1, "Медіаконтроль (семінар)", IPS11b, "ауд. 208", "odd", "https://meet.uni/ips11b-seminar"),

    L(3, 2, "ООП (лекція)", { id: "kn21", name: "КН-21", subgroup: null }, "ауд. 502", "any", "https://meet.uni/kn21-oop"),
    L(3, 3, "ООП (практика)", KN21a, "лаб. 2-10", "any", "https://meet.uni/kn21a-oop"),
    L(3, 3, "ООП (практика)", KN21b, "лаб. 2-11", "any", "https://meet.uni/kn21b-oop"),

    L(2, 5, "Розробка баз даних (лекція)", PM41, "ауд. 114", "any", "https://meet.uni/pm41-db"),
    L(4, 4, "Розробка баз даних (практикум)", PM41, "лаб. 3-12", "any", "https://meet.uni/pm41-db-lab"),

    L(5, 1, "Теорія алгоритмів (лекція)", INF42, "ауд. 401", "any", "https://meet.uni/inf42-ta"),
    L(7, 2, "Теорія алгоритмів (консультація)", INF42, "ауд. 214", "any", "https://meet.uni/inf42-consult"),
  ];

  return ok({ teacherId, lessons, totalWeeks: 16 } as any);
}
// Утиліта створення студента
const S = (fullName: string, email: string, groupId: string, subgroup?: "a" | "b"): Student =>
  ({ id: uid(), name: fullName, email, groupId, subgroup, status: "active" });

export async function fetchMyStudents(teacherId: string): Promise<Student[]> {
  // ІПС-11: дві підгрупи по 12 → разом 24 (у межах 20–30 на групу, 10–15 на підгрупу)
  const ips11a: Student[] = [
    S("Петренко Іван Олександрович", "ivan.petrenko@uni.ua", "ips11", "a"),
    S("Коваль Олена Михайлівна", "olena.koval@uni.ua", "ips11", "a"),
    S("Мельник Андрій Сергійович", "andrii.melnyk@uni.ua", "ips11", "a"),
    S("Шевченко Марія Ігорівна", "maria.shevchenko@uni.ua", "ips11", "a"),
    S("Бондар Володимир Петрович", "volodymyr.bondar@uni.ua", "ips11", "a"),
    S("Кравчук Наталія Вікторівна", "nataliia.kravchuk@uni.ua", "ips11", "a"),
    S("Сидоренко Дмитро Володимирович", "dmytro.sydorenko@uni.ua", "ips11", "a"),
    S("Зінченко Ірина Олександрівна", "iryna.zinchenko@uni.ua", "ips11", "a"),
    S("Лисенко Ростислав Валерійович", "rostyslav.lysenko@uni.ua", "ips11", "a"),
    S("Романюк Ганна Степанівна", "hanna.romaniuk@uni.ua", "ips11", "a"),
    S("Гончарук Максим Юрійович", "maksym.honcharuk@uni.ua", "ips11", "a"),
    S("Ткаченко Софія Тарасівна", "sofiia.tkachenko@uni.ua", "ips11", "a"),
  ];

  const ips11b: Student[] = [
    S("Данилюк Артем Леонідович", "artem.danyliuk@uni.ua", "ips11", "b"),
    S("Онищенко Валерія Павлівна", "valeriia.onyshchenko@uni.ua", "ips11", "b"),
    S("Мороз Павло Романович", "pavlo.moroz@uni.ua", "ips11", "b"),
    S("Поліщук Оксана Євгенівна", "oksana.polishchuk@uni.ua", "ips11", "b"),
    S("Чорний Юрій Анатолійович", "yurii.chornyi@uni.ua", "ips11", "b"),
    S("Яковенко Катерина Ігорівна", "kateryna.yakovenko@uni.ua", "ips11", "b"),
    S("Савченко Ілля Олексійович", "illia.savchenko@uni.ua", "ips11", "b"),
    S("Кириленко Дарина Миколаївна", "daryna.kyrylenko@uni.ua", "ips11", "b"),
    S("Юрченко Владислав Олегович", "vladyslav.yurchenko@uni.ua", "ips11", "b"),
    S("Руденко Аліна Сергіївна", "alina.rudenko@uni.ua", "ips11", "b"),
    S("Волошин Михайло Андрійович", "mykhailo.voloshyn@uni.ua", "ips11", "b"),
    S("Козак Лілія Богданівна", "liliia.kozak@uni.ua", "ips11", "b"),
  ];

  // КН-21: дві підгрупи по 13 → разом 26
  const kn21a: Student[] = [
    S("Авраменко Олександр Сергійович", "oleksandr.avramenko@uni.ua", "kn21", "a"),
    S("Березюк Ольга Володимирівна", "olha.bereziuk@uni.ua", "kn21", "a"),
    S("Василенко Денис Петрович", "denys.vasylenko@uni.ua", "kn21", "a"),
    S("Гаврилюк Марина Вікторівна", "maryna.havryliuk@uni.ua", "kn21", "a"),
    S("Гордієнко Сергій Олегович", "serhii.hordiienko@uni.ua", "kn21", "a"),
    S("Демчук Анастасія Ігорівна", "anastasiia.demchuk@uni.ua", "kn21", "a"),
    S("Жуков Богдан Валентинович", "bohdan.zhukov@uni.ua", "kn21", "a"),
    S("Захарченко Владислава Романівна", "vladyslava.zakharchenko@uni.ua", "kn21", "a"),
    S("Іщенко Тарас Михайлович", "taras.ishchenko@uni.ua", "kn21", "a"),
    S("Калініченко Єлизавета Олександрівна", "yel.v.kalinichenko@uni.ua", "kn21", "a"),
    S("Ковтун Назар Віталійович", "nazar.kovtun@uni.ua", "kn21", "a"),
    S("Куценко Олексій Артемович", "oleksii.kutsenko@uni.ua", "kn21", "a"),
    S("Луценко Дарія Степанівна", "dariia.lutsenko@uni.ua", "kn21", "a"),
  ];

  const kn21b: Student[] = [
    S("Мазур Іванна Сергіївна", "ivanna.mazur@uni.ua", "kn21", "b"),
    S("Марчук Роман Юрійович", "roman.marchuk@uni.ua", "kn21", "b"),
    S("Нікітін Олексій Леонідович", "oleksii.nikitin@uni.ua", "kn21", "b"),
    S("Опанасенко Олександра Андріївна", "oleksandra.opanasenko@uni.ua", "kn21", "b"),
    S("Паламарчук Катерина Богданівна", "kateryna.palamarchuk@uni.ua", "kn21", "b"),
    S("Петрук Артем Анатолійович", "artem.petruk@uni.ua", "kn21", "b"),
    S("Рибак Ігор Валерійович", "ihor.rybak@uni.ua", "kn21", "b"),
    S("Семенюк Христина Тарасівна", "khrystyna.semeniuk@uni.ua", "kn21", "b"),
    S("Скрипник Владлена Ігорівна", "vladlena.skrypnyk@uni.ua", "kn21", "b"),
    S("Тимченко Ярослав Віталійович", "yaroslav.tymchenko@uni.ua", "kn21", "b"),
    S("Федорчук Микита Олексійович", "mykyta.fedorchuk@uni.ua", "kn21", "b"),
    S("Хара Ірина Сергіївна", "iryna.kh@uni.ua", "kn21", "b"),
    S("Цимбал Анна Леонідівна", "anna.tsymbal@uni.ua", "kn21", "b"),
  ];

  // ПМ-41: одна група без підгруп — 22 студенти
  const pm41: Student[] = [
    S("Абрамчук Віктор Миколайович", "victor.abramchuk@uni.ua", "pm41"),
    S("Бабенко Світлана Олександрівна", "svitlana.babenko@uni.ua", "pm41"),
    S("Войтенко Андрій Петрович", "andrii.voitenko@uni.ua", "pm41"),
    S("Гнатюк Олег Вікторович", "oleh.hnatiuk@uni.ua", "pm41"),
    S("Дзюба Марія Романівна", "mariia.dziuba@uni.ua", "pm41"),
    S("Єрмаков Максим Олександрович", "maksym.yermakov@uni.ua", "pm41"),
    S("Журавель Катерина Сергіївна", "kateryna.zhuravel@uni.ua", "pm41"),
    S("Заяць Ірина Віталіївна", "iryna.zaiats@uni.ua", "pm41"),
    S("Іваненко Богдан Олегович", "bohdan.ivanenko@uni.ua", "pm41"),
    S("Кіліченко Руслан Сергійович", "ruslan.kilichenko@uni.ua", "pm41"),
    S("Левченко Аліса Олександрівна", "alisa.levchenko@uni.ua", "pm41"),
    S("Мазепа Михайло Тарасович", "mykhailo.mazepa@uni.ua", "pm41"),
    S("Носенко Вікторія Віталіївна", "viktoriia.nosenko@uni.ua", "pm41"),
    S("Овчаренко Степан Юрійович", "stepan.ovcharenko@uni.ua", "pm41"),
    S("Панченко Дмитро Ігорович", "dmytro.panchenko@uni.ua", "pm41"),
    S("Радчук Софія Леонідівна", "sofiia.radchuk@uni.ua", "pm41"),
    S("Сорока Павло Андрійович", "pavlo.soroka@uni.ua", "pm41"),
    S("Титаренко Дарина Олегівна", "daryna.tytarenko@uni.ua", "pm41"),
    S("Усенко Роман Сергійович", "roman.usenko@uni.ua", "pm41"),
    S("Франко Оксана Михайлівна", "oksana.franko@uni.ua", "pm41"),
    S("Хоменко Євген Вікторович", "yevhen.khomenko@uni.ua", "pm41"),
    S("Цвєткова Лідія Павлівна", "lidiia.tsvetkova@uni.ua", "pm41"),
  ];

  // ІНФ-42: одна група без підгруп — 21 студент
  const inf42: Student[] = [
    S("Анікіна Валентина Петрівна", "valentyna.anikina@uni.ua", "inf42"),
    S("Білоус Сергій Миколайович", "serhii.bilous@uni.ua", "inf42"),
    S("Варченко Кирило Олександрович", "kyrylo.varchenko@uni.ua", "inf42"),
    S("Герасимчук Анастасія Ігорівна", "anastasiia.herasymchuk@uni.ua", "inf42"),
    S("Дяченко Олег Анатолійович", "oleh.diachenko@uni.ua", "inf42"),
    S("Ємець Ілля Вадимович", "illia.yemets@uni.ua", "inf42"),
    S("Журба Тетяна Володимирівна", "tetiana.zhurba@uni.ua", "inf42"),
    S("Зборовський Андрій Миколайович", "andrii.zborovskyi@uni.ua", "inf42"),
    S("Ісаєва Катерина Олександрівна", "kateryna.isaeva@uni.ua", "inf42"),
    S("Кириченко Назар Миколайович", "nazar.kyrychenko@uni.ua", "inf42"),
    S("Литвин Ірина Степанівна", "iryna.lytvyn@uni.ua", "inf42"),
    S("Малик Юлія Сергіївна", "yuliia.malyk@uni.ua", "inf42"),
    S("Нечипоренко Богдан Вікторович", "bohdan.nechyporenko@uni.ua", "inf42"),
    S("Острогляд Олександра Тарасівна", "oleksandra.ostrohliad@uni.ua", "inf42"),
    S("Паламар Артем Валентинович", "artem.palamar@uni.ua", "inf42"),
    S("Рибчинський Микита Ігоревич", "mykyta.rybchynskyi@uni.ua", "inf42"),
    S("Савчук Марія Олексіївна", "mariia.savchuk@uni.ua", "inf42"),
    S("Терещенко Владислав Петрович", "vladyslav.tereshchenko@uni.ua", "inf42"),
    S("Ульянова Єлизавета Сергіївна", "yelyzaveta.ulianova@uni.ua", "inf42"),
    S("Фоменко Роман Андрійович", "roman.fomenko@uni.ua", "inf42"),
    S("Харченко Ганна Вадимівна", "hanna.kharchenko@uni.ua", "inf42"),
  ];

  console.log("Fetching students for teacher", teacherId);
  return ok([
    ...ips11a, ...ips11b,
    ...kn21a,  ...kn21b,
    ...pm41,
    ...inf42,
  ]);
}



type Grade = {
  id: string;
  comment?: string;
  points: number;
  max?: number;
  createdAt: string;
  classroomUrl?: string;
};

export type TeacherSubjectDetails = {
  id: string;                // subjectId
  name: string;              // subject
  teacher: { name: string; email?: string };
  meetingUrl?: string;
  materials: { id: string; title: string; url: string }[];
  upcomingHomework: { id: string; text: string; dueDate: string; classroomUrl?: string }[];
  recentGrades: Grade[];     // власні нотатки/еталони/приклади — як у студента
  description?: string;

  // нове:
  students: Array<{
    student: Student;
    grades: Grade[];
  }>;
};

// простий мок, який підбирає студентів за groupId з розкладу
export async function fetchTeacherSubject(teacherId: string, subjectId: string): Promise<TeacherSubjectDetails> {
  const sched = await fetchTeacherSchedule(teacherId);
  const lesson = (sched.lessons as any[]).find(l => l.subjectId === subjectId) as Lesson | undefined;

  // дефолт, якщо прийшли напряму
  const fallbackName = lesson?.subject ?? "Предмет";
  const name = lesson?.subject ?? "Предмет";
  const meetingUrl = lesson?.meetingUrl;

  // матеріали/дз/оцінки — приміром
  const base: Omit<TeacherSubjectDetails, "students" | "id" | "name"> = {
    teacher: { name: "Ви", email: "me@uni.ua" },
    meetingUrl,
    materials: [
      { id: uid(), title: `${name}: силлабус`, url: "https://drive.uni/syllabus.pdf" },
      { id: uid(), title: `${name}: лекція 1`, url: "https://drive.uni/lecture1.pdf" },
    ],
    upcomingHomework: [
      { id: uid(), text: "Домашня 1: базові вправи", dueDate: new Date(Date.now()+7*864e5).toISOString() },
    ],
    recentGrades: [
      { id: uid(), comment: "Приклад рубрики", points: 10, max: 10, createdAt: new Date().toISOString() },
    ],
    description: `Матеріали курсу «${name}».`,
  };

  // визначимо групи, що слухають цей предмет
  const involvedGroupIds = Array.from(new Set(
    (sched.lessons as Lesson[])
      .filter(l => l.subjectId === subjectId)
      .map(l => l.group.id)
  ));

  const all = await fetchMyStudents(teacherId);
  const enrolled = all.filter(s => involvedGroupIds.includes(s.groupId));

  // для демо: по дві оцінки студенту
  const mkGrade = (pts: number): Grade => ({
    id: uid(),
    points: pts,
    max: 100,
    createdAt: new Date().toISOString(),
  });

  const students = enrolled.map(st => ({
    student: st,
    grades: [mkGrade(72 + Math.floor(Math.random()*20)), mkGrade(60 + Math.floor(Math.random()*30))],
  }));

  return ok({
    id: subjectId || slug(fallbackName),
    name,
    ...base,
    students,
  });
}