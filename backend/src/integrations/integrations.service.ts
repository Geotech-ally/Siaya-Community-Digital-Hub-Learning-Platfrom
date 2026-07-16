import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const host = this.config.get<string>('SMTP_HOST');
    if (host) {
      this.transporter = nodemailer.createTransport({
        host,
        port: this.config.get<number>('SMTP_PORT', 587),
        auth: {
          user: this.config.get<string>('SMTP_USER'),
          pass: this.config.get<string>('SMTP_PASS'),
        },
      });
    }
  }

  async sendNotificationEmail(userId: string, title: string, message: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured. Skipping email to ${user.email}: [${title}] ${message}`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM', 'no-reply@sicodihub.ac.ke'),
      to: user.email,
      subject: title,
      text: message,
    });
  }

  async sendCertificateEmail(data: {
    recipientEmail: string;
    learnerName?: string;
    courseTitle: string;
    certificateNo: string;
    verifyUrl: string;
    message?: string;
  }) {
    if (!this.transporter) {
      this.logger.warn(
        `SMTP not configured. Skipping certificate email to ${data.recipientEmail}`,
      );
      return;
    }

    const body = [
      data.message ? `${data.message}\n` : '',
      `${data.learnerName ? data.learnerName + ',' : 'Hi'},`,
      '',
      `Congratulations on completing "${data.courseTitle}"!`,
      '',
      `You can verify this certificate here: ${data.verifyUrl}`,
      '',
      `Certificate No: ${data.certificateNo}`,
      '',
      `— Siaya Community Digital Hub`,
    ].join('\n');

    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM', 'no-reply@sicodihub.ac.ke'),
      to: data.recipientEmail,
      subject: `Certificate of Completion — ${data.courseTitle}`,
      text: body,
    });
  }

  async sendCourseDripEmail(data: {
    recipientEmail: string;
    learnerName?: string;
    completedCourseTitle: string;
    recommendations: { title: string; url: string }[];
  }) {
    if (!this.transporter) {
      this.logger.warn(`SMTP not configured. Skipping course drip to ${data.recipientEmail}`);
      return;
    }

    const recs = data.recommendations.length
      ? data.recommendations
          .map((r, i) => `${i + 1}. ${r.title} — ${r.url}`)
          .join('\n')
      : 'Browse all courses in the learning portal to keep building your skills.';

    const body = [
      `${data.learnerName ? data.learnerName + ',' : 'Hi'},`,
      '',
      `Great work finishing "${data.completedCourseTitle}"! Keep the momentum going with another course.`,
      '',
      'Recommended next steps:',
      recs,
      '',
      `— Siaya Community Digital Hub`,
    ].join('\n');

    await this.transporter.sendMail({
      from: this.config.get<string>('SMTP_FROM', 'no-reply@sicodihub.ac.ke'),
      to: data.recipientEmail,
      subject: `Continue learning after "${data.completedCourseTitle}"`,
      text: body,
    });
  }
}
