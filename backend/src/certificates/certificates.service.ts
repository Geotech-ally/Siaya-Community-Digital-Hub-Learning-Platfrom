import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectQueue } from '@nestjs/bullmq';
import { Role } from '@prisma/client';
import { Queue } from 'bullmq';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { NotificationsService } from '../notifications/notifications.service';
import { StorageService, StoredObject } from '../storage/storage.service';
import { EMAIL_QUEUE } from '../queue/queue.module';
import { DripService } from '../drip/drip.service';
import { generateCertificatePdf } from './certificate-pdf';

export interface CompletionStatus {
  complete: boolean;
  lessons: { completed: number; total: number };
  quizzesPassed: boolean;
  assignmentsSubmitted: boolean;
}

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    private readonly notificationsService: NotificationsService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly dripService: DripService,
  ) {}

  /**
   * Evaluate whether a learner has fully completed a course:
   * all lessons viewed, all quizzes passed, all assignments submitted.
   */
  async checkCompletion(learnerId: string, courseId: string): Promise<CompletionStatus> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: {
        modules: { select: { lessons: { select: { id: true } } } },
        quizzes: {
          select: {
            id: true,
            submissions: { where: { learnerId }, select: { passed: true } },
          },
        },
        assignments: { select: { id: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const lessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));
    const completedLessons = lessonIds.length
      ? await this.prisma.progress.count({
          where: { learnerId, lessonId: { in: lessonIds }, completed: true },
        })
      : 0;
    const allLessonsDone = lessonIds.length > 0 && completedLessons === lessonIds.length;

    const quizzesPassed =
      course.quizzes.length === 0 ||
      course.quizzes.every((q) => q.submissions.some((s) => s.passed));

    const assignmentIds = course.assignments.map((a) => a.id);
    const submittedAssignments = assignmentIds.length
      ? await this.prisma.assignmentSubmission.count({
          where: { learnerId, assignmentId: { in: assignmentIds } },
        })
      : 0;
    const assignmentsSubmitted =
      assignmentIds.length === 0 || submittedAssignments === assignmentIds.length;

    return {
      complete: allLessonsDone && quizzesPassed && assignmentsSubmitted,
      lessons: { completed: completedLessons, total: lessonIds.length },
      quizzesPassed,
      assignmentsSubmitted,
    };
  }

  /**
   * If the learner has met all completion criteria, mark the enrollment complete
   * and issue (generate + persist) a certificate. Returns the current state.
   */
  async checkAndIssue(learnerId: string, courseId: string, actorId?: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
      select: { id: true, status: true },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    const status = await this.checkCompletion(learnerId, courseId);
    if (!status.complete) {
      return { issued: false, status, certificate: null };
    }

    const existing = await this.prisma.certificate.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
    });
    if (existing) {
      return { issued: false, alreadyExists: true, status, certificate: existing };
    }

    if (enrollment.status !== 'COMPLETED') {
      await this.prisma.enrollment.update({
        where: { id: enrollment.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });
    }

    const certificate = await this.issue(learnerId, courseId, actorId ?? learnerId);
    return { issued: true, status, certificate };
  }

  // Issue a certificate, generating + uploading the PDF asset.
  async issue(learnerId: string, courseId: string, actorId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
      select: { id: true, status: true },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status !== 'COMPLETED') {
      throw new BadRequestException('Course not yet completed by this learner');
    }

    const existing = await this.prisma.certificate.findUnique({
      where: { learnerId_courseId: { learnerId, courseId } },
      select: { id: true, fileUrl: true },
    });
    if (existing) return this.decorate(existing.id, existing.fileUrl);

    const [learner, course] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: learnerId },
        select: { firstName: true, lastName: true },
      }),
      this.prisma.course.findUnique({
        where: { id: courseId },
        select: { title: true },
      }),
    ]);
    if (!learner || !course) throw new NotFoundException('Learner or course not found');

    const certificateNo = `SICODIHUB-${new Date().getFullYear()}-${uuid().slice(0, 8).toUpperCase()}`;
    const issuedAt = new Date();

    const pdf = await generateCertificatePdf({
      learnerName: `${learner.firstName} ${learner.lastName}`,
      courseTitle: course.title,
      certificateNo,
      issuedAt,
    });

    const key = `certificates/${certificateNo}.pdf`;
    await this.storage.upload(key, pdf, 'application/pdf');

    const certificate = await this.prisma.certificate.create({
      data: { learnerId, courseId, certificateNo, fileUrl: key },
    });

    await this.auditService.log({
      actorId,
      action: 'CREATE',
      entity: 'Certificate',
      entityId: certificate.id,
    });

    // Notify + email the learner about their new certificate.
    await this.notificationsService.create(
      learnerId,
      'CERTIFICATE',
      'Certificate issued',
      `Congratulations! Your certificate for "${course.title}" is ready to download and share.`,
    );

    // Kick off the course-continuation email drip (next-course recommendations).
    await this.dripService.enqueueCompletionDrip(learnerId, courseId).catch(() => undefined);

    return this.decorate(certificate.id, certificate.fileUrl);
  }

  async myCertificates(learnerId: string) {
    const certs = await this.prisma.certificate.findMany({
      where: { learnerId },
      select: {
        id: true,
        certificateNo: true,
        issuedAt: true,
        fileUrl: true,
        course: { select: { id: true, title: true, slug: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
    return certs.map((c) => this.decorate(c.id, c.fileUrl, c.course, c.certificateNo, c.issuedAt));
  }

  async findAll() {
    const certs = await this.prisma.certificate.findMany({
      select: {
        id: true,
        certificateNo: true,
        issuedAt: true,
        fileUrl: true,
        learner: { select: { id: true, firstName: true, lastName: true, email: true } },
        course: { select: { id: true, title: true } },
      },
      orderBy: { issuedAt: 'desc' },
    });
    return certs.map((c) =>
      this.decorate(c.id, c.fileUrl, c.course, c.certificateNo, c.issuedAt, c.learner),
    );
  }

  async findOne(id: string, actorId: string, actorRole: Role) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      select: {
        id: true,
        learnerId: true,
        courseId: true,
        certificateNo: true,
        issuedAt: true,
        fileUrl: true,
        course: { select: { id: true, title: true, slug: true } },
        learner: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');
    if (actorRole === Role.LEARNER && certificate.learnerId !== actorId) {
      throw new ForbiddenException('Access denied');
    }
    return this.decorate(
      certificate.id,
      certificate.fileUrl,
      certificate.course,
      certificate.certificateNo,
      certificate.issuedAt,
      certificate.learner,
    );
  }

  /** Stream the certificate PDF file. */
  async downloadFile(id: string, actorId: string, actorRole: Role): Promise<StoredObject> {
    const certificate = await this.prisma.certificate.findUnique({
      where: { id },
      select: { id: true, learnerId: true, fileUrl: true },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');
    if (actorRole === Role.LEARNER && certificate.learnerId !== actorId) {
      throw new ForbiddenException('Access denied');
    }
    if (!certificate.fileUrl) throw new NotFoundException('Certificate file not available');
    return this.storage.download(certificate.fileUrl);
  }

  /** Build a public verification/share URL the learner can post anywhere. */
  verifyUrl(certificateNo: string): string {
    const base = this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    return `${base.replace(/\/$/, '')}/verify/certificate/${certificateNo}`;
  }

  async shareLinkedIn(id: string, actorId: string, actorRole: Role) {
    const cert = await this.findOne(id, actorId, actorRole);
    const no = cert.certificateNo ?? '';
    const url = encodeURIComponent(this.verifyUrl(no));
    const title = encodeURIComponent(`Certificate of Completion — ${cert.course?.title ?? ''}`);
    return {
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`,
      verifyUrl: this.verifyUrl(no),
    };
  }

  async shareEmail(
    id: string,
    actorId: string,
    actorRole: Role,
    recipientEmail: string,
    message?: string,
  ) {
    const cert = await this.findOne(id, actorId, actorRole);
    const no = cert.certificateNo ?? '';
    const verify = this.verifyUrl(no);
    await this.notificationsService.create(
      actorId,
      'SYSTEM',
      'Certificate shared',
      `Your certificate was shared via email to ${recipientEmail}.`,
    );
    await this.emailQueue.add('send-certificate-email', {
      recipientEmail,
      learnerName: cert.learnerName,
      courseTitle: cert.course?.title ?? '',
      certificateNo: no,
      verifyUrl: verify,
      message: message ?? '',
    });
    return { sent: true, verifyUrl: verify };
  }

  /** Public verification endpoint (no auth). */
  async verify(certificateNo: string) {
    const certificate = await this.prisma.certificate.findUnique({
      where: { certificateNo },
      select: {
        id: true,
        certificateNo: true,
        issuedAt: true,
        course: { select: { title: true, slug: true } },
        learner: { select: { firstName: true, lastName: true } },
      },
    });
    if (!certificate) throw new NotFoundException('Certificate not found');
    return {
      valid: true,
      certificateNo: certificate.certificateNo,
      issuedAt: certificate.issuedAt,
      courseTitle: certificate.course.title,
      learnerName: `${certificate.learner.firstName} ${certificate.learner.lastName}`,
    };
  }

  private decorate(
    id: string,
    fileUrl: string | null,
    course?: { id: string; title: string; slug?: string },
    certificateNo?: string,
    issuedAt?: Date,
    learner?: { id: string; firstName: string; lastName: string; email?: string },
  ) {
    const publicUrl = fileUrl ? this.storage.toPublicUrl(fileUrl) : null;
    return {
      id,
      certificateNo,
      issuedAt,
      fileUrl: publicUrl,
      downloadUrl: `/api/v1/certificates/${id}/file`,
      shareUrl: certificateNo ? this.verifyUrl(certificateNo) : null,
      course,
      learnerName: learner ? `${learner.firstName} ${learner.lastName}` : undefined,
      learner,
    };
  }
}
