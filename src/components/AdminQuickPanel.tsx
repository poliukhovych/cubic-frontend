import React, { useEffect, useState } from "react";
import { fetchAdminStats, pushAdminChange } from "@/lib/fakeApi/admin";
import { Users, BookOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ViewModeToggle from "./ViewModeToggle";
import { useAuth } from "@/types/auth";
import { getViewMode, setViewMode, type ViewMode } from "@/lib/utils/prefs";
import Toast from "@/components/Toast";

type Stats = { students: number; teachers: number; courses: number; };

const StatTile: React.FC<{
  to: string;
  title: string;
  count?: number;
  subtitle?: string;
  icon?: React.ReactNode;
}> = ({ to, title, count, subtitle, icon }) => (
  <Link to={to} className="glasscard p-5 hover-lift pressable">
    <div className="flex items-start justify-between">
      <div className="text-3xl mb-2">{icon ?? "📊"}</div>
      {typeof count === "number" && (
        <div className="text-4xl font-semibold leading-none">{count}</div>
      )}
    </div>
    <div className="font-semibold text-lg">{title}</div>
    {subtitle && (
      <div className="text-sm text-[var(--muted)] mt-1">{subtitle}</div>
    )}
  </Link>
);

const AdminQuickPanel: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const nav = useNavigate();
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [mode, setMode] = useState<ViewMode>(() =>
    uid ? getViewMode(uid) : "view"
  );
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);
  useEffect(() => {
    if (uid) setMode(getViewMode(uid));
  }, [uid]);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1000);
  };

  const onModeChange = (m: ViewMode) => {
    setMode(m);
    if (uid) setViewMode(uid, m);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {!isMobile && (
          <ViewModeToggle value={mode} onChange={onModeChange} />
        )}
        <StatTile
          to="/admin/students"
          title="Студенти"
          subtitle="Перегляд / керування"
          count={stats?.students}
          icon={<Users className="h-8 w-8 text-primary" />}
        />
        <StatTile
          to="/admin/teachers"
          title="Викладачі"
          subtitle="Список і розклади"
          count={stats?.teachers}
          icon={<Users className="h-8 w-8 text-primary" />}
        />
        <StatTile
          to="/admin/courses"
          title="Курси"
          subtitle="Предмети та групи"
          count={stats?.courses}
          icon={<BookOpen className="h-8 w-8 text-primary" />}
        />
      </div>

      {/* Нижній блок дій під плитками */}
      {!isMobile && (
        <div className="mt-4">
          {mode === "view" ? (
            <button
              className="btn w-full py-3 rounded-2xl hover-shadow"
              onClick={() => {
                /* TODO: export */
              }}
            >
              Export to PDF
            </button>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3">
              <button
                className="btn py-3 rounded-2xl hover-shadow"
                onClick={async () => {
                  await pushAdminChange({
                    entity: "schedule",
                    action: "updated",
                    title: "Швидке редагування розкладу (solve)",
                    actor: "Admin",
                  });
                  flash("solve is done");
                }}
              >
                solve
              </button>

              <button
                className="btn py-3 rounded-2xl hover-shadow"
                onClick={() => flash("optimize is done")}
              >
                optimize
              </button>
              <button
                className="btn py-3 rounded-2xl hover-shadow"
                onClick={() => nav("/admin/logs")}
              >
                logs
              </button>
            </div>
          )}
        </div>
      )}

      <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default AdminQuickPanel;
