// src/types/courses.ts
import type { Id } from "./common";

export type Course = {
  id: Id;
  code: string;        // напр. "DB101"
  title: string;       // напр. "Бази даних"
  groupIds: Id[];      // групи, що відвідують
  teacherId?: Id | null;
};
