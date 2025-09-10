// src/lib/router.tsx
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import RequireAnon from "@/components/RequireAnon";
import AuthProcessing from "@/pages/AuthProcessing";
import CompleteProfile from "@/pages/CompleteProfile";


import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentSchedule from "@/pages/student/StudentSchedule";
import StudentHomework from "@/pages/student/StudentHomework";


import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherSchedule from "@/pages/teacher/TeacherSchedule";
import TeacherStudents from "@/pages/teacher/TeacherStudents";


import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTeachers from "@/pages/admin/AdminTeachers";
import AdminSchedule from "@/pages/admin/AdminSchedule";
import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";


export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <RequireAnon><Login /></RequireAnon> },
        { path: "register", element: <RequireAnon><Register /></RequireAnon> },
        { path: "auth/processing", element: <AuthProcessing /> },
        { path: "complete-profile", element: <CompleteProfile /> },


        {
          path: "student",
          element: (
            <ProtectedRoute>
              <RoleGuard allow={["student"]} />
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <StudentDashboard /> },
            { path: "schedule", element: <StudentSchedule /> },
            { path: "homework", element: <StudentHomework /> },
          ],
        },


        {
          path: "teacher",
          element: (
            <ProtectedRoute>
              <RoleGuard allow={["teacher"]} />
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <TeacherDashboard /> },
            { path: "schedule", element: <TeacherSchedule /> },
            { path: "students", element: <TeacherStudents /> },
          ],
        },


        {
          path: "admin",
          element: (
            <ProtectedRoute>
              <RoleGuard allow={["admin"]} />
            </ProtectedRoute>
          ),
          children: [
            { index: true, element: <Navigate to="dashboard" replace /> },
            { path: "dashboard", element: <AdminDashboard /> },
            { path: "teachers", element: <AdminTeachers /> },
            { path: "schedule", element: <AdminSchedule /> },
          ],
        },


        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL }
);