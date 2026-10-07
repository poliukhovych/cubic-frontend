// src/pages/student/StudentHomework.tsx
import React, { useEffect, useMemo, useState } from "react";
import { fetchStudentHomework } from "@/lib/fakeApi/student";
import type { HomeworkTask } from "@/types/homework";
import { useAuth } from "@/types/auth";
import HomeworkList from "@/components/HomeworkList";
import HomeworkWeek from "@/components/HomeworkWeek";
import { getFirstTeachingMonday, getWeekIndex } from "@/lib/time/academicWeek";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { CalendarDays, List, BookOpen } from "lucide-react";


const StudentHomework: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);
  const [mode, setMode] = useState<"list" | "week">("list");
  const semesterStart = React.useMemo(() => getFirstTeachingMonday(new Date()), []);
  const [week, setWeek] = useState<number>(() => getWeekIndex(new Date(), { startMonday: semesterStart }));
  const [totalWeeks, setTotalWeeks] = useState<number>(16);

  useEffect(() => {
    if (!user) return;
    fetchStudentHomework(user.id).then(({ tasks, totalWeeks }) => {
      setTasks(tasks);
      setTotalWeeks(totalWeeks ?? 16);
      setWeek(w => Math.min(Math.max(1, w), totalWeeks ?? 16));
    });
  }, [user]);

  const dueSorted = useMemo(
    () => [...tasks].sort((a, b) => a.dueDate.localeCompare(b.dueDate)),
    [tasks]
  );

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex items-center justify-center text-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <BookOpen className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Домашні завдання</h1>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 0, filter: "blur(6px)" }} 
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} 
        transition={{ delay: 0.08 }}
      >
        <div className="glass glass-card p-6 rounded-xl">
          <Tabs value={mode} onValueChange={(value) => setMode(value as "list" | "week")} className="w-full">
            <div className="flex justify-center mb-6">
                            <TabsList className="glass glass-btn h-12 p-1 bg-background/20 border border-border/30 rounded-xl">
                <TabsTrigger 
                  value="list" 
                  className="group relative flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background/90 data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-6 py-2 rounded-lg transition-all duration-300 ease-out hover:bg-background/50 hover:text-foreground hover:scale-[1.01] data-[state=active]:scale-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300 rounded-lg" />
                  <List className="w-4 h-4 transition-transform duration-300 group-hover:scale-105 group-data-[state=active]:scale-105 relative z-10" />
                  <span className="transition-all duration-300 relative z-10">Список</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="week" 
                  className="group relative flex items-center gap-2 text-sm font-medium data-[state=active]:bg-background/90 data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground px-6 py-2 rounded-lg transition-all duration-300 ease-out hover:bg-background/50 hover:text-foreground hover:scale-[1.01] data-[state=active]:scale-100 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 opacity-0 group-data-[state=active]:opacity-100 transition-opacity duration-300 rounded-lg" />
                  <CalendarDays className="w-4 h-4 transition-transform duration-300 group-hover:scale-105 group-data-[state=active]:scale-105 relative z-10" />
                  <span className="transition-all duration-300 relative z-10">По тижнях</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="list" className="mt-6">
              <motion.div
                key="list"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <HomeworkList tasks={dueSorted} />
              </motion.div>
            </TabsContent>
            
            <TabsContent value="week" className="mt-6">
              <motion.div
                key="week"
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <HomeworkWeek
                  tasks={tasks}
                  week={week}
                  setWeek={setWeek}
                  totalWeeks={totalWeeks}
                  semesterStart={semesterStart}
                />
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentHomework;
