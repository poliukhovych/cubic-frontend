export type SubjectMaterial = {
  id: string;
  title: string;
  url: string;          // посилання на файл/драйв/слайди
  kind?: "slides" | "doc" | "video" | "repo" | "other";
};

export type SubjectDetails = {
  id: string;           // slug
  name: string;         // відображувана назва
  teacher: { id: string; name: string; email?: string; };
  meetingUrl?: string;  // головне посилання на пару (Meet/Zoom)
  description?: string;
  materials: SubjectMaterial[];
  // агрегати
  upcomingHomework: Array<{
    id: string;
    text: string;
    dueDate: string;
    done: boolean;  // додаємо поле для статусу виконання
    classroomUrl?: string;
  }>;
  recentGrades: Array<{
    id: string;
    comment?: string;
    points: number;
    max?: number;
    createdAt: string;
    classroomUrl?: string;
  }>;
  updatedAt: string;
};
