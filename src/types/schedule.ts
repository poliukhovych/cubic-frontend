//src/types/schedule.ts
import type { Id, ISODate } from "./common";

export type WeekParity = "even" | "odd" | "any";

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
