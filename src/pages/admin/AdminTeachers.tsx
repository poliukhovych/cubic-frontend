//src/pages/admin/AdminTeachers.tsx
import React, { useEffect, useState } from "react";
import { fetchTeachers } from "@/lib/fakeApi/admin";
import type { Teacher } from "@/types/teachers";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Calendar, Mail, BookOpen } from "lucide-react";

const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  useEffect(() => { fetchTeachers().then(setTeachers); }, []);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5 }}
        className="flex justify-center"
      >
        <div className="flex items-center gap-3 glass backdrop-blur-sm px-6 py-4 rounded-2xl border border-border/20">
          <User className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-semibold text-foreground">Викладачі</h1>
        </div>
      </motion.div>

      {/* Teachers Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t, index) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="backdrop-blur-md bg-background/30 border-white/10 shadow-2xl hover:shadow-3xl transition-all duration-300 group hover:scale-[1.02]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-full bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{t.name}</h3>
                  </div>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {t.email}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="w-4 h-4" />
                      <span>Предмети:</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {t.subjects.map((subject, idx) => (
                        <Badge 
                          key={idx} 
                          variant="secondary" 
                          className="text-xs bg-primary/10 text-primary"
                        >
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <Button 
                  asChild 
                  className="w-full bg-primary/20 hover:bg-primary/30 text-primary border-primary/30 backdrop-blur"
                  variant="outline"
                >
                  <Link to={`/admin/schedule?teacher=${t.id}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Переглянути розклад
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {teachers.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-12"
        >
          <User className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <p className="text-muted-foreground">Викладачі не знайдені</p>
        </motion.div>
      )}
    </div>
  );
};

export default AdminTeachers;
