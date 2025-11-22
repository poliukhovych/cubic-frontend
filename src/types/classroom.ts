// src/types/classroom.ts

export interface ClassroomCourse {
  id: string;
  name: string;
  section?: string;
  description?: string;
  room?: string;
  ownerId: string;
  creationTime: string;
  updateTime: string;
  enrollmentCode?: string;
  courseState: 'ACTIVE' | 'ARCHIVED' | 'PROVISIONED' | 'DECLINED' | 'SUSPENDED';
  alternateLink: string;
  teacherGroupEmail?: string;
  courseGroupEmail?: string;
  teacherFolder?: {
    id: string;
    title: string;
    alternateLink: string;
  };
  courseMaterialSets?: any[];
}

export interface ClassroomStudent {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export interface ClassroomTeacher {
  courseId: string;
  userId: string;
  profile: {
    id: string;
    name: {
      givenName: string;
      familyName: string;
      fullName: string;
    };
    emailAddress: string;
    photoUrl?: string;
  };
}

export interface ClassroomCoursework {
  courseId: string;
  id: string;
  title: string;
  description?: string;
  materials?: any[];
  state: 'PUBLISHED' | 'DRAFT' | 'DELETED';
  alternateLink: string;
  creationTime: string;
  updateTime: string;
  dueDate?: {
    year: number;
    month: number;
    day: number;
  };
  dueTime?: {
    hours: number;
    minutes: number;
    seconds: number;
    nanos: number;
  };
  maxPoints?: number;
  workType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  submissionModificationMode: 'MODIFIABLE_UNTIL_TURNED_IN' | 'MODIFIABLE' | 'UNMODIFIABLE';
  assigneeMode: 'ALL_STUDENTS' | 'INDIVIDUAL_STUDENTS';
  individualStudentsOptions?: {
    studentIds: string[];
  };
}

export interface ClassroomSubmission {
  courseId: string;
  courseWorkId: string;
  id: string;
  userId: string;
  creationTime: string;
  updateTime: string;
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT';
  late: boolean;
  draftGrade?: number;
  assignedGrade?: number;
  alternateLink: string;
  courseWorkType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
  associatedWithDeveloper: boolean;
  submissionHistory?: any[];
  assignmentSubmission?: {
    attachments: any[];
  };
  shortAnswerSubmission?: {
    answer: string;
  };
  multipleChoiceSubmission?: {
    answer: string;
  };
}

export interface ClassroomInvitation {
  id: string;
  userId: string;
  courseId: string;
  role: 'STUDENT' | 'TEACHER' | 'OWNER';
}