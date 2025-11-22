// src/components/ClassroomData.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, Users, BookOpen, FileText, CheckCircle } from 'lucide-react';
import { getUserCourses, checkClassroomAuth, getReauthorizationUrl } from '@/lib/classroomApi';
import type { ClassroomCourse } from '@/types/classroom';

interface ClassroomDataProps {
  userRole?: 'student' | 'teacher' | 'admin';
}

const ClassroomData: React.FC<ClassroomDataProps> = () => {
  const [courses, setCourses] = useState<ClassroomCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<{ authorized: boolean; scopes: string[] } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchClassroomData = async () => {
    try {
      setError('');
      
      // Перевіряємо статус авторизації
      const status = await checkClassroomAuth();
      setAuthStatus(status);

      if (!status.authorized) {
        setError('Необхідна авторизація Google Classroom');
        return;
      }

      // Завантажуємо курси
      const coursesData = await getUserCourses();
      setCourses(coursesData);

    } catch (err) {
      console.error('Error fetching classroom data:', err);
      setError(err instanceof Error ? err.message : 'Помилка завантаження даних Classroom');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchClassroomData();
  };

  const handleReauthorize = async () => {
    try {
      const authUrl = await getReauthorizationUrl();
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error getting reauthorization URL:', err);
      setError('Помилка отримання URL авторизації');
    }
  };

  useEffect(() => {
    fetchClassroomData();
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Завантаження даних Google Classroom...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          {!authStatus?.authorized && (
            <div className="mt-4 text-center">
              <Button onClick={handleReauthorize}>
                Авторизувати Google Classroom
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium">
            Google Classroom
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {authStatus && (
            <div className="mb-4 flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">
                Підключено до Google Classroom
              </span>
              <Badge variant="outline" className="text-xs">
                {authStatus.scopes.length} дозволів
              </Badge>
            </div>
          )}
          
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Курси не знайдено
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <Card key={course.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-medium line-clamp-2">{course.name}</h3>
                      {course.section && (
                        <p className="text-sm text-muted-foreground">{course.section}</p>
                      )}
                      {course.room && (
                        <p className="text-xs text-muted-foreground">Аудиторія: {course.room}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={course.courseState === 'ACTIVE' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {course.courseState === 'ACTIVE' ? 'Активний' : 'Архівний'}
                        </Badge>
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>Курс</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Статистика */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-xs text-muted-foreground">Всього курсів</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter(c => c.courseState === 'ACTIVE').length}
                </p>
                <p className="text-xs text-muted-foreground">Активних курсів</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {courses.filter(c => c.courseState === 'ARCHIVED').length}
                </p>
                <p className="text-xs text-muted-foreground">Архівних курсів</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ClassroomData;