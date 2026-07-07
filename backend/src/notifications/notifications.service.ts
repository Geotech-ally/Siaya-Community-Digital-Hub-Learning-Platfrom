import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EMAIL_QUEUE } from '../queue/queue.module';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  async create(userId: string, type: NotificationType, title: string, message: string) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, title, message },
    });

    // Queue an async email job (handled by Notifications processor / Integrations module)
    await this.emailQueue.add('send-notification-email', { userId, title, message });

    return notification;
  }

  // Trainer/Admin broadcasts an announcement to all learners in a course
  async broadcastToCourse(courseId: string, title: string, message: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { courseId },
      select: { learnerId: true },
    });

    const notifications = await this.prisma.$transaction(
      enrollments.map((e) =>
        this.prisma.notification.create({
          data: {
            userId: e.learnerId,
            type: NotificationType.ANNOUNCEMENT,
            title,
            message,
          },
        }),
      ),
    );

    for (const e of enrollments) {
      await this.emailQueue.add('send-notification-email', { userId: e.learnerId, title, message });
    }

    return notifications;
  }

  async findMine(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  // Announcements: platform-wide or per-course visible messages
  async listAnnouncements(params: { courseId?: string; page?: number; pageSize?: number }) {
    const where = params.courseId ? { courseId: params.courseId } : { courseId: null };
    const announcements = await this.prisma.announcement.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: ((params.page || 1) - 1) * (params.pageSize || 20),
      take: params.pageSize || 20,
    });
    const total = await this.prisma.announcement.count({ where });
    return { data: announcements, total, page: params.page || 1, pageSize: params.pageSize || 20 };
  }

  async createAnnouncement(data: { title: string; body: string; courseId?: string }, actorId: string) {
    const announcement = await this.prisma.announcement.create({
      data: {
        title: data.title,
        body: data.body,
        courseId: data.courseId || null,
        createdBy: actorId,
      },
    });

    // If it's a course announcement, also notify enrolled learners
    if (data.courseId) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId: data.courseId },
        select: { learnerId: true },
      });
      await this.prisma.notification.createMany({
        data: enrollments.map((e) => ({
          userId: e.learnerId,
          type: 'ANNOUNCEMENT' as any,
          title: data.title,
          message: data.body,
        })),
      });
    }

    return announcement;
  }

  async removeAnnouncement(id: string) {
    const announcement = await this.prisma.announcement.findUnique({ where: { id } });
    if (!announcement) throw new NotFoundException('Announcement not found');

    await this.prisma.announcement.delete({ where: { id } });
    return { message: 'Announcement deleted' };
  }
}
