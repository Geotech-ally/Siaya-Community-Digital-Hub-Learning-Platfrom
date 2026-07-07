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

  // Placeholder for external video integration (Mux/S3) URL validation.
  // Trainers attach video links directly; no PDF-based content is supported.
  isValidVideoUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      return ['stream.mux.com', 's3.amazonaws.com'].some((domain) =>
        parsed.hostname.includes(domain),
      ) || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
