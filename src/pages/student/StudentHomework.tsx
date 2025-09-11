//src/pages/student/StudentHomework.tsx
import React, { useEffect, useState } from "react";
import { fetchStudentHomework } from "@/lib/fakeApi/student";
import type { HomeworkTask } from "@/types/homework";
import { useAuth } from "@/types/auth";
import HomeworkList from "@/components/HomeworkList";
import Reveal from "@/components/Reveal";

const StudentHomework: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<HomeworkTask[]>([]);

  useEffect(() => {
    if (user) fetchStudentHomework(user.id).then(setTasks);
  }, [user]);

  return (
    <div className="space-y-4">
      {/* Заголовок з легким в’їздом */}
      <Reveal
  className="relative z-10 flex items-center justify-center text-center"
  delayMs={120}
  y={10}
  opacityFrom={0}
>
  <div className="text-2xl font-semibold">Домашні завдання</div>
</Reveal>


      {/* Список завдань плавно з’являється трохи пізніше */}
      <Reveal y={10} blurPx={8} opacityFrom={0} delayMs={100}>
        <HomeworkList tasks={tasks} />
      </Reveal>
    </div>
  );
};

export default StudentHomework;
