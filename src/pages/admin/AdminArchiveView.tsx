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
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  ArrowLeft, 
  Calendar, 
  User, 
  MessageSquare, 
  CheckCircle,
  Clock
} from "lucide-react";

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
                <CardTitle>Зробити розклад актуальним?</CardTitle>
              </div>
              <CardDescription>
                Поточний актуальний розклад буде автоматично збережено в Архів.
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
            <Clock className="w-5 h-5 animate-spin" />
            Завантаження...
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
              <CardTitle className="text-xl">{snap.title}</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Збережено: {new Date(snap.createdAt).toLocaleString()}</span>
              </div>
              {snap.createdBy && (
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>Автор: {snap.createdBy}</span>
                </div>
              )}
              <Badge variant="outline" className="border-primary/30 text-primary">
                {snap.parity === "both" ? "Вся сітка" : snap.parity}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {snap.comment && (
              <div className="mb-4 p-3 bg-muted/20 rounded-lg border border-white/10">
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <p className="text-sm">{snap.comment}</p>
                </div>
              </div>
            )}
            
            <Button
              onClick={() => setConfirmOpen(true)}
              className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
              size="lg"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Зробити цей розклад актуальним
            </Button>
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
          <FacultyScheduleTable editable={false} lessons={snap.lessons} />
        </div>
      </div>

      {confirmModal}
    </div>
  );
};

export default AdminArchiveView;
