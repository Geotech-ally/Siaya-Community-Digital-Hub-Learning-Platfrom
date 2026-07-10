import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async platform() {
    const [totalUsers, totalTrainers, totalLearners, totalCourses, totalEnrollments, enrollmentsByDepartment] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.user.count({ where: { role: Role.TRAINER } }),
        this.prisma.user.count({ where: { role: Role.LEARNER } }),
        this.prisma.course.count(),
        this.prisma.enrollment.count(),
        this.prisma.$queryRaw<
          { department: string; count: number }[]
        >`
          SELECT c.department AS "department", COUNT(e.id) AS "count"
          FROM courses c
          LEFT JOIN enrollments e ON e."courseId" = c.id
          GROUP BY c.department
          ORDER BY "count" DESC
        `,
      ]);

    const completed = await this.prisma.enrollment.count({
      where: { status: EnrollmentStatus.COMPLETED },
    });
    const completionRate = totalEnrollments > 0 ? Math.round((completed / totalEnrollments) * 100) : 0;

    const enrollmentsByDepartmentClean = enrollmentsByDepartment
      .filter((d) => d.department !== null)
      .map((d) => ({ department: d.department, count: Number(d.count) }));

    const enrollmentsOverTime = await this.prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT DATE(enrolled_at) as date, COUNT(*) as count
      FROM enrollments
      GROUP BY DATE(enrolled_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    return {
      totalUsers,
      totalTrainers,
      totalLearners,
      totalCourses,
      totalEnrollments,
      completionRate,
      enrollmentsByDepartment: enrollmentsByDepartmentClean,
      enrollmentsOverTime: enrollmentsOverTime.reverse(),
    };
  }

  async dashboardSummary(userId: string, role: Role) {
    if (role === Role.ADMIN) {
      return this.platform();
    }

    if (role === Role.TRAINER) {
      return this.trainer(userId);
    }

    return {
      totalCourses: 0,
      totalEnrollments: 0,
      completionRate: 0,
      enrollmentsByDepartment: [],
      enrollmentsOverTime: [],
    };
  }

  async trainer(userId: string) {
    const trainerCourses = await this.prisma.course.findMany({
      where: { createdById: userId },
      include: {
        enrollments: true,
        quizzes: { include: { submissions: true } },
      },
    });

    const totalCourses = trainerCourses.length;
    const totalLearners = trainerCourses.reduce(
      (sum, c) => sum + c.enrollments.length,
      0,
    );

    const allEnrollments = trainerCourses.flatMap((c) => c.enrollments);
    const completedCount = allEnrollments.filter(
      (e) => e.status === EnrollmentStatus.COMPLETED,
    ).length;
    const averageCompletionRate =
      totalCourses > 0
        ? Math.round(trainerCourses.reduce((sum, c) => {
            const total = c.enrollments.length;
            const completed = c.enrollments.filter(
              (e) => e.status === EnrollmentStatus.COMPLETED,
            ).length;
            return sum + (total > 0 ? Math.round((completed / total) * 100) : 0);
          }, 0) / totalCourses)
        : 0;

    const allQuizSubmissions = trainerCourses.flatMap((c) =>
      c.quizzes.flatMap((q) => q.submissions),
    );
    const passedQuizSubmissions = allQuizSubmissions.filter((s) => s.passed).length;
    const averageQuizScore =
      allQuizSubmissions.length > 0
        ? Math.round(
            (passedQuizSubmissions / allQuizSubmissions.length) * 100,
          )
        : 0;

    const courseBreakdown = trainerCourses.map((c) => {
      const total = c.enrollments.length;
      const completed = c.enrollments.filter(
        (e) => e.status === EnrollmentStatus.COMPLETED,
      ).length;
      return {
        courseId: c.id,
        courseTitle: c.title,
        learners: total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    return {
      totalCourses,
      totalLearners,
      averageCompletionRate,
      averageQuizScore,
      courseBreakdown,
    };
  }

  // Weekly report: enrollments, completions, quiz/assignment submissions in the last 7 days
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

  // User activity summary
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

  // Course completion rates (per course)
  async courseCompletionRates() {
    const courses = await this.prisma.course.findMany({
      select: {
        id: true,
        title: true,
        enrollments: { select: { status: true } },
      },
    });

    return courses.map((course) => {
      const total = course.enrollments.length;
      const completed = course.enrollments.filter((e) => e.status === EnrollmentStatus.COMPLETED).length;
      return {
        courseId: course.id,
        title: course.title,
        totalEnrollments: total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });
  }

  // Learner engagement: average lessons completed, quiz pass rate
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
