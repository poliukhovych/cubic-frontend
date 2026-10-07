// src/lib/classroomApi.ts
import { api } from './api';
import type { ClassroomCourse, ClassroomStudent, ClassroomTeacher, ClassroomCoursework, ClassroomSubmission } from '@/types/classroom';

// Отримуємо список курсів користувача
export const getUserCourses = async (): Promise<ClassroomCourse[]> => {
  try {
    const response = await api.get<{ courses: ClassroomCourse[] }>('/classroom/courses');
    return response.courses || [];
  } catch (error) {
    console.error('Error fetching courses:', error);
    throw error;
  }
};

// Отримуємо список студентів конкретного курсу
export const getCourseStudents = async (courseId: string): Promise<ClassroomStudent[]> => {
  try {
    const response = await api.get<{ students: ClassroomStudent[] }>(`/classroom/courses/${courseId}/students`);
    return response.students || [];
  } catch (error) {
    console.error('Error fetching course students:', error);
    throw error;
  }
};

// Отримуємо список викладачів конкретного курсу
export const getCourseTeachers = async (courseId: string): Promise<ClassroomTeacher[]> => {
  try {
    const response = await api.get<{ teachers: ClassroomTeacher[] }>(`/classroom/courses/${courseId}/teachers`);
    return response.teachers || [];
  } catch (error) {
    console.error('Error fetching course teachers:', error);
    throw error;
  }
};

// Отримуємо список завдань конкретного курсу
export const getCourseWork = async (courseId: string): Promise<ClassroomCoursework[]> => {
  try {
    const response = await api.get<{ courseWork: ClassroomCoursework[] }>(`/classroom/courses/${courseId}/coursework`);
    return response.courseWork || [];
  } catch (error) {
    console.error('Error fetching coursework:', error);
    throw error;
  }
};

// Отримуємо подання завдань
export const getSubmissions = async (courseId: string, courseWorkId: string): Promise<ClassroomSubmission[]> => {
  try {
    const response = await api.get<{ studentSubmissions: ClassroomSubmission[] }>(
      `/classroom/courses/${courseId}/coursework/${courseWorkId}/submissions`
    );
    return response.studentSubmissions || [];
  } catch (error) {
    console.error('Error fetching submissions:', error);
    throw error;
  }
};

// Отримуємо подання студента для конкретного завдання
export const getStudentSubmission = async (
  courseId: string, 
  courseWorkId: string, 
  userId: string
): Promise<ClassroomSubmission | null> => {
  try {
    const response = await api.get<ClassroomSubmission>(
      `/classroom/courses/${courseId}/coursework/${courseWorkId}/submissions/${userId}`
    );
    return response;
  } catch (error) {
    console.error('Error fetching student submission:', error);
    throw error;
  }
};

// Оновлюємо оцінку подання
export const updateSubmissionGrade = async (
  courseId: string,
  courseWorkId: string,
  submissionId: string,
  grade: number
): Promise<ClassroomSubmission> => {
  try {
    const response = await api.patch<ClassroomSubmission>(
      `/classroom/courses/${courseId}/coursework/${courseWorkId}/submissions/${submissionId}`,
      { assignedGrade: grade }
    );
    return response;
  } catch (error) {
    console.error('Error updating submission grade:', error);
    throw error;
  }
};

// Повертаємо подання студенту
export const returnSubmission = async (
  courseId: string,
  courseWorkId: string,
  submissionId: string
): Promise<void> => {
  try {
    await api.post(
      `/classroom/courses/${courseId}/coursework/${courseWorkId}/submissions/${submissionId}:return`
    );
  } catch (error) {
    console.error('Error returning submission:', error);
    throw error;
  }
};

// Створюємо нове завдання
export const createCourseWork = async (
  courseId: string,
  coursework: Partial<ClassroomCoursework>
): Promise<ClassroomCoursework> => {
  try {
    const response = await api.post<ClassroomCoursework>(
      `/classroom/courses/${courseId}/coursework`,
      coursework
    );
    return response;
  } catch (error) {
    console.error('Error creating coursework:', error);
    throw error;
  }
};

// Оновлюємо існуюче завдання
export const updateCourseWork = async (
  courseId: string,
  courseWorkId: string,
  coursework: Partial<ClassroomCoursework>
): Promise<ClassroomCoursework> => {
  try {
    const response = await api.patch<ClassroomCoursework>(
      `/classroom/courses/${courseId}/coursework/${courseWorkId}`,
      coursework
    );
    return response;
  } catch (error) {
    console.error('Error updating coursework:', error);
    throw error;
  }
};

// Видаляємо завдання
export const deleteCourseWork = async (courseId: string, courseWorkId: string): Promise<void> => {
  try {
    await api.delete(`/classroom/courses/${courseId}/coursework/${courseWorkId}`);
  } catch (error) {
    console.error('Error deleting coursework:', error);
    throw error;
  }
};

// Перевіряємо статус авторизації Google Classroom
export const checkClassroomAuth = async (): Promise<{ authorized: boolean; scopes: string[] }> => {
  try {
    const response = await api.get<{ authorized: boolean; scopes: string[] }>('/classroom/auth/status');
    return response;
  } catch (error) {
    console.error('Error checking classroom auth:', error);
    throw error;
  }
};

// Отримуємо URL для повторної авторизації з додатковими скоупами
export const getReauthorizationUrl = async (additionalScopes: string[] = []): Promise<string> => {
  try {
    const response = await api.post<{ authUrl: string }>('/classroom/auth/reauthorize', {
      additionalScopes
    });
    return response.authUrl;
  } catch (error) {
    console.error('Error getting reauthorization URL:', error);
    throw error;
  }
};