import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { SendMessageDto } from './dto/message.dto';

export interface ConversationSummary {
  courseId: string;
  courseTitle: string;
  counterpartId: string;
  counterpartName: string;
  lastMessage: string | null;
  lastMessageAt: Date | null;
  unreadCount: number;
}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async send(dto: SendMessageDto, senderId: string, senderRole: Role) {
    await this.assertCanMessage(dto.courseId, senderId, senderRole, dto.recipientId);

    const message = await this.prisma.message.create({
      data: {
        courseId: dto.courseId,
        senderId,
        recipientId: dto.recipientId,
        body: dto.body.trim(),
      },
      select: this.messageSelect(),
    });

    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { title: true },
    });

    await this.notificationsService.create(
      dto.recipientId,
      'SYSTEM',
      `New message — ${course?.title ?? 'Course'}`,
      message.body.length > 120 ? `${message.body.slice(0, 117)}…` : message.body,
    );

    return message;
  }

  async thread(courseId: string, otherUserId: string, actorId: string, actorRole: Role) {
    await this.assertCanMessage(courseId, actorId, actorRole, otherUserId);

    const messages = await this.prisma.message.findMany({
      where: {
        courseId,
        OR: [
          { senderId: actorId, recipientId: otherUserId },
          { senderId: otherUserId, recipientId: actorId },
        ],
      },
      select: this.messageSelect(),
      orderBy: { createdAt: 'asc' },
    });

    await this.prisma.message.updateMany({
      where: {
        courseId,
        senderId: otherUserId,
        recipientId: actorId,
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    return messages;
  }

  async conversations(actorId: string, actorRole: Role, courseId?: string) {
    if (actorRole === Role.LEARNER) {
      return this.learnerConversations(actorId, courseId);
    }
    return this.staffConversations(actorId, actorRole, courseId);
  }

  private async learnerConversations(learnerId: string, courseId?: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        learnerId,
        ...(courseId ? { courseId } : {}),
        status: { in: ['ACTIVE', 'COMPLETED'] },
      },
      select: {
        courseId: true,
        course: {
          select: {
            id: true,
            title: true,
            createdById: true,
            trainers: { select: { trainerId: true, trainer: { select: { id: true, firstName: true, lastName: true } } } },
          },
        },
      },
    });

    const conversations: ConversationSummary[] = [];
    for (const enrollment of enrollments) {
      const counterparts = new Map<string, { id: string; firstName: string; lastName: string }>();
      for (const t of enrollment.course.trainers) {
        counterparts.set(t.trainer.id, t.trainer);
      }
      const creator = await this.prisma.user.findUnique({
        where: { id: enrollment.course.createdById },
        select: { id: true, firstName: true, lastName: true, role: true },
      });
      if (creator && (creator.role === Role.TRAINER || creator.role === Role.ADMIN)) {
        counterparts.set(creator.id, creator);
      }

      for (const person of counterparts.values()) {
        const last = await this.lastMessage(enrollment.courseId, learnerId, person.id);
        const unreadCount = await this.prisma.message.count({
          where: {
            courseId: enrollment.courseId,
            senderId: person.id,
            recipientId: learnerId,
            readAt: null,
          },
        });
        conversations.push({
          courseId: enrollment.courseId,
          courseTitle: enrollment.course.title,
          counterpartId: person.id,
          counterpartName: `${person.firstName} ${person.lastName}`,
          lastMessage: last?.body ?? null,
          lastMessageAt: last?.createdAt ?? null,
          unreadCount,
        });
      }
    }

    return conversations.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  private async staffConversations(actorId: string, actorRole: Role, courseId?: string) {
    const courses = await this.prisma.course.findMany({
      where: {
        ...(courseId ? { id: courseId } : {}),
        ...(actorRole === Role.ADMIN
          ? {}
          : {
              OR: [{ createdById: actorId }, { trainers: { some: { trainerId: actorId } } }],
            }),
      },
      select: { id: true, title: true },
    });

    const conversations: ConversationSummary[] = [];
    for (const course of courses) {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { courseId: course.id, status: { in: ['ACTIVE', 'COMPLETED'] } },
        select: {
          learnerId: true,
          learner: { select: { id: true, firstName: true, lastName: true } },
        },
      });

      for (const enrollment of enrollments) {
        const last = await this.lastMessage(course.id, actorId, enrollment.learnerId);
        const unreadCount = await this.prisma.message.count({
          where: {
            courseId: course.id,
            senderId: enrollment.learnerId,
            recipientId: actorId,
            readAt: null,
          },
        });
        conversations.push({
          courseId: course.id,
          courseTitle: course.title,
          counterpartId: enrollment.learner.id,
          counterpartName: `${enrollment.learner.firstName} ${enrollment.learner.lastName}`,
          lastMessage: last?.body ?? null,
          lastMessageAt: last?.createdAt ?? null,
          unreadCount,
        });
      }
    }

    return conversations.sort((a, b) => {
      const aTime = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const bTime = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  private async lastMessage(courseId: string, userA: string, userB: string) {
    return this.prisma.message.findFirst({
      where: {
        courseId,
        OR: [
          { senderId: userA, recipientId: userB },
          { senderId: userB, recipientId: userA },
        ],
      },
      select: { body: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async assertCanMessage(courseId: string, actorId: string, actorRole: Role, otherUserId: string) {
    if (actorId === otherUserId) {
      throw new ForbiddenException('Cannot message yourself');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        id: true,
        createdById: true,
        trainers: { select: { trainerId: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const other = await this.prisma.user.findUnique({
      where: { id: otherUserId },
      select: { id: true, role: true, isActive: true },
    });
    if (!other || !other.isActive) throw new NotFoundException('Recipient not found');

    const isStaffOnCourse =
      actorRole === Role.ADMIN ||
      course.createdById === actorId ||
      course.trainers.some((t) => t.trainerId === actorId);

    const otherIsStaffOnCourse =
      other.role === Role.ADMIN ||
      course.createdById === otherUserId ||
      course.trainers.some((t) => t.trainerId === otherUserId);

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        learnerId_courseId: {
          learnerId: actorRole === Role.LEARNER ? actorId : otherUserId,
          courseId,
        },
      },
      select: { id: true },
    });

    if (actorRole === Role.LEARNER) {
      if (!enrollment) throw new ForbiddenException('You must be enrolled in this course');
      if (!otherIsStaffOnCourse) throw new ForbiddenException('You can only message course trainers');
      return;
    }

    if (!isStaffOnCourse) throw new ForbiddenException('You are not assigned to this course');
    if (other.role !== Role.LEARNER || !enrollment) {
      throw new ForbiddenException('You can only message enrolled learners');
    }
  }

  private messageSelect() {
    return {
      id: true,
      courseId: true,
      senderId: true,
      recipientId: true,
      body: true,
      readAt: true,
      createdAt: true,
      sender: { select: { id: true, firstName: true, lastName: true, role: true } },
      recipient: { select: { id: true, firstName: true, lastName: true, role: true } },
    } as const;
  }
}
