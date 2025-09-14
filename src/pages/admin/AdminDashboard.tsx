// src/pages/admin/AdminDashboard.tsx
import React, { useEffect, useState } from "react";
import AdminQuickPanel from "@/components/AdminQuickPanel";
import FacultyScheduleTable from "@/components/FacultyScheduleTable";

const AdminDashboard: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="space-y-6">
      <div className="text-2xl font-semibold">Адмін панель</div>
      <AdminQuickPanel />

      {isMobile ? (
        <div className="glasscard p-6 text-center space-y-3">
          <div className="text-lg font-semibold">Розклад недоступний на мобільних</div>
          <div className="text-sm text-[var(--muted)] ">
            Будь ласка, відкрийте цю сторінку з комп’ютера або скористайтесь експортом у PDF.
          </div>
          <button className="btn py-2 px-4 rounded-xl hover-shadow">
            Експорт у PDF
          </button>
        </div>
      ) : (
             <div
    className="
      relative left-1/2 -translate-x-1/2   /* центрування */
      w-[99vw]                             /* 95% ширини вікна */
      px-4 sm:px-6 lg:px-8
    "
  >
    <FacultyScheduleTable />
  </div>





      )}

      {/* історія змін можна повернути пізніше */}
      {/* <AdminHistoryPanel /> */}
    </div>
  );
};

export default AdminDashboard;
