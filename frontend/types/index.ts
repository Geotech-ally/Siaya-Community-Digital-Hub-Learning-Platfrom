// ---------------------------------------------------------------------------
// Shared domain types. These mirror the NestJS backend DTOs/entities.
// Keep in sync with backend swagger/schema when it changes.
// ---------------------------------------------------------------------------

export type Role = 'ADMIN' | 'TRAINER' | 'LEARNER';

export type Department =
  | 'BASIC_ICT_SKILLS'
  | 'DESIGN_COURSES'
  | 'MARKETING_COURSES'
  | 'COMPUTER_SCIENCE'
  | 'DATA_SCIENCE_AND_AI';

export const DEPARTMENT_LABELS: Record<Department, string> = {
  BASIC_ICT_SKILLS: 'Basic ICT Skills',
  DESIGN_COURSES: 'Design Courses',
  MARKETING_COURSES: 'Marketing Courses',
  COMPUTER_SCIENCE: 'Computer Science',
  DATA_SCIENCE_AND_AI: 'Data Science and AI',
};

export const DEPARTMENTS: Department[] = [
  'BASIC_ICT_SKILLS',
  'DESIGN_COURSES',
  'MARKETING_COURSES',
  'COMPUTER_SCIENCE',
  'DATA_SCIENCE_AND_AI',
];

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  department: Department;
  coverImageUrl?: string | null;
  trainerId?: string;
  trainerName?: string | null;
  isPublished: boolean;
  enrolledCount: number;
  lessonCount: number;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  order: number;
  durationSeconds?: number;
  resources: LessonResource[];
}

export interface LessonResource {
  id: string;
  title: string;
  fileUrl: string;
  type: 'PDF' | 'DOC' | 'SLIDE' | 'LINK' | 'OTHER';
}

export interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  learnerId: string;
  learnerName?: string;
  progressPercent: number;
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  enrolledAt: string;
}

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE';

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: QuestionType;
  options: { id: string; text: string }[];
  correctOptionIds: string[];
  points: number;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  timeLimitMinutes?: number;
  questions: QuizQuestion[];
  passingScorePercent: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  learnerId: string;
  answers: Record<string, string[]>;
  scorePercent: number;
  passed: boolean;
  submittedAt: string;
}

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  learnerId: string;
  learnerName?: string;
  fileUrl?: string;
  textResponse?: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
  status: 'PENDING' | 'GRADED' | 'LATE';
}

export interface ProgressSummary {
  courseId: string;
  courseTitle: string;
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  totalQuizzes: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
  overallPercent: number;
}

export interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  learnerId: string;
  issuedAt: string;
  certificateUrl: string;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  courseId?: string | null;
  createdBy: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
