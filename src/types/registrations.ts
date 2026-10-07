import type { Id } from "./common";

/**
 * Тип заявки на реєстрацію (студент або викладач)
 */
export type RegistrationRequest = {
  id: Id;
  email: string;
  fullName: string;
  role: 'student' | 'teacher';
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string; // ISO date string
  
  // Для студентів
  groupId?: Id;
  groupName?: string;
  
  // Для викладачів
  subjects?: string[];
};

/**
 * Request для оновлення заявки перед approve
 */
export type RegistrationUpdateRequest = {
  fullName?: string;
  email?: string;
  groupId?: Id; // Тільки для студентів
  subjects?: string[]; // Тільки для викладачів
};

/**
 * Response після approve/reject
 */
export type RegistrationActionResponse = {
  success: boolean;
  message: string;
};
