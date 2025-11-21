// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import AdminQuickPanel from "@/components/AdminQuickPanel";
import FacultyScheduleTable from "@/components/FacultyScheduleTable";
import { useAuth } from "@/types/auth";
import { getViewMode, setViewMode, type ViewMode } from "@/lib/utils/prefs";
import Reveal from "@/components/Reveal";
import Crossfade from "@/components/Crossfade";

const AdminDashboard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [mode, setMode] = useState<ViewMode>(() => (uid ? getViewMode(uid) : "view"));

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (uid) setMode(getViewMode(uid));
  }, [uid]);

  const onModeChange = (m: ViewMode) => {
    setMode(m);
    if (uid) setViewMode(uid, m);
  };

  const tableRef = React.useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-6">
      <Reveal className="text-2xl font-semibold" delayMs={80} y={8} opacityFrom={1}>
        Адмін панель
      </Reveal>

      <Reveal delayMs={100} y={6} opacityFrom={1}>
        <AdminQuickPanel value={mode} onChange={onModeChange} />
      </Reveal>

      <Crossfade stateKey={isMobile ? "mobile" : "desktop"}>
        {isMobile ? (
          <Reveal className="glasscard p-6 text-center space-y-3" y={8} opacityFrom={1}>
            <div className="text-lg font-semibold">Розклад недоступний на мобільних пристроях</div>
            <div className="text-sm text-[var(--muted)] ">
              Будь ласка, відкрийте цю сторінку з комп’ютера або скористайтесь експортом у PDF.
            </div>
            <button className="btn py-2 px-4 rounded-xl hover-lift">Експорт у PDF</button>
          </Reveal>
        ) : (
          <Reveal
            className="relative left-1/2 -translate-x-1/2 w-[99vw] px-4 sm:px-6 lg:px-8"
            y={8}
            opacityFrom={1}
          >
            <div ref={tableRef}>
              <FacultyScheduleTable editable={mode !== "view"} />
            </div>
            <div className="mt-3 flex justify-end">{/* PDF export button (optional) */}</div>
          </Reveal>
        )}
      </Crossfade>
    </div>
  );
};

export default AdminDashboard;
