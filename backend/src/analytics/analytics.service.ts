import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async platform() {
    const [
      totalUsers,
      totalTrainers,
      totalLearners,
      totalCourses,
      totalEnrollments,
      completed,
      enrollmentsByDepartment,
      enrollmentsOverTime,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: Role.TRAINER } }),
      this.prisma.user.count({ where: { role: Role.LEARNER } }),
      this.prisma.course.count(),
      this.prisma.enrollment.count(),
      this.prisma.enrollment.count({ where: { status: EnrollmentStatus.COMPLETED } }),
      this.prisma.$queryRaw<{ department: string; count: bigint }[]>`
        SELECT c.department AS "department", COUNT(e.id) AS "count"
        FROM courses c
        LEFT JOIN enrollments e ON e."courseId" = c.id
        GROUP BY c.department
        ORDER BY "count" DESC
      `,
      this.prisma.$queryRaw<{ date: Date; count: bigint }[]>`
        SELECT DATE("enrolledAt") AS "date", COUNT(*) AS "count"
        FROM enrollments
        GROUP BY DATE("enrolledAt")
        ORDER BY "date" DESC
        LIMIT 30
      `,
    ]);

    return {
      totalUsers,
      totalTrainers,
      totalLearners,
      totalCourses,
      totalEnrollments,
      completionRate: totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0,
      enrollmentsByDepartment: enrollmentsByDepartment.map((d) => ({
        department: d.department,
        count: Number(d.count),
      })),
      enrollmentsOverTime: enrollmentsOverTime
        .map((d) => ({ date: d.date, count: Number(d.count) }))
        .reverse(),
    };
  }

  async dashboardSummary(userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return this.platform();
    }

    if (role === Role.TRAINER) {
      return this.trainer(userId);
    }

    return this.userActivity(userId);
  }

  async trainer(userId: string) {
    const trainerCourses = await this.prisma.course.findMany({
      where: {
        OR: [
          { createdById: userId },
          { trainers: { some: { trainerId: userId } } },
        ],
      },
      select: {
        id: true,
        title: true,
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const courseIds = trainerCourses.map((course) => course.id);
    if (courseIds.length === 0) {
      return {
        totalCourses: 0,
        totalLearners: 0,
        averageCompletionRate: 0,
        averageQuizScore: 0,
        courseBreakdown: [],
      };
    }

    const [completedByCourse, totalQuizSubmissions, passedQuizSubmissions, quizScore] = await Promise.all([
      this.prisma.enrollment.groupBy({
        by: ['courseId'],
        where: { courseId: { in: courseIds }, status: EnrollmentStatus.COMPLETED },
        _count: { _all: true },
      }),
      this.prisma.quizSubmission.count({ where: { quiz: { courseId: { in: courseIds } } } }),
      this.prisma.quizSubmission.count({ where: { quiz: { courseId: { in: courseIds } }, passed: true } }),
      this.prisma.quizSubmission.aggregate({
        where: { quiz: { courseId: { in: courseIds } }, score: { not: null } },
        _avg: { score: true },
      }),
    ]);

    const completedMap = new Map(completedByCourse.map((row) => [row.courseId, row._count._all]));
    const totalLearners = trainerCourses.reduce((sum, course) => sum + course._count.enrollments, 0);

    const courseBreakdown = trainerCourses.map((course) => {
      const learners = course._count.enrollments;
      const completed = completedMap.get(course.id) ?? 0;

      return {
        courseId: course.id,
        courseTitle: course.title,
        learners,
        completionRate: learners > 0 ? Math.round((completed / learners) * 100) : 0,
      };
    });

    const averageCompletionRate =
      trainerCourses.length > 0
        ? Math.round(
            courseBreakdown.reduce((sum, course) => sum + course.completionRate, 0) / trainerCourses.length,
          )
        : 0;

    return {
      totalCourses: trainerCourses.length,
      totalLearners,
      averageCompletionRate,
      averageQuizScore: quizScore._avg.score ? Math.round(quizScore._avg.score) : 0,
      quizPassRate: totalQuizSubmissions > 0 ? Math.round((passedQuizSubmissions / totalQuizSubmissions) * 100) : 0,
      courseBreakdown,
    };
  }

  async weeklyReport() {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const [newEnrollments, completions, quizSubmissions, assignmentSubmissions, newUsers] =
      await Promise.all([
        this.prisma.enrollment.count({ where: { enrolledAt: { gte: since } } }),
        this.prisma.enrollment.count({
          where: { status: EnrollmentStatus.COMPLETED, completedAt: { gte: since } },
        }),
        this.prisma.quizSubmission.count({ where: { submittedAt: { gte: since } } }),
        this.prisma.assignmentSubmission.count({ where: { submittedAt: { gte: since } } }),
        this.prisma.user.count({ where: { createdAt: { gte: since } } }),
      ]);

    return {
      periodStart: since.toISOString(),
      periodEnd: new Date().toISOString(),
      newEnrollments,
      courseCompletions: completions,
      quizSubmissions,
      assignmentSubmissions,
      newUsers,
    };
  }

  async userActivity(userId: string) {
    const [enrollments, quizSubmissions, assignmentSubmissions, progressRecords] =
      await Promise.all([
        this.prisma.enrollment.count({ where: { learnerId: userId } }),
        this.prisma.quizSubmission.count({ where: { learnerId: userId } }),
        this.prisma.assignmentSubmission.count({ where: { learnerId: userId } }),
        this.prisma.progress.count({ where: { learnerId: userId, completed: true } }),
      ]);

    return { userId, enrollments, quizSubmissions, assignmentSubmissions, lessonsCompleted: progressRecords };
  }

  async courseCompletionRates() {
    const courses = await this.prisma.course.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: 'desc' },
    });
    const courseIds = courses.map((course) => course.id);

    if (courseIds.length === 0) return [];

    const groupedEnrollments = await this.prisma.enrollment.groupBy({
      by: ['courseId', 'status'],
      where: { courseId: { in: courseIds } },
      _count: { _all: true },
    });

    const totals = new Map<string, number>();
    const completed = new Map<string, number>();
    for (const row of groupedEnrollments) {
      totals.set(row.courseId, (totals.get(row.courseId) ?? 0) + row._count._all);
      if (row.status === EnrollmentStatus.COMPLETED) {
        completed.set(row.courseId, row._count._all);
      }
    }

    return courses.map((course) => {
      const totalEnrollments = totals.get(course.id) ?? 0;
      const completedEnrollments = completed.get(course.id) ?? 0;

      return {
        courseId: course.id,
        title: course.title,
        totalEnrollments,
        completed: completedEnrollments,
        completionRate:
          totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0,
      };
    });
  }

  async learnerEngagement() {
    const [totalProgress, completedProgress, totalQuizSubmissions, passedQuizSubmissions] =
      await Promise.all([
        this.prisma.progress.count(),
        this.prisma.progress.count({ where: { completed: true } }),
        this.prisma.quizSubmission.count(),
        this.prisma.quizSubmission.count({ where: { passed: true } }),
      ]);

    return {
      lessonCompletionRate: totalProgress > 0 ? Math.round((completedProgress / totalProgress) * 100) : 0,
      quizPassRate:
        totalQuizSubmissions > 0
          ? Math.round((passedQuizSubmissions / totalQuizSubmissions) * 100)
          : 0,
      totalQuizSubmissions,
    };
  }
}
