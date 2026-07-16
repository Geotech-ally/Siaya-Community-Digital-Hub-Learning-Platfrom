import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role, SubmissionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAssignmentDto, SubmitAssignmentDto, GradeAssignmentDto } from './dto/assignment.dto';
import { AuditService } from '../audit/audit.service';
import { CertificatesService } from '../certificates/certificates.service';

@Injectable()
export class AssignmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly certificatesService: CertificatesService,
  ) {}

  async create(dto: CreateAssignmentDto, actorId: string, actorRole: Role) {
    const result = await this.createForCourse(dto.courseId, dto, actorId, actorRole);
    return result;
  }

  async createForCourse(courseId: string, dto: Omit<CreateAssignmentDto, 'courseId'>, actorId: string, actorRole: Role) {
    await this.assertCourseAccess(courseId, actorId, actorRole);

    const assignment = await this.prisma.assignment.create({
      data: {
        title: dto.title,
        description: dto.instructions,
        courseId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        maxScore: dto.maxScore ?? 100,
      },
    });

    await this.auditService.log({ actorId, action: 'CREATE', entity: 'Assignment', entityId: assignment.id });
    return { ...assignment, instructions: assignment.description };
  }

  async findByCourse(courseId: string) {
    const assignments = await this.prisma.assignment.findMany({ where: { courseId } });
    return assignments.map((assignment) => ({ ...assignment, instructions: assignment.description }));
  }

  async findOne(id: string) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    return { ...assignment, instructions: assignment.description };
  }

  async update(
    id: string,
    dto: Partial<{ title: string; instructions: string; dueDate: string; maxScore: number }>,
    actorId: string,
    actorRole: Role,
  ) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id }, select: { courseId: true } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.assertCourseAccess(assignment.courseId, actorId, actorRole);

    const updateData: Record<string, any> = {};
    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.instructions !== undefined) updateData.description = dto.instructions;
    if (dto.dueDate !== undefined) updateData.dueDate = new Date(dto.dueDate);
    if (dto.maxScore !== undefined) updateData.maxScore = dto.maxScore;

    const updated = await this.prisma.assignment.update({ where: { id }, data: updateData });
    await this.auditService.log({ actorId, action: 'UPDATE', entity: 'Assignment', entityId: id });
    return { ...updated, instructions: updated.description };
  }

  async remove(id: string, actorId: string, actorRole: Role) {
    const assignment = await this.prisma.assignment.findUnique({ where: { id }, select: { courseId: true } });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.assertCourseAccess(assignment.courseId, actorId, actorRole);

    await this.prisma.assignment.delete({ where: { id } });
    await this.auditService.log({ actorId, action: 'DELETE', entity: 'Assignment', entityId: id });
    return { message: 'Assignment deleted' };
  }

  async submit(assignmentId: string, dto: SubmitAssignmentDto, learnerId: string) {
    const [assignment, existing] = await Promise.all([
      this.prisma.assignment.findUnique({ where: { id: assignmentId }, select: { id: true, courseId: true, dueDate: true } }),
      this.prisma.assignmentSubmission.findUnique({
        where: { assignmentId_learnerId: { assignmentId, learnerId } },
        select: { id: true },
      }),
    ]);
    if (!assignment) throw new NotFoundException('Assignment not found');
    if (existing) throw new ConflictException('Assignment already submitted');

    const isLate = assignment.dueDate ? new Date() > assignment.dueDate : false;

    const submission = await this.prisma.assignmentSubmission.create({
      data: {
        assignmentId,
        learnerId,
        content: dto.textResponse ?? dto.fileUrl ?? '',
        status: isLate ? SubmissionStatus.LATE : SubmissionStatus.PENDING,
      },
    });

    await this.auditService.log({
      actorId: learnerId,
      action: 'CREATE',
      entity: 'AssignmentSubmission',
      entityId: submission.id,
    });

    // Auto-issue a certificate if this submission completes the course.
    try {
      await this.certificatesService.checkAndIssue(learnerId, assignment.courseId, learnerId);
    } catch {
      // Certificate issuance must not break the assignment submission response.
    }

    return submission;
  }

  async grade(submissionId: string, dto: GradeAssignmentDto, actorId: string, actorRole: Role) {
    const submission = await this.prisma.assignmentSubmission.findUnique({
      where: { id: submissionId },
      select: { assignment: { select: { courseId: true } } },
    });
    if (!submission) throw new NotFoundException('Submission not found');
    await this.assertCourseAccess(submission.assignment.courseId, actorId, actorRole);

    const finalGrade = dto.grade ?? (dto as any).score;
    const updated = await this.prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        score: finalGrade,
        feedback: dto.feedback,
        status: SubmissionStatus.GRADED,
        gradedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId,
      action: 'UPDATE',
      entity: 'AssignmentSubmission',
      entityId: submissionId,
      metadata: { score: finalGrade },
    });

    return updated;
  }

  async findMySubmissions(learnerId: string) {
    const submissions = await this.prisma.assignmentSubmission.findMany({
      where: { learnerId },
      include: { assignment: { select: { id: true, title: true, courseId: true, description: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    return submissions.map((submission) => ({
      ...submission,
      assignment: { ...submission.assignment, instructions: submission.assignment.description },
    }));
  }

  async listSubmissions(
    assignmentId: string,
    actorId: string,
    actorRole: Role,
    params?: { page?: number; pageSize?: number },
  ) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { id: true, courseId: true, title: true, description: true, dueDate: true, maxScore: true, createdAt: true, updatedAt: true },
    });
    if (!assignment) throw new NotFoundException('Assignment not found');
    await this.assertCourseAccess(assignment.courseId, actorId, actorRole);

    const [data, total] = await this.prisma.$transaction([
      this.prisma.assignmentSubmission.findMany({
        where: { assignmentId },
        select: {
          id: true,
          assignmentId: true,
          learnerId: true,
          content: true,
          status: true,
          score: true,
          feedback: true,
          submittedAt: true,
          gradedAt: true,
          learner: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { submittedAt: 'desc' },
        skip: ((params?.page || 1) - 1) * (params?.pageSize || 20),
        take: params?.pageSize || 20,
      }),
      this.prisma.assignmentSubmission.count({ where: { assignmentId } }),
    ]);

    return {
      data: data.map((submission) => ({
        ...submission,
        assignment: { ...assignment, instructions: assignment.description },
      })),
      total,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20,
    };
  }

  private async assertCourseAccess(courseId: string, actorId: string, actorRole: Role) {
    if (actorRole === Role.ADMIN) return;
    if (actorRole === Role.LEARNER) {
      throw new ForbiddenException('Learners cannot manage assignments');
    }
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        createdById: true,
        trainers: { select: { trainerId: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    const isAssigned = course.createdById === actorId || course.trainers.some((trainer) => trainer.trainerId === actorId);
    if (!isAssigned) throw new ForbiddenException('You are not assigned to this course');
  }
}
