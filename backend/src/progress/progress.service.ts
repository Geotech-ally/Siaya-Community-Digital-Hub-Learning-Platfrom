import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async markComplete(courseId: string, lessonId: string, learnerId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.module.courseId !== courseId) throw new NotFoundException('Lesson does not belong to this course');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('You must be enrolled in this course');

    return this.prisma.progress.upsert({
      where: { learnerId_lessonId: { learnerId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { learnerId, lessonId, completed: true, completedAt: new Date() },
    });
  }

  async myCourseProgress(learnerId: string, courseId: string) {
    const [modules, progressRecords] = await this.prisma.$transaction([
      this.prisma.module.findMany({
        where: { courseId },
        select: { lessons: { select: { id: true }, orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      }),
      this.prisma.progress.findMany({
        where: { learnerId, lesson: { module: { courseId } } },
        select: { lessonId: true, completed: true },
      }),
    ]);

    const lessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
    const totalLessons = lessonIds.length;

    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p.completed]));
    const completedCount = lessonIds.filter((id) => progressMap.get(id)).length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return {
      courseId,
      courseTitle: '',
      lessonsCompleted: completedCount,
      totalLessons,
      quizzesPassed: 0,
      totalQuizzes: 0,
      assignmentsSubmitted: 0,
      totalAssignments: 0,
      overallPercent: percentage,
    };
  }

  async myProgress(learnerId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { learnerId },
      include: { course: { select: { id: true, title: true } } },
    });

    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map((e) => e.course.id);

    const [modulesMap, progressRecords] = await this.prisma.$transaction([
      this.prisma.module.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true, courseId: true, lessons: { select: { id: true } } },
        orderBy: { order: 'asc' },
      }),
      this.prisma.progress.findMany({
        where: { learnerId, lesson: { module: { courseId: { in: courseIds } } } },
        select: { lessonId: true, completed: true },
      }),
    ]);

    const modulesByCourse = new Map<string, { totalLessons: number; lessonIds: string[] }>();
    for (const mod of modulesMap) {
      const lessonIds = mod.lessons.map((l) => l.id);
      const existing = modulesByCourse.get(mod.courseId);
      if (existing) {
        existing.totalLessons += lessonIds.length;
        existing.lessonIds.push(...lessonIds);
      } else {
        modulesByCourse.set(mod.courseId, { totalLessons: lessonIds.length, lessonIds });
      }
    }

    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p.completed]));

    return enrollments.map((enrollment) => {
      const courseData = modulesByCourse.get(enrollment.course.id) ?? { totalLessons: 0, lessonIds: [] };
      const completedCount = courseData.lessonIds.filter((id) => progressMap.get(id)).length;
      const percentage = courseData.totalLessons > 0 ? Math.round((completedCount / courseData.totalLessons) * 100) : 0;
      return {
        ...enrollment.course,
        lessonsCompleted: completedCount,
        totalLessons: courseData.totalLessons,
        quizzesPassed: 0,
        totalQuizzes: 0,
        assignmentsSubmitted: 0,
        totalAssignments: 0,
        overallPercent: percentage,
      };
    });
  }

  async learnerCourseProgress(learnerId: string, courseId: string, actorId: string, actorRole: Role) {
    if (actorRole === Role.TRAINER) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { trainers: true },
      });
      if (!course) throw new NotFoundException('Course not found');
      const isAssigned =
        course.createdById === actorId || course.trainers.some((t) => t.trainerId === actorId);
      if (!isAssigned) throw new ForbiddenException('You are not assigned to this course');
    }
    return this.myCourseProgress(learnerId, courseId);
  }
}
