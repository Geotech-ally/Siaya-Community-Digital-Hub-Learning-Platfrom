import { Injectable } from '@nestjs/common';
import { EnrollmentStatus, Role } from '@prisma/client';
import { AnalyticsService } from '../analytics/analytics.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly analyticsService: AnalyticsService,
  ) {}

  async getDashboard(userId: string, role: Role) {
    if (role === Role.ADMIN) {
      const [platform, weeklyReport, unreadNotifications] = await Promise.all([
        this.analyticsService.platform(),
        this.analyticsService.weeklyReport(),
        this.prisma.notification.count({ where: { userId, isRead: false } }),
      ]);

      return { role, platform, weeklyReport, unreadNotifications };
    }

    if (role === Role.TRAINER) {
      const [trainer, recentNotifications, assignedCourses] = await Promise.all([
        this.analyticsService.trainer(userId),
        this.recentNotifications(userId),
        this.prisma.course.findMany({
          where: {
            OR: [
              { createdById: userId },
              { trainers: { some: { trainerId: userId } } },
            ],
          },
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            department: true,
            _count: { select: { enrollments: true, modules: true } },
          },
          orderBy: { updatedAt: 'desc' },
          take: 5,
        }),
      ]);

      return { role, trainer, recentNotifications, assignedCourses };
    }

    const [activity, activeEnrollments, recentNotifications] = await Promise.all([
      this.analyticsService.userActivity(userId),
      this.prisma.enrollment.findMany({
        where: { learnerId: userId, status: EnrollmentStatus.ACTIVE },
        select: {
          id: true,
          status: true,
          enrolledAt: true,
          course: {
            select: {
              id: true,
              title: true,
              slug: true,
              department: true,
              status: true,
            },
          },
        },
        orderBy: { enrolledAt: 'desc' },
        take: 5,
      }),
      this.recentNotifications(userId),
    ]);

    return { role, activity, activeEnrollments, recentNotifications };
  }

  private recentNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        title: true,
        isRead: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
  }
}
