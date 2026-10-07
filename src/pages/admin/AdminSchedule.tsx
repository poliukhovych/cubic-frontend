//src/pages/admin/AdminSchedule.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchTeacherDetailedSchedule, updateGlobalSchedule } from "@/lib/fakeApi/admin";
import type { TeacherSchedule } from "@/types/schedule";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  User, 
  MapPin, 
  Clock, 
  Users, 
  Save,
  BookOpen
} from "lucide-react";

const AdminSchedule: React.FC = () => {
  const [sp] = useSearchParams();
  const teacherId = sp.get("teacher") ?? "t1";
  const [data, setData] = useState<TeacherSchedule | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { fetchTeacherDetailedSchedule(teacherId).then(setData); }, [teacherId]);

  const lessons = data?.lessons ?? [];
  const changedPayload = useMemo(() => ({ teacherId, lessons }), [teacherId, lessons]);

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
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Редагування розкладу</CardTitle>
                <CardDescription>Управління розкладом викладача</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Teacher info and lessons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex justify-center"
      >
        <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl w-full max-w-4xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <CardTitle>Викладач ID: {teacherId}</CardTitle>
            </div>
            <CardDescription>
              Знайдено {lessons.length} занять у розкладі
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((l, index) => (
                  <motion.div
                    key={l.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="p-4 rounded-lg border border-white/10 bg-background/20 backdrop-blur hover:bg-background/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-primary" />
                        <span className="font-medium">{l.subject}</span>
                      </div>
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        {l.weekday}
                      </Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{l.time.start}—{l.time.end}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{l.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{l.group.name}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Розклад для цього викладача не знайдено</p>
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <Button
                disabled={busy}
                onClick={async () => { 
                  setBusy(true); 
                  await updateGlobalSchedule(changedPayload); 
                  setBusy(false); 
                }}
                className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {busy ? "Оновлюємо..." : "Оновити глобальний розклад"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminSchedule;
