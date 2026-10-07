// src/pages/admin/AdminArchiveView.tsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  fetchScheduleDetailsApi,
  activateScheduleApi,
  type ScheduleResponse,
} from "@/lib/api/schedule-api";
import FacultyScheduleTable from "@/components/FacultyScheduleTable";
import ExportButtons from "@/components/ExportButtons";
import { exportSchedulePdf } from "@/lib/utils/pdf";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  ArrowLeft, 
  Calendar, 
  CheckCircle,
  Clock
} from "lucide-react";

const AdminArchiveView: React.FC = () => {
  const { id } = useParams();
  const [snap, setSnap] = useState<ScheduleResponse | null>(null);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    fetchScheduleDetailsApi(id)
      .then((d) => {
        setSnap(d.schedule);
        setLessonsCount(d.assignments.length);
      })
      .catch(() => setError("Розклад не знайдено"));
  }, [id]);

  const onExportAll = () => {
    if (tableRef.current && snap) {
      exportSchedulePdf(tableRef.current, `${snap.label}.pdf`, snap.label);
    }
  };
  const onExportCourse = onExportAll; // поки що експортуємо саме те, що на екрані
  const onExportLevel = onExportAll;  // (можемо деталізувати пізніше)

  const makeCurrent = async () => {
    if (!snap) return;
    setBusy(true);
    try {
      setSnap(await activateScheduleApi(snap.scheduleId));
      setConfirmOpen(false);
    } catch (e) {
      const err = e as { detail?: string; message?: string };
      setError(err?.detail || err?.message || "Не вдалося зробити розклад активним");
      setConfirmOpen(false);
    } finally {
      setBusy(false);
    }
  };

  const confirmModal =
    confirmOpen &&
    createPortal(
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[1000] flex items-center justify-center"
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => !busy && setConfirmOpen(false)}
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative z-10 w-[min(520px,92vw)]"
        >
          <Card className="backdrop-blur-md bg-background/90 border-white/20 shadow-2xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <CardTitle>Зробити розклад активним?</CardTitle>
              </div>
              <CardDescription>
                Студенти й викладачі побачать цей розклад. Попередній активний залишиться в архіві.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmOpen(false)}
                  disabled={busy}
                  className="bg-background/50 backdrop-blur hover:bg-background/80"
                >
                  Скасувати
                </Button>
                <Button
                  onClick={makeCurrent}
                  disabled={busy}
                  className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                >
                  {busy ? "Застосовуємо…" : "Підтвердити"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>,
      document.body
    );

  if (!snap) return (
    <div className="flex items-center justify-center min-h-screen">
      <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            {error ?? (
              <>
                <Clock className="w-5 h-5 animate-spin" />
                Завантаження...
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header with glass panel */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-center"
      >
        <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl w-full max-w-4xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Archive className="w-6 h-6 text-primary" />
                <div>
                  <CardTitle className="text-2xl">Перегляд архівного розкладу</CardTitle>
                  <CardDescription>Детальний перегляд збереженого знімка розкладу</CardDescription>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="bg-background/50 backdrop-blur hover:bg-background/80"
              >
                <Link to="/admin/archive">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  До архіву
                </Link>
              </Button>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Snapshot info panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex justify-center"
      >
        <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl w-full max-w-4xl">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle className="text-xl">{snap.label}</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Створено: {new Date(snap.createdAt).toLocaleString()}</span>
              </div>
              <span>Занять: {lessonsCount}</span>
              {snap.isActive && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  Активний
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {error && <p className="mb-4 text-sm text-destructive">{error}</p>}

            {!snap.isActive && (
              <Button
                onClick={() => setConfirmOpen(true)}
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                size="lg"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Зробити цей розклад активним
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>

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
          <FacultyScheduleTable editable={false} scheduleId={snap.scheduleId} />
        </div>
      </div>

      {confirmModal}
    </div>
  );
};

export default AdminArchiveView;
