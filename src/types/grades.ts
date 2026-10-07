export type GradeItem = {
  id: string;
  subject: string;              // предмет
  points: number;               // оцінка (бал)
  max?: number;                 // макс. бал (необов'язково)
  comment?: string;             // за що поставлена
  createdAt: string;            // дата виставлення
  classroomUrl?: string;        // лінк на завдання у Classroom
};

export type SubjectGrades = {
  subject: string;
  items: GradeItem[];
  total: number;                // сума балів за предмет
};

export type StudentGradesResponse = {
  studentId: string;
  subjects: SubjectGrades[];
  updatedAt: string;
};
