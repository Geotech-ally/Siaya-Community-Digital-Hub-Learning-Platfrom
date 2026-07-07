import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EnrollmentStatus, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class EnrollmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async enroll(dto: CreateEnrollmentDto, learnerId: string) {
    return this.enrollByCourseId(dto.courseId, learnerId);
  }

  async enrollByCourseId(courseId: string, learnerId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
    });
    if (existing) throw new ConflictException('Already enrolled in this course');

    const enrollment = await this.prisma.enrollment.create({
      data: { learnerId, courseId },
    });

    await this.auditService.log({
      actorId: learnerId,
      action: 'CREATE',
      entity: 'Enrollment',
      entityId: enrollment.id,
    });

    return enrollment;
  }

  async unenrollByCourseId(courseId: string, learnerId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const deleted = await this.prisma.enrollment.delete({
      where: { id: enrollment.id },
    });

    await this.auditService.log({
      actorId: learnerId,
      action: 'DELETE',
      entity: 'Enrollment',
      entityId: deleted.id,
    });

    return { message: 'Enrollment removed' };
  }

  async findMyEnrollments(learnerId: string) {
    return this.prisma.enrollment.findMany({
      where: { learnerId },
      include: { course: { select: { id: true, title: true, department: true, status: true } } },
      orderBy: { enrolledAt: 'desc' },
    });
  }

  async findByCourse(courseId: string, actorId: string, actorRole: Role, params?: { page?: number; pageSize?: number }) {
    if (actorRole === Role.TRAINER) {
      const course = await this.prisma.course.findUnique({
        where: { id: courseId },
        include: { trainers: true },
      });
      if (!course) throw new NotFoundException('Course not found');
      const isAssigned = course.createdById === actorId || course.trainers.some((trainer) => trainer.trainerId === actorId);
      if (!isAssigned) throw new ForbiddenException('You are not assigned to this course');
    }

    if (actorRole === Role.LEARNER) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { learnerId_courseId: { learnerId: actorId, courseId } },
      });
      if (!enrollment) throw new ForbiddenException('You are not enrolled in this course');
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.enrollment.findMany({
        where: { courseId },
        include: {
          learner: { select: { id: true, firstName: true, lastName: true, email: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { enrolledAt: 'desc' },
        skip: ((params?.page || 1) - 1) * (params?.pageSize || 20),
        take: params?.pageSize || 20,
      }),
      this.prisma.enrollment.count({ where: { courseId } }),
    ]);

    return {
      data: data.map((enrollment) => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        learnerId: enrollment.learnerId,
        learnerName: `${enrollment.learner.firstName} ${enrollment.learner.lastName}`,
        progressPercent: 0,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
      })),
      total,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    };
  }

  async findAll(params: { status?: EnrollmentStatus; page?: number; pageSize?: number }) {
    const where = params.status ? { status: params.status } : undefined;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.enrollment.findMany({
        where,
        include: {
          learner: { select: { id: true, firstName: true, lastName: true, email: true } },
          course: { select: { id: true, title: true } },
        },
        orderBy: { enrolledAt: 'desc' },
        skip: ((params.page || 1) - 1) * (params.pageSize || 20),
        take: params.pageSize || 20,
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return {
      data: data.map((enrollment) => ({
        id: enrollment.id,
        courseId: enrollment.courseId,
        courseTitle: enrollment.course.title,
        learnerId: enrollment.learnerId,
        learnerName: `${enrollment.learner.firstName} ${enrollment.learner.lastName}`,
        progressPercent: 0,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
      })),
      total,
      page: params.page || 1,
      pageSize: params.pageSize || 20,
    };
  }

  async markCompleted(enrollmentId: string) {
    return this.prisma.enrollment.update({
      where: { id: enrollmentId },
      data: { status: EnrollmentStatus.COMPLETED, completedAt: new Date() },
    });
  }
}
