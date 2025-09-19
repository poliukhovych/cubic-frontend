import React, { useEffect, useState } from "react";
import AdminQuickPanel from "@/components/AdminQuickPanel";
import FacultyScheduleTable from "@/components/FacultyScheduleTable";
import { useAuth } from "@/types/auth";
import { getViewMode, setViewMode, type ViewMode } from "@/lib/utils/prefs";

const AdminDashboard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const [mode, setMode] = useState<ViewMode>(() =>
    uid ? getViewMode(uid) : "view"
  );

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
      <div className="text-2xl font-semibold">Адмін панель</div>
      <AdminQuickPanel value={mode} onChange={onModeChange} />

      {isMobile ? (
        <div className="glasscard p-6 text-center space-y-3">
          <div className="text-lg font-semibold">
            Розклад недоступний на мобільних пристроях
          </div>
          <div className="text-sm text-[var(--muted)] ">
            Будь ласка, відкрийте цю сторінку з комп’ютера або скористайтесь
            експортом у PDF.
          </div>
          <button className="btn py-2 px-4 rounded-xl hover-lift">
            Експорт у PDF
          </button>
        </div>
      ) : (
        <div
          className="
    relative left-1/2 -translate-x-1/2
    w-[99vw]
    px-4 sm:px-6 lg:px-8
  "
        >
          <div ref={tableRef}>
            <FacultyScheduleTable editable={mode !== "view"} />
          </div>
          <div className="mt-3 flex justify-end">
            {/* <button
              className="btn px-4 py-2 rounded-xl"
              onClick={() =>
                tableRef.current &&
                exportSchedulePdf(
                  tableRef.current,
                  "faculty-schedule.pdf",
                  "Розклад факультету"
                )
              }
            >
              Експорт у PDF
            </button> */}
          </div>
        </div>
      )}

      {/* <AdminHistoryPanel /> */}
    </div>
  );
};

export default AdminDashboard;
