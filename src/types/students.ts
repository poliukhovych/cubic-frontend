import type { Id } from "./common";

export type Student = {
  id: Id;
  name: string;
  email: string;
  groupId: Id;
  
  /**
   * @deprecated Глобальна підгрупа буде замінена на контекстну (прив'язана до курсу).
   * Використовуй CourseStudentSubgroup замість цього поля.
   * Поле залишено для зворотної сумісності з існуючими даними.
   */
  subgroup?: string | null;
  
  status: 'pending' | 'active' | 'inactive';
};

export type Group = {
  id: Id;
  name: string;
  type: 'bachelor' | 'master';
  course: number; // 1-6
  size?: number;
};

export type GroupCreateRequest = {
  name: string;
  type: 'bachelor' | 'master';
  course: number;
};

export type GroupUpdateRequest = {
  name?: string;
  type?: 'bachelor' | 'master';
  course?: number;
};

export type StudentUpdateRequest = {
  fullName?: string;
  groupId?: string;
  status?: 'pending' | 'active' | 'inactive';
};

/**
 * Майбутня структура для прив'язки студента до підгрупи конкретного курсу
 * TODO: Реалізувати після готовності backend
 */
export type CourseStudentSubgroup = {
  courseId: Id;
  studentId: Id;
  subgroup: 'a' | 'b';
};
