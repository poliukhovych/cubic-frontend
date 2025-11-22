// src/lib/api/teachers-api.ts

import { api } from "@/lib/api";
import type { Teacher, TeacherStatus } from "@/types/teachers";

// Те, що реально повертає бекенд у GET /api/teachers/
export interface BackendTeacher {
  teacherId: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  status: TeacherStatus;
  userId: string | null;
  full_name?: string;
}

export interface TeachersListResponse {
  teachers: BackendTeacher[];
  total: number;
}

export interface TeacherWritePayload {
  first_name: string;
  last_name: string;
  patronymic: string;
  status: TeacherStatus;
  user_id?: string | null;
}

function buildFullName(t: BackendTeacher): string {
  if (t.full_name && t.full_name.trim().length > 0) {
    return t.full_name;
  }
  const parts = [t.lastName, t.firstName, t.patronymic].filter(Boolean) as string[];
  return parts.join(" ");
}

function mapBackendTeacher(t: BackendTeacher): Teacher {
  return {
    id: t.teacherId,
    name: buildFullName(t),
    subjects: [],
    status: t.status,
  };
}

// GET /api/teachers/
export async function fetchTeachersApi(): Promise<Teacher[]> {
  const data = await api.get<TeachersListResponse>("/api/teachers/");
  return data.teachers.map(mapBackendTeacher);
}

// GET /api/teachers/{teacher_id}
export async function getTeacherApi(teacherId: string): Promise<BackendTeacher> {
  return api.get<BackendTeacher>(`/api/teachers/${teacherId}`);
}

// POST /api/teachers/
export async function createTeacherApi(
  payload: TeacherWritePayload,
): Promise<Teacher> {
  const created = await api.post<BackendTeacher>("/api/teachers/", payload);
  return mapBackendTeacher(created);
}

// PUT /api/teachers/{teacher_id}
export async function updateTeacherApi(
  teacherId: string,
  payload: TeacherWritePayload,
): Promise<Teacher> {
  const updated = await api.put<BackendTeacher>(
    `/api/teachers/${teacherId}`,
    payload,
  );
  return mapBackendTeacher(updated);
}

// DELETE /api/teachers/{teacher_id}
export async function deleteTeacherApi(teacherId: string): Promise<void> {
  await api.delete<void>(`/api/teachers/${teacherId}`);
}
