import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto, SubmitQuizDto } from './dto/quiz.dto';
import { AuditService } from '../audit/audit.service';
import { CertificatesService } from '../certificates/certificates.service';

class UpdateQuizDto {
  title?: string;
  description?: string;
  passingScorePercent?: number;
  timeLimitMinutes?: number;
}

@Injectable()
export class QuizzesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly certificatesService: CertificatesService,
  ) {}

  // Trainer creates quizzes for their assigned course; Admin can for any course
  async create(dto: CreateQuizDto, actorId: string, actorRole: Role) {
    await this.assertCourseAccess(dto.courseId, actorId, actorRole);

    const quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        description: dto.description,
        courseId: dto.courseId,
        passMark: dto.passingScorePercent ?? 50,
        questions: dto.questions
          ? {
              create: dto.questions.map((q, idx) => ({
                text: q.text,
                type: q.type,
                options: q.options,
                correctAnswer: q.correctAnswer as any,
                points: q.points ?? 1,
                order: q.order ?? idx,
              })),
            }
          : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        courseId: true,
        passMark: true,
        createdAt: true,
        updatedAt: true,
        questions: { select: { id: true, text: true, type: true, options: true, correctAnswer: true, points: true, order: true } },
      },
    });

    await this.auditService.log({ actorId, action: 'CREATE', entity: 'Quiz', entityId: quiz.id });
    return { ...quiz, passingScorePercent: quiz.passMark };
  }

  async update(id: string, dto: UpdateQuizDto, actorId: string, actorRole: Role) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id }, select: { courseId: true } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.assertCourseAccess(quiz.courseId, actorId, actorRole);

    const updateData: any = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.passingScorePercent !== undefined) updateData.passMark = dto.passingScorePercent;
    if (dto.timeLimitMinutes !== undefined) updateData.timeLimitMinutes = dto.timeLimitMinutes;

    const updated = await this.prisma.quiz.update({ where: { id }, data: updateData });
    await this.auditService.log({ actorId, action: 'UPDATE', entity: 'Quiz', entityId: id });
    return { ...updated, passingScorePercent: updated.passMark };
  }

  async remove(id: string, actorId: string, actorRole: Role) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id }, select: { courseId: true } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.assertCourseAccess(quiz.courseId, actorId, actorRole);

    await this.prisma.quiz.delete({ where: { id } });
    await this.auditService.log({ actorId, action: 'DELETE', entity: 'Quiz', entityId: id });
    return { message: 'Quiz deleted' };
  }

  // Learners see questions WITHOUT correct answers
  async findOneForLearner(id: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        courseId: true,
        passMark: true,
        createdAt: true,
        updatedAt: true,
        questions: { select: { id: true, text: true, type: true, options: true, points: true, order: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    return {
      ...quiz,
      questions: quiz.questions,
      passingScorePercent: quiz.passMark,
    };
  }

  // Trainers/Admin see the full quiz including answers
  async findOneForStaff(id: string, actorId: string, actorRole: Role) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        courseId: true,
        passMark: true,
        createdAt: true,
        updatedAt: true,
        questions: { select: { id: true, text: true, type: true, options: true, correctAnswer: true, points: true, order: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.assertCourseAccess(quiz.courseId, actorId, actorRole);
    return { ...quiz, passingScorePercent: quiz.passMark };
  }

  async findByCourse(courseId: string) {
    const quizzes = await this.prisma.quiz.findMany({ where: { courseId } });
    return quizzes.map((q) => ({ ...q, passingScorePercent: q.passMark }));
  }

  // Online quiz submission with automatic grading
  async submit(quizId: string, dto: SubmitQuizDto, learnerId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        courseId: true,
        passMark: true,
        questions: { select: { id: true, correctAnswer: true, points: true } },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of quiz.questions) {
      totalPoints += question.points;
      const submitted = dto.answers[question.id];
      if (this.isAnswerCorrect(question.correctAnswer, submitted)) {
        earnedPoints += question.points;
      }
    }

    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passMark;

    const submission = await this.prisma.quizSubmission.create({
      data: {
        quizId,
        learnerId,
        answers: dto.answers as any,
        score,
        passed,
      },
    });

    await this.auditService.log({
      actorId: learnerId,
      action: 'CREATE',
      entity: 'QuizSubmission',
      entityId: submission.id,
      metadata: { score, passed },
    });

    // Auto-issue a certificate if this submission completes the course.
    if (passed) {
      try {
        await this.certificatesService.checkAndIssue(learnerId, quiz.courseId, learnerId);
      } catch {
        // Certificate issuance must not break the quiz submission response.
      }
    }

    return submission;
  }

  async findMySubmissions(learnerId: string, quizId?: string) {
    return this.prisma.quizSubmission.findMany({
      where: { learnerId, quizId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  // Trainer: review learner submissions for assigned course quizzes
  async findSubmissionsForQuiz(quizId: string, actorId: string, actorRole: Role) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, select: { courseId: true } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    await this.assertCourseAccess(quiz.courseId, actorId, actorRole);

    return this.prisma.quizSubmission.findMany({
      where: { quizId },
      select: {
        id: true,
        quizId: true,
        learnerId: true,
        answers: true,
        score: true,
        passed: true,
        submittedAt: true,
        learner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  private isAnswerCorrect(correct: any, submitted: any): boolean {
    if (Array.isArray(correct)) {
      if (!Array.isArray(submitted)) return false;
      const a = [...correct].sort();
      const b = [...submitted].sort();
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    return String(correct).trim().toLowerCase() === String(submitted ?? '').trim().toLowerCase();
  }

  private async assertCourseAccess(courseId: string, actorId: string, actorRole: Role) {
    if (actorRole === Role.ADMIN) return;
    if (actorRole === Role.LEARNER) {
      throw new ForbiddenException('Learners cannot manage quizzes');
    }
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        createdById: true,
        trainers: { select: { trainerId: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    const isAssigned =
      course.createdById === actorId || course.trainers.some((t) => t.trainerId === actorId);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this course');
  }
}
