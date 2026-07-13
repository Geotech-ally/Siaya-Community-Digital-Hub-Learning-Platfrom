import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    fullName: z.string().min(2, 'Enter your full name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const courseSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Add a short description'),
  department: z.enum([
    'BASIC_ICT_SKILLS',
    'DESIGN_COURSES',
    'MARKETING_COURSES',
    'COMPUTER_SCIENCE',
    'DATA_SCIENCE_AND_AI',
  ]),
  trainerId: z.string().optional(),
});
export type CourseFormValues = z.infer<typeof courseSchema>;

export const lessonSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  content: z.string().min(10, 'Add lesson content'),
  videoUrl: z.string().url('Enter a valid video URL').optional().or(z.literal('')),
  order: z.coerce.number().int().min(1),
});
export type LessonFormValues = z.infer<typeof lessonSchema>;

export const assignmentSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  instructions: z.string().min(10, 'Add instructions'),
  dueDate: z.string().min(1, 'Set a due date'),
  maxScore: z.coerce.number().int().min(1),
});
export type AssignmentFormValues = z.infer<typeof assignmentSchema>;

export const quizQuestionSchema = z.object({
  prompt: z.string().min(3, 'Question is required'),
  type: z.enum(['SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE']),
  options: z.array(z.object({ id: z.string(), text: z.string().min(1) })).min(2),
  correctOptionIds: z.array(z.string()).min(1),
  points: z.coerce.number().int().min(1),
});

export const quizSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  description: z.string().optional(),
  timeLimitMinutes: z.coerce.number().int().min(1).optional(),
  passingScorePercent: z.coerce.number().int().min(1).max(100),
  questions: z.array(quizQuestionSchema).min(1, 'Add at least one question'),
});
export type QuizFormValues = z.infer<typeof quizSchema>;

export const announcementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  body: z.string().min(5, 'Write a message'),
  courseId: z.string().optional(),
});
export type AnnouncementFormValues = z.infer<typeof announcementSchema>;
