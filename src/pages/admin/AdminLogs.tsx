// src/pages/admin/AdminLogs.tsx
import React, { useEffect, useState } from "react";
import { fetchAdminLogs, type AdminLog } from "@/lib/fakeApi/admin";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Clock, 
  AlertCircle, 
  AlertTriangle, 
  Info,
  Activity
} from "lucide-react";

const levelColor: Record<AdminLog["level"], string> = {
  info:  "text-blue-400",
  warn:  "text-amber-400", 
  error: "text-red-400",
};

const levelIcon: Record<AdminLog["level"], React.ComponentType<{ className?: string }>> = {
  info: Info,
  warn: AlertTriangle,
  error: AlertCircle,
};

const levelVariant: Record<AdminLog["level"], "default" | "secondary" | "destructive"> = {
  info: "default",
  warn: "secondary", 
  error: "destructive",
};

const AdminLogs: React.FC = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  useEffect(() => { fetchAdminLogs().then(setLogs); }, []);

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
              <FileText className="w-6 h-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Системні логи</CardTitle>
                <CardDescription>Перегляд журналу подій системи</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Logs content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="flex justify-center"
      >
        <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl w-full max-w-4xl">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <CardTitle>Журнал подій</CardTitle>
            </div>
            <CardDescription>
              Знайдено {logs.length} записів
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {logs.length > 0 ? (
              <div className="divide-y divide-white/10">
                {logs.map((l, index) => {
                  const Icon = levelIcon[l.level];
                  return (
                    <motion.div
                      key={l.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.02 }}
                      className="px-6 py-4 hover:bg-muted/10 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-4 h-4 mt-0.5 ${levelColor[l.level]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={levelVariant[l.level]} className="text-xs">
                              {l.level.toUpperCase()}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              <span>{new Date(l.ts).toLocaleString()}</span>
                            </div>
                          </div>
                          <p className="text-sm">{l.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="px-6 py-12 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <FileText className="w-8 h-8 text-muted-foreground/50" />
                  <span>Поки що немає логів...</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogs;
