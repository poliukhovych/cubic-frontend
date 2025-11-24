// src/lib/api/courses-api.ts

import { api } from "@/lib/api";
import type { Course } from "@/types/courses";

// Те, що реально повертає бекенд у GET /api/courses/
export interface BackendCourse {
  courseId: string;
  name: string;
  duration: number;
  code?: string;
  groupIds: string[];
  teacherIds: string[];
}

export interface CoursesListResponse {
  courses: BackendCourse[];
  total: number;
}

// Тіло POST /api/courses/ та PUT /api/courses/{course_id}
// ВАЖЛИВО: поля в snake_case, як очікує бекенд.
export interface CourseWritePayload {
  name: string;
  duration: number;
  group_ids: string[];
  teacher_ids: string[];
}

function mapBackendCourse(c: BackendCourse): Course {
  return {
    id: c.courseId,
    code: c.code ?? "",
    title: c.name,
    groupIds: c.groupIds ?? [],
    teacherId: c.teacherIds && c.teacherIds.length > 0 ? c.teacherIds[0] : null,
    duration: c.duration,
  };
}

export async function fetchCoursesApi(): Promise<Course[]> {
  const data = await api.get<CoursesListResponse>("/courses/");
  return data.courses.map(mapBackendCourse);
}

export async function createCourseApi(payload: CourseWritePayload): Promise<Course> {
  const created = await api.post<BackendCourse>("/courses/", payload);
  return mapBackendCourse(created);
}

export async function updateCourseApi(
  courseId: string,
  payload: CourseWritePayload,
): Promise<Course> {
  const updated = await api.put<BackendCourse>(`/courses/${courseId}`, payload);
  return mapBackendCourse(updated);
}

export async function deleteCourseApi(courseId: string): Promise<void> {
  await api.delete<void>(`/courses/${courseId}`);
}
