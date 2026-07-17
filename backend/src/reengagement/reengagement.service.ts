import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class ReengagementService {
  private readonly logger = new Logger(ReengagementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
    private readonly config: ConfigService,
  ) {}

  private get inactivityDays(): number {
    const raw = this.config.get<string>('INACTIVITY_DAYS');
    const n = raw ? parseInt(raw, 10) : 30;
    return Number.isFinite(n) && n > 0 ? n : 30;
  }

  /**
   * Daily sweep: learners who haven't accessed the site for INACTIVITY_DAYS
   * and haven't been re-engaged recently receive an automated message,
   * in-app notification, and email from their course trainers.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async runDaily() {
    try {
      const result = await this.sendToInactiveLearners();
      this.logger.log(`Re-engagement sweep complete: ${result} learner(s) contacted`);
    } catch (err) {
      this.logger.error('Re-engagement sweep failed', (err as Error).message);
    }
  }

  async sendToInactiveLearners(): Promise<number> {
    const days = this.inactivityDays;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const learners = await this.prisma.user.findMany({
      where: {
        role: Role.LEARNER,
        isActive: true,
        OR: [
          { lastActiveAt: { lt: cutoff } },
          { lastActiveAt: null, createdAt: { lt: cutoff } },
        ],
        AND: [
          {
            OR: [{ reengagementSentAt: null }, { reengagementSentAt: { lt: cutoff } }],
          },
        ],
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        settings: { select: { emailNotifications: true, messageNotifications: true } },
      },
    });

    let contacted = 0;
    for (const learner of learners) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { learnerId: learner.id, status: 'ACTIVE' },
        select: {
          course: { select: { id: true, title: true, createdById: true } },
        },
      });
      if (enrollments.length === 0) continue;

      const emailOn = learner.settings?.emailNotifications ?? true;
      const messageOn = learner.settings?.messageNotifications ?? true;

      for (const { course } of enrollments) {
        const body = `Hi ${learner.firstName}, we've missed you! Pick up where you left off in "${course.title}".`;
        if (messageOn) {
          await this.prisma.message.create({
            data: {
              courseId: course.id,
              senderId: course.createdById,
              recipientId: learner.id,
              body,
            },
          });
        }
        if (emailOn) {
          await this.notificationsService.create(learner.id, 'SYSTEM', 'We miss you!', body);
        }
      }

      await this.prisma.user.update({
        where: { id: learner.id },
        data: { reengagementSentAt: new Date() },
      });
      contacted++;
    }

    return contacted;
  }
}
