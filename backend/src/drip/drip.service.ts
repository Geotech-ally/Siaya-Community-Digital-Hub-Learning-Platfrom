import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service';
import { EMAIL_QUEUE } from '../queue/queue.module';

@Injectable()
export class DripService {
  private readonly logger = new Logger(DripService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
  ) {}

  private courseUrl(courseId: string): string {
    const base = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return `${base.replace(/\/$/, '')}/courses/${courseId}`;
  }

  /** Recommend up to 3 courses the learner hasn't taken yet (same department first). */
  async recommendNextCourses(learnerId: string, completedCourseId: string) {
    const completed = await this.prisma.course.findUnique({
      where: { id: completedCourseId },
      select: { department: true, title: true },
    });
    if (!completed) return [];

    const enrolled = await this.prisma.enrollment.findMany({
      where: { learnerId },
      select: { courseId: true },
    });
    const exclude = new Set(enrolled.map((e) => e.courseId));

    const sameDept = await this.prisma.course.findMany({
      where: { status: 'PUBLISHED', department: completed.department, id: { notIn: [...exclude] } },
      take: 3,
      select: { id: true, title: true },
    });

    let recs = sameDept;
    if (recs.length < 3) {
      const others = await this.prisma.course.findMany({
        where: { status: 'PUBLISHED', id: { notIn: [...exclude, ...recs.map((r) => r.id)] } },
        take: 3 - recs.length,
        select: { id: true, title: true },
      });
      recs = [...recs, ...others];
    }

    return recs.map((c) => ({ title: c.title, url: this.courseUrl(c.id) }));
  }

  /** Touch 1 of the drip: recommendation email right after course completion. */
  async enqueueCompletionDrip(learnerId: string, completedCourseId: string) {
    const learner = await this.prisma.user.findUnique({
      where: { id: learnerId },
      select: {
        email: true,
        firstName: true,
        settings: { select: { emailNotifications: true } },
      },
    });
    const course = await this.prisma.course.findUnique({
      where: { id: completedCourseId },
      select: { title: true },
    });
    if (!learner || !course) return;
    if (learner.settings?.emailNotifications === false) return;

    const recommendations = await this.recommendNextCourses(learnerId, completedCourseId);
    await this.emailQueue.add('send-course-drip', {
      recipientEmail: learner.email,
      learnerName: learner.firstName,
      completedCourseTitle: course.title,
      recommendations,
    });
  }

  /**
   * Touch 2 of the drip: a few days after completing a course, nudge learners
   * who haven't started another course yet.
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async nudgeRecentGraduates() {
    try {
      const since = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      const until = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const recent = await this.prisma.enrollment.findMany({
        where: { status: 'COMPLETED', completedAt: { gte: since, lt: until } },
        select: { learnerId: true, courseId: true },
      });

      for (const e of recent) {
        const otherActive = await this.prisma.enrollment.count({
          where: { learnerId: e.learnerId, status: 'ACTIVE', courseId: { not: e.courseId } },
        });
        if (otherActive > 0) continue;
        await this.enqueueCompletionDrip(e.learnerId, e.courseId);
      }
    } catch (err) {
      this.logger.error('Course drip nudge failed', (err as Error).message);
    }
  }
}
