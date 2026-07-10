import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateModuleDto, CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class LessonsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async createModule(dto: CreateModuleDto, actorId: string, actorRole: Role) {
    await this.assertCourseAccess(dto.courseId, actorId, actorRole);

    const mod = await this.prisma.module.create({
      data: {
        title: dto.title,
        courseId: dto.courseId,
        order: dto.order ?? 0,
      },
    });

    await this.auditService.log({ actorId, action: 'CREATE', entity: 'Module', entityId: mod.id });
    return mod;
  }

  async createLesson(dto: CreateLessonDto, actorId: string, actorRole: Role) {
    let moduleId = dto.moduleId;

    if (!moduleId && dto.courseId) {
      await this.assertCourseAccess(dto.courseId, actorId, actorRole);
      const module = await this.prisma.module.findFirst({ where: { courseId: dto.courseId } });
      if (!module) {
        moduleId = (await this.prisma.module.create({
          data: { title: 'Default Module', courseId: dto.courseId, order: 0 },
        })).id;
      } else {
        moduleId = module.id;
      }
    } else if (moduleId) {
      const mod = await this.prisma.module.findUnique({ where: { id: moduleId } });
      if (!mod) throw new NotFoundException('Module not found');
      await this.assertCourseAccess(mod.courseId, actorId, actorRole);
    } else {
      throw new NotFoundException('Either moduleId or courseId is required');
    }

    const lesson = await this.prisma.lesson.create({
      data: {
        title: dto.title,
        content: dto.content,
        videoUrl: dto.videoUrl,
        moduleId,
        order: dto.order ?? 0,
      },
    });

    await this.auditService.log({ actorId, action: 'CREATE', entity: 'Lesson', entityId: lesson.id });
    return lesson;
  }

  async updateLesson(id: string, dto: UpdateLessonDto, actorId: string, actorRole: Role) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select: { module: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.assertCourseAccess(lesson.module.courseId, actorId, actorRole);

    const updated = await this.prisma.lesson.update({ where: { id }, data: dto });
    await this.auditService.log({ actorId, action: 'UPDATE', entity: 'Lesson', entityId: id });
    return updated;
  }

  async removeLesson(id: string, actorId: string, actorRole: Role) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      select: { module: { select: { courseId: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.assertCourseAccess(lesson.module.courseId, actorId, actorRole);

    await this.prisma.lesson.delete({ where: { id } });
    await this.auditService.log({ actorId, action: 'DELETE', entity: 'Lesson', entityId: id });
    return { message: 'Lesson deleted' };
  }

  // Learners access full course content directly (no PDFs, no restrictions beyond enrollment)
  async findLessonsByCourse(courseId: string) {
    return this.prisma.module.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
      include: { lessons: { orderBy: { order: 'asc' } } },
    });
  }

  async findLessonById(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id },
      include: { module: { include: { course: true } } },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async markComplete(courseId: string, lessonId: string, learnerId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: { module: true },
    });
    if (!lesson || lesson.module.courseId !== courseId) {
      throw new NotFoundException('Lesson not found in this course');
    }

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
    });
    if (!enrollment) {
      throw new ForbiddenException('You must be enrolled in this course');
    }

    return this.prisma.progress.upsert({
      where: { learnerId_lessonId: { learnerId, lessonId } },
      update: { completed: true, completedAt: new Date() },
      create: { learnerId, lessonId, completed: true, completedAt: new Date() },
    });
  }

  private async assertCourseAccess(courseId: string, actorId: string, actorRole: Role) {
    if (actorRole === Role.ADMIN) return;
    if (actorRole === Role.LEARNER) {
      throw new ForbiddenException('Learners cannot manage course content');
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { trainers: true },
    });
    if (!course) throw new NotFoundException('Course not found');

    const isAssigned =
      course.createdById === actorId || course.trainers.some((t) => t.trainerId === actorId);
    if (!isAssigned) {
      throw new ForbiddenException('You are not assigned to this course');
    }
  }
}
