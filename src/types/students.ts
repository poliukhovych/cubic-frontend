//src/types/students.ts
import type { Id } from "./common";

export type Student = { id: Id; name: string; email: string; groupId: Id; subgroup?: "a" | "b" | null };

export type Group = { id: Id; name: string; size: number };
