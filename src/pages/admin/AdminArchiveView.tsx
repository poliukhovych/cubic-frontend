// src/pages/admin/AdminArchiveView.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getScheduleSnapshot,
  fetchFacultySchedule,
  saveFacultySchedule,
  createScheduleSnapshot,
} from "@/lib/fakeApi/admin";
import FacultyScheduleTable from "@/components/FacultyScheduleTable";
import ExportButtons from "@/components/ExportButtons";
import { exportSchedulePdf } from "@/lib/utils/pdf";
import { useAuth } from "@/types/auth";
import type { ScheduleSnapshot, FacultyLesson } from "@/types/schedule";
import { createPortal } from "react-dom";

type Level = "bachelor" | "master";

const AdminArchiveView: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [snap, setSnap] = useState<ScheduleSnapshot | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) getScheduleSnapshot(id).then(setSnap);
  }, [id]);

  const onExportAll = () => {
    if (tableRef.current && snap) {
      exportSchedulePdf(tableRef.current, `${snap.title}.pdf`, snap.title);
    }
  };
  const onExportCourse = onExportAll; // поки що експортуємо саме те, що на екрані
  const onExportLevel = onExportAll;  // (можемо деталізувати пізніше)

  const makeCurrent = async () => {
    if (!snap) return;
    setBusy(true);
    try {
      // 1) Автобекап поточного “актуального” розкладу
      const [b, m] = await Promise.all([
        fetchFacultySchedule("bachelor" as Level),
        fetchFacultySchedule("master" as Level),
      ]);
      await createScheduleSnapshot(
        `Автобекап перед призначенням: ${snap.title}`,
        "Система автоматично зберегла попередній актуальний розклад.",
        "both",
        user?.name ?? "Admin",
        [...b, ...m]
      );

      // 2) Переписати актуальний розклад із цього знімка
      const bLessons = snap.lessons.filter(
        (l) => l.level === "bachelor"
      ) as FacultyLesson[];
      const mLessons = snap.lessons.filter(
        (l) => l.level === "master"
      ) as FacultyLesson[];
      await Promise.all([
        saveFacultySchedule("bachelor" as Level, bLessons),
        saveFacultySchedule("master" as Level, mLessons),
      ]);

      setConfirmOpen(false);
      alert("Розклад призначено актуальним. Попередній збережено до Архіву.");
    } finally {
      setBusy(false);
    }
  };

  const confirmModal =
    confirmOpen &&
    createPortal(
      <div className="fixed inset-0 z-[1000] flex items-center justify-center">
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => !busy && setConfirmOpen(false)}
        />
        <div className="glasscard relative z-10 w-[min(520px,92vw)] p-5 rounded-2xl">
          <div className="text-lg font-semibold mb-2">
            Зробити розклад актуальним?
          </div>
          <div className="text-sm text-[var(--muted)] mb-4">
            Поточний актуальний розклад буде автоматично збережено в Архів.
          </div>
          <div className="flex justify-end gap-2">
            <button
              className="btn px-4 py-2 rounded-xl"
              onClick={() => setConfirmOpen(false)}
              disabled={busy}
            >
              Скасувати
            </button>
            <button
              className="btn px-4 py-2 rounded-xl"
              onClick={makeCurrent}
              disabled={busy}
            >
              {busy ? "Застосовуємо…" : "Підтвердити"}
            </button>
          </div>
        </div>
      </div>,
      document.body
    );

  if (!snap) return <div className="glasscard p-6">Завантаження…</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/admin/archive" className="btn px-3 py-2 rounded-xl">
          ← До списку архіву
        </Link>
        <div className="text-2xl font-semibold">Архів — перегляд знімка</div>
      </div>

      {/* Інфо-панель про знімок */}
      <div className="glasscard p-4">
        <div className="font-semibold text-lg">{snap.title}</div>
        <div className="text-sm text-[var(--muted)]">
          Збережено: {new Date(snap.createdAt).toLocaleString()} · Автор:{" "}
          {snap.createdBy} · Парність: {snap.parity === "both" ? "Вся сітка" : snap.parity}
        </div>
        {snap.comment && <div className="mt-2">{snap.comment}</div>}

        <div className="mt-4">
          <button
            className="btn px-4 py-2 rounded-xl"
            onClick={() => setConfirmOpen(true)}
          >
            Зробити цей розклад актуальним
          </button>
        </div>
      </div>

      {/* Кнопки експорту — між панеллю і самою таблицею */}
      <ExportButtons
        onExportAll={onExportAll}
        onExportCourse={onExportCourse}
        onExportLevel={onExportLevel}
      />

      {/* ✅ ФУЛ-В’ЮПОРТ ОБГОРТКА (як на AdminDashboard) */}
      <div
        className="
          relative left-1/2 -translate-x-1/2
          w-[99vw]
          px-4 sm:px-6 lg:px-8
        "
      >
        <div ref={tableRef}>
          <FacultyScheduleTable editable={false} lessons={snap.lessons} />
        </div>
      </div>

      {confirmModal}
    </div>
  );
};

export default AdminArchiveView;
