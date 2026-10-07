//src/pages/teacher/TeacherDashboard.tsx
import React from "react";
import { TeacherTiles } from "@/components/DashboardTiles";
import { motion } from "framer-motion";
import { LayoutDashboard } from "lucide-react";

const TeacherDashboard: React.FC = () => (
  <div className="space-y-6">
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.5 }}
      className="relative z-10 flex items-center justify-center text-center"
    >
      <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
        <LayoutDashboard className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-semibold text-foreground">Панель викладача</h1>
      </div>
    </motion.div>
    <TeacherTiles />
  </div>
);

export default TeacherDashboard;
