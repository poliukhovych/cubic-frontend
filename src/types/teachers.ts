// src/types/teachers.ts
import type { Id } from "./common";

export type TeacherStatus = "active" | "inactive" | "pending";

export type Teacher = {
  id: Id;
  name: string;
  subjects: string[];
  busyWindows?: Array<{ weekday: 1 | 2 | 3 | 4 | 5 | 6 | 7; hours: string }>;
  status?: TeacherStatus;
};
