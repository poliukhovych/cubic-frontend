//src/components/DashboardTiles.tsx
//import React from "react";
import Tile from "./Tile";

export const StudentTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/student/schedule" title="Мій розклад" icon={"🗓️"} subtitle="Пара/непара, час, аудиторії" />
    <Tile to="/student/homework" title="Домашні завдання" icon={"📚"} subtitle="Задачі та дедлайни" />
  </div>
);

export const TeacherTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/teacher/schedule" title="Мій розклад" icon={"🗓️"} />
    <Tile to="/teacher/students" title="Студенти" icon={"👥"} />
  </div>
);

export const AdminTiles = () => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <Tile to="/admin/teachers" title="Викладачі" icon={"👨‍🏫"} />
    <Tile to="/admin/schedule" title="Загальний розклад" icon={"📅"} />
  </div>
);
