// src/lib/api/schedule-api.ts

import { api } from "@/lib/api";

// ===== Типи для генерації розкладу =====

export interface SoftWeights {
  daily_load_balance: number;
  windows_penalty: number;
  teacher_avoid_slots_penalty: number;
  teacher_preferred_days_penalty: number;
}

export interface SchedulePolicy {
  soft_weights: SoftWeights;
}

export interface ScheduleParams {
  timeLimitSec: number;
}

export interface GenerateSchedulePayload {
  policy: SchedulePolicy;
  params: ScheduleParams;
  schedule_label: string;
}

// ===== Типи відповіді бекенду =====

export interface AssignmentResponse {
  id: string;
  scheduleId: string;
  courseId: string;
  courseName?: string;
  teacherId: string;
  teacherName?: string;
  groupId: string;
  groupName?: string;
  roomId: string;
  roomName?: string;
  timeslotId: number;
  subgroupNo: number;
  courseType: string;
}

export interface ScheduleResponse {
  schedule_id: string;
  label: string;
  created_at: string;
  updated_at: string;
}

export interface GenerateScheduleResponse {
  message: string;
  schedule: Array<{
    timeslotId: number;
    groupId: string;
    subgroupNo: number;
    courseId: string;
    teacherId: string;
    roomId: string;
    courseType: string;
    scheduleId: string;
    assignmentId: string;
  }>;
}

// ===== API функції =====

/**
 * Генерація розкладу через POST /api/schedules/generate
 * Приймає policy, params, schedule_label
 * Повертає schedule + assignments
 */
export async function generateScheduleApi(
  payload: GenerateSchedulePayload
): Promise<GenerateScheduleResponse> {
  return await api.post<GenerateScheduleResponse>(
    "/api/schedules/generate",
    payload
  );
}

/**
 * Отримати список усіх розкладів
 */
export async function fetchSchedulesApi(): Promise<ScheduleResponse[]> {
  const response = await api.get<{ schedules: ScheduleResponse[] }>(
    "/api/schedules/"
  );
  return response.schedules || [];
}

/**
 * Видалити розклад
 */
export async function deleteScheduleApi(scheduleId: string): Promise<void> {
  await api.delete(`/api/schedules/${scheduleId}`);
}

// ===== Legacy типи (для сумісності зі старим кодом) =====

export type ScheduleStatus = "pending" | "generated" | "failed" | "archived";

export interface ScheduleListItemDto {
  id: string;
  name: string;
  semester?: string | null;
  isActive: boolean;
  status: ScheduleStatus;
  version?: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleListResponseDto {
  items: ScheduleListItemDto[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ScheduleGenerationRequestDto {
  name: string;
  semester?: string;
  facultyId?: string;
  startDate?: string;
  endDate?: string;
  maxLessonsPerDay?: number;
  respectPreferences?: boolean;
}

export interface ScheduleGenerationResponseDto {
  scheduleId: string;
  status: ScheduleStatus;
  message?: string | null;
}

// Legacy функція (deprecated, використовується старим кодом)
export async function generateSchedule(
  payload: ScheduleGenerationRequestDto,
  opts?: { async?: boolean }
): Promise<ScheduleGenerationResponseDto> {
  const query = opts?.async === false ? "?async=false" : "";
  return await api.post(`/api/schedules/generate${query}`, payload);
}


export interface TimeslotInfo {
  id: number;
  weekday: 1 | 2 | 3 | 4 | 5;
  pair: 1 | 2 | 3 | 4;
  parity: "any" | "even" | "odd";
  time: { start: string; end: string };
}

export async function fetchTimeslotsMapApi(): Promise<TimeslotInfo[]> {
  const response = await api.get<{ timeslots: TimeslotInfo[] }>(
    "/api/timeslots/"
  );
  return response.timeslots || [];
}

/**
 * Отримати активний розклад з усіма деталями
 * (assignments + інформація для маппінгу)
 */
export interface ScheduleWithDetailsResponse {
  message: string;
  schedule: ScheduleResponse;
  assignments: Array<{
    timeslotId: number;
    groupId: string;
    subgroupNo: number;
    courseId: string;
    teacherId: string;
    roomId: string;
    courseType: string;
    scheduleId: string;
    assignmentId: string;
  }>;
}

export async function fetchActiveScheduleApi(): Promise<ScheduleWithDetailsResponse> {
  return await api.get("/api/schedules/active");
}

/**
 * Альтернатива: отримати розклад за ID
 */
export async function fetchScheduleDetailsApi(
  scheduleId: string
): Promise<ScheduleWithDetailsResponse> {
  return await api.get(`/api/schedules/${scheduleId}/details`);
}