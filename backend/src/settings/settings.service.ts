import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface SettingsInput {
  emailNotifications?: boolean;
  messageNotifications?: boolean;
  courseAnnouncements?: boolean;
  publicProfile?: boolean;
  shareCertificates?: boolean;
  theme?: string;
  language?: string;
}

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOrCreate(userId: string) {
    const existing = await this.prisma.settings.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.settings.create({ data: { userId } });
  }

  async update(userId: string, input: SettingsInput) {
    const existing = await this.prisma.settings.findUnique({ where: { userId } });
    if (!existing) {
      const created = await this.prisma.settings.create({ data: { userId, ...sanitize(input) } });
      return created;
    }
    return this.prisma.settings.update({
      where: { userId },
      data: sanitize(input),
    });
  }
}

function sanitize(input: SettingsInput) {
  const data: Record<string, unknown> = {};
  if (typeof input.emailNotifications === 'boolean') data.emailNotifications = input.emailNotifications;
  if (typeof input.messageNotifications === 'boolean') data.messageNotifications = input.messageNotifications;
  if (typeof input.courseAnnouncements === 'boolean') data.courseAnnouncements = input.courseAnnouncements;
  if (typeof input.publicProfile === 'boolean') data.publicProfile = input.publicProfile;
  if (typeof input.shareCertificates === 'boolean') data.shareCertificates = input.shareCertificates;
  if (typeof input.theme === 'string') data.theme = input.theme;
  if (typeof input.language === 'string') data.language = input.language;
  return data;
}
