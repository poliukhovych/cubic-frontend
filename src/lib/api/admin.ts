// src/lib/api/admin.ts
import { getAuthHeader } from "@/lib/auth";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// ============ ІСНУЮЧІ ТИПИ (БЕЗ ЗМІН) ============
export type AdminStats = {
  students_total: number;
  students_confirmed: number;
  teachers_total: number;
  teachers_confirmed: number;
  courses_total: number;
};

export async function fetchAdminStats(): Promise<AdminStats> {
  const res = await fetch(`${API_BASE_URL}/api/admin/stats`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to load admin stats: ${res.status}`);
  return res.json();
}

export type AdminStudent = {
  student_id: string;
  studentId: string; // camelCase from backend
  firstName: string; // camelCase from backend
  lastName: string; // camelCase from backend
  first_name: string; // snake_case for backwards compatibility
  last_name: string; // snake_case for backwards compatibility
  patronymic?: string | null;
  confirmed?: boolean;
  email?: string | null;
  groupId?: string;
  status?: 'pending' | 'active' | 'inactive';
};

export async function fetchAdminStudentsPaged(offset = 0, limit = 50): Promise<{ students: AdminStudent[]; total: number; }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/students?offset=${offset}&limit=${limit}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to load students: ${res.status}`);
  return res.json();
}

export type AdminTeacher = {
  teacher_id: string;
  first_name: string;
  last_name: string;
  patronymic?: string | null;
  confirmed: boolean;
  email?: string | null;
};

export async function fetchAdminTeachersPaged(offset = 0, limit = 50): Promise<{ teachers: AdminTeacher[]; total: number; }> {
  const res = await fetch(`${API_BASE_URL}/api/admin/teachers?offset=${offset}&limit=${limit}`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to load teachers: ${res.status}`);
  return res.json();
}

// ============ НОВІ ФУНКЦІЇ ДЛЯ ГРУП ============
export type AdminGroup = {
  id: string;
  name: string;
  type: 'bachelor' | 'master';
  course: number;
};

export async function fetchAdminGroups(): Promise<AdminGroup[]> {
  const res = await fetch(`${API_BASE_URL}/api/groups`, {
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to load groups: ${res.status}`);
  return res.json();
}

export async function createGroup(data: { name: string; type: 'bachelor' | 'master'; course: number }): Promise<AdminGroup> {
  const res = await fetch(`${API_BASE_URL}/api/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create group: ${res.status}`);
  return res.json();
}

export async function updateGroup(id: string, data: Partial<{ name: string; type: 'bachelor' | 'master'; course: number }>): Promise<AdminGroup> {
  const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update group: ${res.status}`);
  return res.json();
}

export async function deleteGroup(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/groups/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to delete group: ${res.status}`);
}

// ============ НОВІ ФУНКЦІЇ ДЛЯ СТУДЕНТІВ ============
export async function updateStudent(id: string, data: Partial<{ fullName: string; groupId: string; status: string }>): Promise<AdminStudent> {
  // Parse fullName into lastName, firstName, patronymic
  const payload: any = {};
  
  if (data.fullName) {
    const parts = data.fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      payload.last_name = parts[0];
      payload.first_name = parts[1];
      if (parts.length > 2) {
        payload.patronymic = parts.slice(2).join(" ");
      }
    }
  }
  
  if (data.groupId) {
    payload.group_id = data.groupId;
  }
  
  if (data.status) {
    payload.status = data.status;
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/students/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`Failed to update student: ${res.status}`);
  return res.json();
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/admin/students/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
  });
  if (!res.ok) throw new Error(`Failed to delete student: ${res.status}`);
}
