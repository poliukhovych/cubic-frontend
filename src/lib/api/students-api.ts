// src/lib/api/students-api.ts
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

export interface Student {
  studentId: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  status: string;
  groupId: string | null;
  userId: string | null;
  fullName: string;
}

/**
 * Отримати розклад студента за student_id
 * GET /api/students/{student_id}/schedule?schedule_id={schedule_id}
 */
export async function getStudentSchedule(
  studentId: string,
  scheduleId?: string
): Promise<Assignment[]> {
  const params = scheduleId ? `?schedule_id=${scheduleId}` : "";
  return api.get<Assignment[]>(`/students/${studentId}/schedule${params}`);
}
