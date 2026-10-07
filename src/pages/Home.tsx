// src/pages/Home.tsx
import React from "react";
import { useAuth } from "@/types/auth";
import { Link } from "react-router-dom";
import bgImage from "@/assets/bg-5.jpg";
import Reveal from "@/components/Reveal";
import { LogIn, UserPlus, Info, ArrowRight } from "lucide-react";

import StudentDashboard from "@/pages/student/StudentDashboard";
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import AdminDashboard from "@/pages/admin/AdminDashboard";

// Import shadcn components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const Home: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="space-y-10 max-w-5xl mx-auto px-4">
        {/* HERO */}
        <Reveal className="relative hover-lift h-[60vh] rounded-2xl overflow-hidden shadow-lg text-white" y={12}>
          <Reveal as="div" className="absolute inset-0" blurPx={14} opacityFrom={0.15} delayMs={0} y={0}>
            <div
              className="w-full h-full"
              style={{ backgroundImage: `url(${bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
            />
            <div className="absolute inset-0" style={{ background: "var(--hero-dim)" }} />
          </Reveal>

          <Reveal
            className="relative z-10 max-w-2xl mx-auto h-full flex flex-col items-center justify-center px-4 text-center"
            delayMs={120}
            y={10}
            opacityFrom={0}
          >
            <h1 className="text-5xl font-bold mb-4 hover-lift">Cubic Helper</h1>
            <p className="text-lg leading-relaxed hover-lift">
              Сервіс для студентів та викладачів факультету: персональний розклад,
              домашні завдання та зручне управління навчальним процесом.
            </p>
          </Reveal>
        </Reveal>

        {/* Інформаційні картки про ролі (без дій) - Using shadcn Card */}
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal delayMs={60}>
            <Card className="hover-lift border-none bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Для студентів</CardTitle>
                <CardDescription>
                  Персональний розклад, статуси домашніх завдань, контроль прогресу.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="gap-2 cursor-glow hover:bg-background/60 hover:text-foreground glass glass-btn backdrop-blur-sm border border-border/20">
                      <Info className="h-4 w-4" /> Дізнатися більше
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Можливості для студентів</DialogTitle>
                      <DialogDescription>
                        Cubic Helper надає студентам зручний доступ до розкладу, домашніх завдань та навчальних матеріалів.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <p>Персональний розклад занять</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <p>Відстеження статусу домашніх завдань</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <p>Контроль прогресу навчання</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </Reveal>
          <Reveal delayMs={120}>
            <Card className="hover-lift border-none bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Для викладачів</CardTitle>
                <CardDescription>
                  Керування групами та підгрупами, створення завдань і контроль виконання.
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" className="gap-2 cursor-glow hover:bg-background/60 hover:text-foreground glass glass-btn backdrop-blur-sm border border-border/20">
                      <Info className="h-4 w-4" /> Дізнатися більше
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Можливості для викладачів</DialogTitle>
                      <DialogDescription>
                        Cubic Helper допомагає викладачам ефективно керувати навчальним процесом.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <p>Керування групами та підгрупами</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <p>Створення та перевірка завдань</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-primary" />
                        <p>Контроль виконання навчального плану</p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          </Reveal>
        </div>

        {/* ✅ Чітка CTA-панель (дії для всіх) - Using shadcn Card and Button */}
        <Reveal delayMs={80}>
          <Card className="hover-lift border-none bg-card/80 backdrop-blur-sm">
            <div className="p-5 md:p-6 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
              <div className="md:flex-1">
                <div className="text-sm uppercase tracking-wide text-muted-foreground">Почніть тут</div>
                <div className="text-lg md:text-xl">У вас уже є акаунт чи ви вперше?</div>
              </div>

              <div className="flex-1 flex flex-col md:flex-row gap-4 md:gap-3">
                <Button asChild size="lg" className="flex-1 rounded-xl cursor-glow bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-[1.03] transition-transform border-none shadow-md">
                  <Link to="/login" aria-label="Увійти до акаунта" title="Увійти до акаунта" className="flex items-center justify-center gap-2 py-3">
                    <LogIn className="w-5 h-5" />
                    <span className="font-medium">Увійти</span>
                  </Link>
                </Button>

                {/* роздільник лише на мобілці, щоб не зливалося */}
                <div className="md:hidden flex items-center justify-center text-muted-foreground text-sm">або</div>

                <Button asChild variant="outline" size="lg" className="flex-1 rounded-xl cursor-glow hover:bg-background/80 hover:text-foreground border-border/30 hover:scale-[1.03] transition-transform shadow-sm glass glass-card backdrop-blur-sm">
                  <Link to="/register" aria-label="Створити новий акаунт" title="Створити новий акаунт" className="flex items-center justify-center gap-2 py-3">
                    <UserPlus className="w-5 h-5" />
                    <span className="font-medium">Зареєструватися</span>
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        </Reveal>
      </div>
    );
  }

  switch (user.role) {
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    case "student":
    default:
      return <StudentDashboard />;
  }
};

export default Home;
