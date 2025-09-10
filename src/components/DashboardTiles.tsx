//src/components/DashboardTiles.tsx
//import React from "react";
import Tile from "./Tile";
import { Calendar, BookOpen, Users } from "lucide-react"; 

export const StudentTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/student/schedule" title="Мій розклад" icon={<Calendar className="h-8 w-8 text-primary" strokeWidth={1.75} />} subtitle="Пара/непара, час, аудиторії" />
    <Tile to="/student/homework" title="Домашні завдання" icon={<BookOpen className="h-8 w-8 text-primary" strokeWidth={1.75} />} subtitle="Задачі та дедлайни" />
  </div>
);

export const TeacherTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/teacher/schedule" title="Мій розклад" icon={<Calendar className="h-8 w-8 text-primary" strokeWidth={1.75} />} />
    <Tile to="/teacher/students" title="Студенти" icon={<Users className="h-8 w-8 text-primary" />} />
  </div>
);

export const AdminTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/admin/teachers" title="Викладачі" icon={<Users className="h-8 w-8 text-primary" />} />
    <Tile to="/admin/schedule" title="Загальний розклад" icon={<Calendar className="h-8 w-8 text-primary" strokeWidth={1.75} />} />
  </div>
);
