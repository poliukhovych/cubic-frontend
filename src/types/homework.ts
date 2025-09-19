// src/types/homework.ts
// src/types/homework.ts
export type HomeworkTask = {
  id: string;
  subject: string;
  text: string;
  createdAt: string;
  dueDate: string;              // YYYY-MM-DD
  groupId: string;
  teacherId: string;
  done: boolean;   
  classroomUrl?: string;
  files?: { id: string; url: string; title?: string }[];
};

export type StudentHomeworkResponse = {
  tasks: HomeworkTask[];
  totalWeeks: number;           // 🔹 максимальна кількість тижнів з бекенду
};
