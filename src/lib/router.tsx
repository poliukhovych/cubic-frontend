import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterStudent from "@/pages/RegisterStudent";
import RegisterTeacher from "@/pages/RegisterTeacher";
import OAuthCallback from "@/pages/OAuthCallback";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import RequireAnon from "@/components/RequireAnon";
import AuthProcessing from "@/pages/AuthProcessing";
import AuthCallback from "@/pages/AuthCallback";
import CompleteProfile from "@/pages/CompleteProfile";
import RoleSelectionPage from "@/pages/RoleSelectionPage";
import PendingApproval from "@/pages/PendingApproval";

import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentSchedule from "@/pages/student/StudentSchedule";
import StudentHomework from "@/pages/student/StudentHomework";
import StudentGrades from "@/pages/student/StudentGrades"; 

import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherSchedule from "@/pages/teacher/TeacherSchedule";
import TeacherStudents from "@/pages/teacher/TeacherStudents";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminTeachers from "@/pages/admin/AdminTeachers";
import AdminSchedule from "@/pages/admin/AdminSchedule";
import AdminLogs from "@/pages/admin/AdminLogs";
import AdminArchive from "@/pages/admin/AdminArchive";
import AdminCourses from "@/pages/admin/AdminCourses";
import AdminArchiveView from "@/pages/admin/AdminArchiveView";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminRegistrations from "@/pages/admin/AdminRegistrations";

import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import AdminStudents from "@/pages/admin/AdminStudents";
import StudentSubject from "@/pages/student/StudentSubject";
import TeacherSubject from "@/pages/teacher/TeacherSubject";

export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Layout />,
      children: [
        { index: true, element: <Home /> },
        { path: "login", element: <RequireAnon><Login /></RequireAnon> },
        { path: "register", element: <RequireAnon><Register /></RequireAnon> },
        { path: "register/student", element: <RequireAnon><RegisterStudent /></RequireAnon> },
        { path: "register/teacher", element: <RequireAnon><RegisterTeacher /></RequireAnon> },
        { path: "auth/callback/register/student", element: <OAuthCallback /> },
        { path: "auth/callback/register/teacher", element: <OAuthCallback /> },
        { path: "auth/callback/login", element: <OAuthCallback /> },
        { path: "auth/processing", element: <AuthProcessing /> },
        { path: "auth/callback", element: <AuthCallback /> },
        { path: "complete-profile", element: <CompleteProfile /> },
        { path: "role-selection", element: <RoleSelectionPage /> },
        { path: "pending-approval", element: <PendingApproval /> },

        // Public admin login page
        { path: "admin/login", element: <RequireAnon><AdminLogin /></RequireAnon> },

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
            { path: "grades", element: <StudentGrades /> },
            { path: "subject/:subjectId", element: <StudentSubject /> },
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
            { path: "subject/:subjectId", element: <TeacherSubject /> },
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
            { path: "registrations", element: <AdminRegistrations /> },
            { path: "students", element: <AdminStudents /> },
            { path: "teachers", element: <AdminTeachers /> },
            { path: "courses", element: <AdminCourses /> },
            { path: "schedule", element: <AdminSchedule /> },
            { path: "logs", element: <AdminLogs /> },
            { path: "archive", element: <AdminArchive /> },
            { path: "archive/:id", element: <AdminArchiveView /> },
          ]
        },

        { path: "*", element: <Navigate to="/" replace /> },
      ],
    },
  ]
);
