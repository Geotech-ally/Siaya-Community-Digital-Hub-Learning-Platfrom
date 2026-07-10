import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto, UpdateCourseDto, AssignTrainerDto } from './dto/course.dto';
import { AuditService } from '../audit/audit.service';

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Injectable()
export class CoursesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateCourseDto, creatorId: string) {
    const baseSlug = slugify(dto.title);
    let slug = baseSlug;
    let suffix = 1;
    const existing = await this.prisma.course.findMany({
      where: { slug: { startsWith: baseSlug } },
      select: { slug: true },
    });
    const existingSlugs = new Set(existing.map((c) => c.slug));
    while (existingSlugs.has(slug)) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description,
        slug,
        department: dto.department,
        categoryId: dto.categoryId,
        createdById: creatorId,
      },
    });

    await this.auditService.log({
      actorId: creatorId,
      action: 'CREATE',
      entity: 'Course',
      entityId: course.id,
    });

    return course;
  }

  async findAll(params: { status?: string; department?: string; search?: string; light?: boolean } = {}) {
    const where: any = {};
    if (params.status) where.status = params.status as any;
    if (params.department) where.department = params.department as any;
    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const light = params.light ?? false;

    const courses = await this.prisma.course.findMany({
      where,
      include: {
        category: true,
        trainers: { include: { trainer: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        _count: { select: { enrollments: true, modules: light ? undefined : true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (light) {
      const lessonCounts = await this.prisma.$queryRaw<{ courseId: string; count: bigint }[]>`
        SELECT m."courseId" AS "courseId", COUNT(l.id) AS "count"
        FROM modules m
        JOIN lessons l ON l."moduleId" = m.id
        WHERE m."courseId" IN (${Prisma.join(courses.map((c) => c.id))})
        GROUP BY m."courseId"
      `;
      const counts = new Map(lessonCounts.map((r) => [r.courseId, Number(r.count)]));
      return courses.map((course) => ({
        ...course,
        _count: { ...course._count, modules: counts.get(course.id) ?? 0 },
      }));
    }

    return courses.map((course) => {
      const primaryTrainer = course.trainers[0]?.trainer;
      const lessonCount = course._count.modules ?? 0;
      return {
        ...course,
        enrolledCount: course._count.enrollments,
        lessonCount,
        trainerId: primaryTrainer?.id ?? course.createdById,
        trainerName: primaryTrainer ? `${primaryTrainer.firstName} ${primaryTrainer.lastName}` : null,
      };
    });
  }

  async findOne(id: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        category: true,
        modules: { include: { lessons: true }, orderBy: { order: 'asc' } },
        trainers: { include: { trainer: { select: { id: true, firstName: true, lastName: true, email: true } } } },
        _count: { select: { enrollments: true, modules: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const primaryTrainer = course.trainers[0]?.trainer;
    const lessonCount = course.modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
    return {
      ...course,
      enrolledCount: course._count.enrollments,
      lessonCount,
      trainerId: primaryTrainer?.id ?? course.createdById,
      trainerName: primaryTrainer ? `${primaryTrainer.firstName} ${primaryTrainer.lastName}` : null,
    };
  }

  async update(id: string, dto: UpdateCourseDto, actorId: string, actorRole: Role) {
    await this.assertCourseAccess(id, actorId, actorRole);

    const updated = await this.prisma.course.update({
      where: { id },
      data: dto,
    });

    await this.auditService.log({
      actorId,
      action: 'UPDATE',
      entity: 'Course',
      entityId: id,
    });

    return updated;
  }

  async publish(id: string, isPublished: boolean, actorId: string, actorRole: Role) {
    await this.assertCourseAccess(id, actorId, actorRole);

    const updated = await this.prisma.course.update({
      where: { id },
      data: { status: isPublished ? 'PUBLISHED' : 'DRAFT' },
    });

    await this.auditService.log({
      actorId,
      action: 'UPDATE',
      entity: 'Course',
      entityId: id,
      metadata: { published: isPublished },
    });

    return updated;
  }

  async remove(id: string, actorId: string, actorRole: Role) {
    await this.assertCourseAccess(id, actorId, actorRole);
    await this.prisma.course.delete({ where: { id } });
    await this.auditService.log({ actorId, action: 'DELETE', entity: 'Course', entityId: id });
    return { message: 'Course deleted' };
  }

  async assignTrainer(courseId: string, dto: AssignTrainerDto, adminId: string) {
    const assignment = await this.prisma.$transaction(async (tx) => {
      const course = await tx.course.findUnique({ where: { id: courseId }, select: { id: true } });
      if (!course) throw new NotFoundException('Course not found');

      const trainer = await tx.user.findUnique({
        where: { id: dto.trainerId },
        select: { id: true, role: true },
      });
      if (!trainer || trainer.role !== Role.TRAINER) {
        throw new BadRequestException('Target user is not a valid trainer');
      }

      return tx.courseTrainer.upsert({
        where: { courseId_trainerId: { courseId, trainerId: dto.trainerId } },
        update: {},
        create: { courseId, trainerId: dto.trainerId },
      });
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'UPDATE',
      entity: 'Course',
      entityId: courseId,
      metadata: { assignedTrainerId: dto.trainerId },
    });

    return assignment;
  }

  private async assertCourseAccess(courseId: string, actorId: string, actorRole: Role) {
    if (actorRole === Role.ADMIN) return;

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { trainers: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const isAssignedTrainer =
      course.createdById === actorId ||
      course.trainers.some((t) => t.trainerId === actorId);

    if (actorRole === Role.TRAINER && !isAssignedTrainer) {
      throw new ForbiddenException('You are not assigned to this course');
    }
    if (actorRole === Role.LEARNER) {
      throw new ForbiddenException('Learners cannot manage courses');
    }
  }
}
