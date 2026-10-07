// src/lib/fakeApi/facultyScheduleSeed.ts
// ГЕНЕРАТИВНИЙ сид: будує "реалістичний" розклад під вимоги.
// - 4 пари/день
// - парність/непарність для 2-ї пари (even/odd у тій самій клітинці)
// - групи як колонки (КН/ІПЗ/ПМ для бакалаврів; набір спец для магістрів по 2 групи)
// - частина викладачів перетинається між бакалавратом і магістратурою

import type { FacultyLesson } from "@/types/schedule";

/* ---------- Константи часу та допоміжні утиліти ---------- */
const TIMES: Record<1|2|3|4, { start: string; end: string }> = {
  1: { start: "08:30", end: "10:05" },
  2: { start: "10:25", end: "12:00" },
  3: { start: "12:10", end: "13:45" },
  4: { start: "14:00", end: "15:35" },
};
const WEEKDAYS: (1|2|3|4|5)[] = [1,2,3,4,5]; // Пн–Пт

let seq = 0;
const uid = () => `seed-${++seq}`;

type Level = "bachelor" | "master";

/* -------------------- Конфіг предметів/викладачів -------------------- */
// Спільний пул викладачів (деякі ведуть і там, і там):
const LECTURERS = {
  ivanenko: "Проф. Іваненко",
  petrenko: "Доц. Петренко",
  kovalenko: "Ас. Коваленко",
  bondar: "Доц. Бондар",
  melnyk: "Проф. Мельник",
  romanenko: "Викл. Романенко",
  shevchenko: "Доц. Шевченко",
  tkachuk: "Доц. Ткачук",
  moroz: "Ас. Мороз",
};

// Бакалаври — предмети по напрямах (щоб виглядало правдоподібно)
const SUBJECTS_BACH = {
  KN:       ["Алгоритми та структури даних", "Програмування", "Комп’ютерні мережі", "Операційні системи", "Бази даних"],
  IPZ:      ["Проєктування ПЗ", "Патерни проєктування", "Тестування ПЗ", "Архітектура ПЗ"],
  PM:       ["Математичний аналіз", "Лінійна алгебра", "Дискретна математика", "Теорія ймовірностей", "Чисельні методи"],
  LANG:     ["Іноземна мова"], // щоб розбавити сітку
};

// Магістри — набори дисциплін за напрямами
const SUBJECTS_MASTERS = {
  "ПМ": ["Оптимізація", "Стохастичні процеси", "Чисельні методи"],
  "Інформатика": ["Інтелектуальний аналіз даних", "Обробка зображень"],
  "ІТ": ["Розподілені системи", "Хмарні сервіси"],
  "ШІ": ["Нейронні мережі", "Глибинне навчання"],
  "ММШІ": ["Математичні методи ШІ", "Ідентифікація систем"],
  "СМПР": ["Системи машинного перекладу", "NLP методи"],
  "АСД": ["Аналіз складності даних", "Паралельні алгоритми"],
  "ПЗС": ["Проєктування захищених систем", "Криптографічні протоколи"],
  // 2 курс
  "Прикладна математика": ["Диф. рівняння", "Обчислювальна математика"],
  "БІ": ["Біоінформатика", "Статистика в біології"],
};

// Прив’язка викладачів — частково перетинається між рівнями
const PICK_LECTURER = (subject: string): string => {
  if (/мереж|мережі|розподілен/i.test(subject)) return LECTURERS.bondar;
  if (/операційн|систем/i.test(subject)) return LECTURERS.shevchenko;
  if (/баз[и|а]\s+дан/i.test(subject)) return LECTURERS.ivanenko;
  if (/алгоритм|структур/i.test(subject)) return LECTURERS.melnyk;
  if (/аналіз|ймовірн|чисельн|лінійн/i.test(subject)) return LECTURERS.romanenko;
  if (/проект|проєкт|архітект|тестув/i.test(subject)) return LECTURERS.petrenko;
  if (/нейрон|глибин/i.test(subject)) return LECTURERS.tkachuk;
  if (/даних|зображ/i.test(subject)) return LECTURERS.kovalenko;
  if (/захищен|крипто/i.test(subject)) return LECTURERS.moroz;
  return LECTURERS.petrenko;
};

/* ----------------------- Формування груп (імен) ----------------------- */
// 4 групи КН, 2 — ІПЗ, 3 — ПМ для кожного курсу 1–4.
function bachelorGroupsByCourse(course: 1|2|3|4) {
  const toName = (prefix: string, idx: number) => `${prefix}-${course}${String.fromCharCode(64+idx)}`; // A,B,C...
  const KN  = Array.from({length: 4}, (_,i) => toName("К", i+1));
  const IPZ = Array.from({length: 2}, (_,i) => toName("ІПЗ", i+1));
  const PM  = Array.from({length: 3}, (_,i) => toName("ПМ", i+1));
  return { KN, IPZ, PM };
}

// Магістр 1 курс: ПМ, Інформатика, ІТ, ШІ, ММШІ, СМПР, АСД, ПЗС — по 2 групи
// Магістр 2 курс: Прикладна математика, Інформатика, БІ, ШІ, ММШІ, СМПР, ПЗС — по 2 групи
function masterGroups(course: 1|2) {
  const spec1 = ["ПМ","Інформатика","ІТ","ШІ","ММШІ","СМПР","АСД","ПЗС"];
  const spec2 = ["Прикладна математика","Інформатика","БІ","ШІ","ММШІ","СМПР","ПЗС"];
  const specs = (course === 1 ? spec1 : spec2);
  // Групи: М-<спец>-1, М-<спец>-2
  const groups = specs.flatMap(s => [`М-${s}-1`, `М-${s}-2`]);
  return groups;
}

/* ---------------------- Будівник записів розкладу ---------------------- */
type BuildOpts = {
  level: Level;
  group: string;
  course: 1|2|3|4;
  weekday: 1|2|3|4|5;
  pair: 1|2|3|4;
  subject: string;
  parity: "any" | "even" | "odd";
  location: string;
  pinned?: boolean;
};

function mkLesson(o: BuildOpts): FacultyLesson {
  return {
    id: uid(),
    level: o.level,
    group: o.group,
    course: o.course,
    weekday: o.weekday,
    pair: o.pair,
    parity: o.parity,
    time: TIMES[o.pair],
    subject: o.subject,
    teacher: PICK_LECTURER(o.subject),
    location: o.location,
    pinned: !!o.pinned,
  };
}

/* --------------------------- Розклад бакалаврів -------------------------- */
// Стратегія:
// - Пара 2: завжди дублюємо двома записами з parity even/odd (типовий кейс “два в клітинці”)
// - Пара 1/3: "any" (або іноді even/odd для розмаїття через день)
// - Пара 4: чергуємо парність за днем (Пн/Ср/Пт = even, Вт/Чт = odd)
const buildBachelor = (): FacultyLesson[] => {
  const lessons: FacultyLesson[] = [];

  const locations = ["101","107","212","220","314","406","407","510"];

  ( [1,2,3,4] as (1|2|3|4)[] ).forEach(course => {
    const { KN, IPZ, PM } = bachelorGroupsByCourse(course);
    const allGroups = [
      ...KN.map(g => ({ group: g, bank: SUBJECTS_BACH.KN })),
      ...IPZ.map(g => ({ group: g, bank: SUBJECTS_BACH.IPZ })),
      ...PM.map(g => ({ group: g, bank: SUBJECTS_BACH.PM })),
    ];

    WEEKDAYS.forEach((wd, wdIdx) => {
      allGroups.forEach(({ group, bank }, gi) => {
        // Вибір предметів із банку з невеликою ротацією
        const s1 = bank[(wdIdx + gi) % bank.length];
        const s2 = bank[(wdIdx + gi + 1) % bank.length];
        const s3 = (SUBJECTS_BACH.LANG[0]);
        const s4 = bank[(wdIdx + gi + 2) % bank.length];

        // Пара 1 — any
        lessons.push(mkLesson({
          level: "bachelor", group, course,
          weekday: wd, pair: 1, parity: "any",
          subject: s1, location: locations[(gi + wdIdx) % locations.length],
          pinned: (wd === 1 && gi % 5 === 0) // деякі пари “запінені”
        }));

        // Пара 2 — even + odd у тій самій комірці
        lessons.push(mkLesson({
          level: "bachelor", group, course,
          weekday: wd, pair: 2, parity: "even",
          subject: s2 + " (лекція)", location: locations[(gi + wdIdx + 1) % locations.length],
        }));
        lessons.push(mkLesson({
          level: "bachelor", group, course,
          weekday: wd, pair: 2, parity: "odd",
          subject: s2 + " (практика)", location: locations[(gi + wdIdx + 1) % locations.length],
        }));

        // Пара 3 — any / інколи odd для різноманіття
        const p3: "any" | "odd" = (gi % 4 === 0 && wdIdx % 2 === 1) ? "odd" : "any";
        lessons.push(mkLesson({
          level: "bachelor", group, course,
          weekday: wd, pair: 3, parity: p3,
          subject: s3, location: locations[(gi + wdIdx + 2) % locations.length],
        }));

        // Пара 4 — парність залежно від дня
        const p4: "even" | "odd" = (wd % 2 ? "even" : "odd");
        lessons.push(mkLesson({
          level: "bachelor", group, course,
          weekday: wd, pair: 4, parity: p4,
          subject: s4, location: locations[(gi + wdIdx + 3) % locations.length],
        }));
      });
    });
  });

  return lessons;
};

/* --------------------------- Розклад магістрів --------------------------- */
// Стратегія та сама щодо парності; предмети — з масивів SUBJECTS_MASTERS.
// Групи виду: "М-<спец>-1", "М-<спец>-2", на курсах 1 і 2.
const buildMasters = (): FacultyLesson[] => {
  const lessons: FacultyLesson[] = [];
  const locations = ["601","602","603","604","605","701","702","703"];

  ( [1,2] as (1|2)[] ).forEach(course => {
    const groups = masterGroups(course);
    // Визначимо банк предметів для кожної групи за її "спец" (середина в імені)
    const getSpec = (g: string) => g.replace(/^М-/, "").replace(/-\d+$/, "");

    WEEKDAYS.forEach((wd, wdIdx) => {
      groups.forEach((group, gi) => {
        const spec = getSpec(group);
        const bank = SUBJECTS_MASTERS[spec as keyof typeof SUBJECTS_MASTERS] || ["Інд. дослідження"];

        const s1 = bank[(wdIdx + gi) % bank.length];
        const s2 = bank[(wdIdx + gi + 1) % bank.length];
        const s3 = bank[(wdIdx + gi + 2) % bank.length] || "Науковий семінар";
        const s4 = bank[(wdIdx + gi + 3) % bank.length] || "Проєкт";

        // Пара 1 — any
        lessons.push(mkLesson({
          level: "master", group, course: course as 1|2|3|4,
          weekday: wd, pair: 1, parity: "any",
          subject: s1, location: locations[(gi + wdIdx) % locations.length],
          pinned: (wd === 2 && gi % 7 === 0)
        }));

        // Пара 2 — even + odd
        lessons.push(mkLesson({
          level: "master", group, course: course as 1|2|3|4,
          weekday: wd, pair: 2, parity: "even",
          subject: s2 + " (лекція)", location: locations[(gi + wdIdx + 1) % locations.length],
        }));
        lessons.push(mkLesson({
          level: "master", group, course: course as 1|2|3|4,
          weekday: wd, pair: 2, parity: "odd",
          subject: s2 + " (практика)", location: locations[(gi + wdIdx + 1) % locations.length],
        }));

        // Пара 3 — any / інколи odd
        const p3: "any" | "odd" = ((gi + wdIdx) % 5 === 0) ? "odd" : "any";
        lessons.push(mkLesson({
          level: "master", group, course: course as 1|2|3|4,
          weekday: wd, pair: 3, parity: p3,
          subject: s3, location: locations[(gi + wdIdx + 2) % locations.length],
        }));

        // Пара 4 — парність за днем
        const p4: "even" | "odd" = (wd % 2 ? "even" : "odd");
        lessons.push(mkLesson({
          level: "master", group, course: course as 1|2|3|4,
          weekday: wd, pair: 4, parity: p4,
          subject: s4, location: locations[(gi + wdIdx + 3) % locations.length],
        }));
      });
    });
  });

  return lessons;
};

/* ------------------------------- Експорти ------------------------------- */
export const SEED_BACHELOR: FacultyLesson[] = buildBachelor();
export const SEED_MASTER:   FacultyLesson[] = buildMasters();
