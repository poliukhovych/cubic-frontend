//src/components/DashboardTiles.tsx
//import React from "react";
import Tile from "./Tile";
import { Calendar, BookOpen, Users, CheckCircle} from "lucide-react";


export const StudentTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/student/schedule" title="Мій розклад" icon={<Calendar className="h-8 w-8 text-primary hover-lift" strokeWidth={1.75} />} subtitle="Пари, час, аудиторії" />
    <Tile to="/student/homework" title="Домашні завдання" icon={<BookOpen className="h-8 w-8 text-primary hover-lift" strokeWidth={1.75} />} subtitle="Задачі та дедлайни" />
    <Tile to="/student/grades" title="Оцінки" icon={<CheckCircle className="h-8 w-8 text-primary hover-lift" strokeWidth={1.75} />} subtitle="Список оцінок і суми" />
  </div>
);
export const TeacherTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/teacher/schedule" title="Мій розклад" icon={<Calendar className="h-8 w-8 text-primary hover-lift" strokeWidth={1.75} />} subtitle="Пари, групи, час, аудиторії"/>
    <Tile to="/teacher/students" title="Студенти" icon={<Users className="h-8 w-8 text-primary hover-lift" />} subtitle="Групи, студенти"/>
  </div>
);

