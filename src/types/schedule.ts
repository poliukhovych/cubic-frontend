//src/types/schedule.ts
import type { Id, ISODate } from "./common";

export type WeekParity = "even" | "odd" | "any";
export type Parity = "any" | "even" | "odd";

export type GroupRef = { id: Id; name: string; subgroup?: "a" | "b" | null };

// src/types/schedule.ts
export type Lesson = {
  id: string;
  weekday: 1|2|3|4|5|6|7;
  time: { start: string; end: string };
  subject: string;
  location?: string | null;
  group: { id: string; name: string; subgroup?: "a"|"b"|null };
  parity?: "any" | "even" | "odd";
  meetingUrl?: string;     // 🔹 NEW: посилання на Google Meet / Zoom
};


export type StudentSchedule = {
  studentId: Id;
  group: GroupRef;
  lessons: Lesson[];
};

export type TeacherSchedule = {
  teacherId: Id;
  lessons: (Lesson & { group: GroupRef })[];
};

export type DaySchedule = { weekday: Lesson["weekday"]; lessons: Lesson[] };

export type ScheduleUpdate = {
  effectiveFrom: ISODate;
};


/** Один запис у розкладі факультету */
export type FacultyLesson = {
  id: string;
  weekday: 1 | 2 | 3 | 4 | 5 | 6;        // 1=Пн ... 6=Сб
  pair: 1 | 2 | 3 | 4;                    // № пари (ми обмежилися 4 на день)
  parity: Parity;                         // any / even / odd
  time: { start: string; end: string };
  course: 1 | 2 | 3 | 4;                  // бакалаври 1–4; (для магістрів використовуємо 1|2)
  level: "bachelor" | "master";

  /** НОВЕ: код/назва групи, напр. "КН-11", "ПІ-12" тощо */
  group: string;

  /** (legacy) спеціальність — залишено для сумісності із сідами; можна поступово прибрати */
  speciality?: string;

  subject: string;
  teacher: string;
  location?: string;

  /** 📌 якщо true — пара «запінена» і не рухається drag-n-drop'ом */
  pinned?: boolean;
};

export type ScheduleSnapshot = {
  id: string;
  title: string;
  comment: string;               // ← обовʼязково
  parity: "odd" | "even" | "both";
  createdAt: string;             // ISO
  createdBy: string;
  lessons: FacultyLesson[];      // повний зріз поточного розкладу
};
