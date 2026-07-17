import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async markComplete(courseId: string, lessonId: string, learnerId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { module: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    if (lesson.module.courseId !== courseId) throw new NotFoundException('Lesson does not belong to this course');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
      select: { id: true },
    });
    if (!enrollment) throw new ForbiddenException('You must be enrolled in this course');

    await this.prisma.user.update({
      where: { id: learnerId },
      data: { lastActiveAt: new Date() },
    });

    return this.prisma.progress.upsert({
      where: { learnerId_lessonId: { learnerId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { learnerId, lessonId, completed: true, completedAt: new Date() },
    });
  }

  async myCourseProgress(learnerId: string, courseId: string) {
    const [course, modules, progressRecords] = await this.prisma.$transaction([
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      }),
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
    const completedLessonIds = lessonIds.filter((id) => progressMap.get(id));
    const completedCount = completedLessonIds.length;
    const percentage = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;
    const nextLessonId = lessonIds.find((id) => !progressMap.get(id)) ?? lessonIds[0] ?? null;

    return {
      courseId,
      courseTitle: course?.title ?? '',
      lessonsCompleted: completedCount,
      totalLessons,
      quizzesPassed: 0,
      totalQuizzes: 0,
      assignmentsSubmitted: 0,
      totalAssignments: 0,
      overallPercent: percentage,
      completedLessonIds,
      nextLessonId,
    };
  }

  async myProgress(learnerId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { learnerId },
      select: { course: { select: { id: true, title: true } } },
    });

    if (enrollments.length === 0) return [];

    const courseIds = enrollments.map((e) => e.course.id);

    const [modulesMap, progressRecords] = await this.prisma.$transaction([
      this.prisma.module.findMany({
        where: { courseId: { in: courseIds } },
        select: { id: true, courseId: true, lessons: { select: { id: true }, orderBy: { order: 'asc' } } },
        orderBy: { order: 'asc' },
      }),
      this.prisma.progress.findMany({
        where: { learnerId, lesson: { module: { courseId: { in: courseIds } } } },
        select: { lessonId: true, completed: true },
      }),
    ]);

    const modulesByCourse = new Map<string, string[]>();
    for (const mod of modulesMap) {
      const lessonIds = mod.lessons.map((l) => l.id);
      const existing = modulesByCourse.get(mod.courseId);
      if (existing) {
        existing.push(...lessonIds);
      } else {
        modulesByCourse.set(mod.courseId, [...lessonIds]);
      }
    }

    const progressMap = new Map(progressRecords.map((p) => [p.lessonId, p.completed]));

    return enrollments.map((enrollment) => {
      const lessonIds = modulesByCourse.get(enrollment.course.id) ?? [];
      const completedLessonIds = lessonIds.filter((id) => progressMap.get(id));
      const completedCount = completedLessonIds.length;
      const percentage = lessonIds.length > 0 ? Math.round((completedCount / lessonIds.length) * 100) : 0;
      const nextLessonId = lessonIds.find((id) => !progressMap.get(id)) ?? lessonIds[0] ?? null;

      return {
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        lessonsCompleted: completedCount,
        totalLessons: lessonIds.length,
        quizzesPassed: 0,
        totalQuizzes: 0,
        assignmentsSubmitted: 0,
        totalAssignments: 0,
        overallPercent: percentage,
        completedLessonIds,
        nextLessonId,
      };
    });
  }

  async learnerCourseProgress(learnerId: string, courseId: string, actorId: string, actorRole: Role) {
    if (actorRole === Role.TRAINER) {
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
    return this.myCourseProgress(learnerId, courseId);
  }
}
