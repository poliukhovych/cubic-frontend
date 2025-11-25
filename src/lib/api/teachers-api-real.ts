// src/lib/api/teachers-api-real.ts
import { api } from "@/lib/api";

export interface Assignment {
  assignmentId: string;
  scheduleId: string;
  timeslotId: number;
  groupId: string;
  subgroupNo: number;
  courseId: string;
  teacherId: string;
  roomId: string | null;
  courseType: "lec" | "prac" | "lab";
  roomName: string | null;
}

export interface Teacher {
  teacherId: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  status: string;
  userId: string | null;
  fullName: string;
}

export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  status: string;
  groupId: string | null;
  userId: string | null;
  fullName?: string;
  full_name?: string; // Backend returns snake_case
}

export interface Course {
  courseId: string;
  courseName: string;
  courseCode: string | null;
}

export interface Group {
  groupId: string;
  groupName: string;
  level: number;
  speciality: string;
}

/**
 * Отримати розклад викладача за teacher_id
 * GET /api/teachers/{teacher_id}/schedule?schedule_id={schedule_id}
 */
export async function getTeacherSchedule(
  teacherId: string,
  scheduleId?: string
): Promise<Assignment[]> {
  const params = scheduleId ? `?schedule_id=${scheduleId}` : "";
  return api.get<Assignment[]>(`/teachers/${teacherId}/schedule${params}`);
}

/**
 * Отримати інформацію про викладача за teacher_id
 * GET /api/teachers/{teacher_id}
 */
export async function getTeacherById(teacherId: string): Promise<Teacher> {
  return api.get<Teacher>(`/teachers/${teacherId}`);
}

/**
 * Отримати інформацію про викладача за user_id
 * GET /api/teachers/user/{user_id}
 */
export async function getTeacherByUserId(userId: string): Promise<Teacher> {
  return api.get<Teacher>(`/teachers/user/${userId}`);
}

/**
 * Отримати список студентів викладача
 * GET /api/teachers/{teacher_id}/students
 */
export async function getTeacherStudents(teacherId: string): Promise<Student[]> {
  return api.get<Student[]>(`/teachers/${teacherId}/students`);
}

/**
 * Отримати список курсів викладача
 * GET /api/teachers/{teacher_id}/courses
 */
export async function getTeacherCourses(teacherId: string): Promise<Course[]> {
  return api.get<Course[]>(`/teachers/${teacherId}/courses`);
}

/**
 * Отримати список груп викладача
 * GET /api/teachers/{teacher_id}/groups
 */
export async function getTeacherGroups(teacherId: string): Promise<Group[]> {
  return api.get<Group[]>(`/teachers/${teacherId}/groups`);
}
