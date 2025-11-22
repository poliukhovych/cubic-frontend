// src/lib/hooks/useClassroom.ts
import { useState, useEffect, useCallback } from 'react';
import {
  getUserCourses,
  getCourseStudents,
  getCourseTeachers,
  getCourseWork,
  getSubmissions,
  checkClassroomAuth
} from '@/lib/classroomApi';
import type { ClassroomCourse, ClassroomStudent, ClassroomTeacher, ClassroomCoursework, ClassroomSubmission } from '@/types/classroom';

interface UseClassroomResult {
  courses: ClassroomCourse[];
  authStatus: { authorized: boolean; scopes: string[] } | null;
  loading: boolean;
  error: string | null;
  refreshCourses: () => Promise<void>;
  getCourseData: (courseId: string) => Promise<{
    students: ClassroomStudent[];
    teachers: ClassroomTeacher[];
    coursework: ClassroomCoursework[];
  }>;
  getCourseworkSubmissions: (courseId: string, courseWorkId: string) => Promise<ClassroomSubmission[]>;
}

export const useClassroom = (): UseClassroomResult => {
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [authStatus, setAuthStatus] = useState<{ authorized: boolean; scopes: string[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      const status = await checkClassroomAuth();
      setAuthStatus(status);
      return status.authorized;
    } catch (err) {
      console.error('Error checking auth:', err);
      setError(err instanceof Error ? err.message : 'Auth check failed');
      return false;
    }
  }, []);

  const refreshCourses = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const isAuthorized = await checkAuth();
      if (!isAuthorized) {
        setError('Не авторизовано в Google Classroom');
        return;
      }

      const coursesData = await getUserCourses();
      setCourses(coursesData);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  const getCourseData = useCallback(async (courseId: string) => {
    const [students, teachers, coursework] = await Promise.all([
      getCourseStudents(courseId),
      getCourseTeachers(courseId),
      getCourseWork(courseId)
    ]);

    return { students, teachers, coursework };
  }, []);

  const getCourseworkSubmissions = useCallback(async (courseId: string, courseWorkId: string) => {
    return await getSubmissions(courseId, courseWorkId);
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  return {
    courses,
    authStatus,
    loading,
    error,
    refreshCourses,
    getCourseData,
    getCourseworkSubmissions
  };
};