import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CertificatesService } from './certificates.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('certificates')
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Roles(Role.ADMIN)
  @Post('issue/learner/:learnerId/course/:courseId')
  issue(@Param('learnerId') learnerId: string, @Param('courseId') courseId: string, @CurrentUser('userId') adminId: string) {
    return this.certificatesService.issue(learnerId, courseId, adminId);
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
  findOne(@Param('id') id: string, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.certificatesService.findOne(id, userId, role);
  }

  @Get(':id/download')
  download(@Param('id') id: string, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.certificatesService.download(id, userId, role);
  }
}
