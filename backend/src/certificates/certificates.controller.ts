import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { CertificatesService } from './certificates.service';
import { ShareCertificateEmailDto } from './dto/certificate.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Roles(Role.ADMIN)
  @Post('issue/learner/:learnerId/course/:courseId')
  issue(
    @Param('learnerId') learnerId: string,
    @Param('courseId') courseId: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.certificatesService.issue(learnerId, courseId, adminId);
  }

  // Learner triggers a completion check; auto-issues the certificate if eligible.
  @Roles(Role.LEARNER)
  @Post('check/learner/:learnerId/course/:courseId')
  checkAndIssue(
    @Param('learnerId') learnerId: string,
    @Param('courseId') courseId: string,
    @CurrentUser('userId') actorId: string,
  ) {
    return this.certificatesService.checkAndIssue(learnerId, courseId, actorId);
  }

  @Roles(Role.LEARNER)
  @Get('me')
  myCertificates(@CurrentUser('userId') learnerId: string) {
    return this.certificatesService.myCertificates(learnerId);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll() {
    return this.certificatesService.findAll();
  }

  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.certificatesService.findOne(id, userId, role);
  }

  @Get(':id/file')
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.certificatesService.downloadFile(id, userId, role);
    res.setHeader('Content-Type', file.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="certificate-${id}.pdf"`);
    return new StreamableFile(file.stream as any, { type: file.contentType });
  }

  @Roles(Role.LEARNER)
  @Post(':id/share/email')
  shareEmail(
    @Param('id') id: string,
    @Body() dto: ShareCertificateEmailDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.certificatesService.shareEmail(
      id,
      userId,
      role,
      dto.recipientEmail,
      dto.message,
    );
  }

  @Roles(Role.LEARNER)
  @Get(':id/share/linkedin')
  shareLinkedIn(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.certificatesService.shareLinkedIn(id, userId, role);
  }

  // Public certificate verification (no auth) — used by share/LinkedIn links.
  @Public()
  @Get('verify/:certificateNo')
  verify(@Param('certificateNo') certificateNo: string) {
    return this.certificatesService.verify(certificateNo);
  }
}
