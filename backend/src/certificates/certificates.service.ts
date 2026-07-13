import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Role } from '@prisma/client';
import { v4 as uuid } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class CertificatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  // Issued automatically (or triggered by Admin) once a learner completes a course
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
      select: { id: true, learnerId: true, courseId: true, certificateNo: true, issuedAt: true, fileUrl: true },
    });
    if (existing) return existing;

    const certificateNo = `SICODIHUB-${new Date().getFullYear()}-${uuid().slice(0, 8).toUpperCase()}`;

    const certificate = await this.prisma.certificate.create({
      data: { learnerId, courseId, certificateNo },
    });

    await this.auditService.log({
      actorId,
      action: 'CREATE',
      entity: 'Certificate',
      entityId: certificate.id,
    });

    return certificate;
  }

  // Learner downloads own certificates
  async myCertificates(learnerId: string) {
    return this.prisma.certificate.findMany({
      where: { learnerId },
      select: { id: true, certificateNo: true, issuedAt: true, fileUrl: true, course: { select: { id: true, title: true } } },
      orderBy: { issuedAt: 'desc' },
    });
  }

  // Admin: manage/view all certificates
  async findAll() {
    return this.prisma.certificate.findMany({
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

    return certificate;
  }

  async download(id: string, actorId: string, actorRole: Role) {
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

    return {
      ...certificate,
      downloadUrl: certificate.fileUrl || `/api/v1/certificates/${id}/file`,
    };
  }
}
