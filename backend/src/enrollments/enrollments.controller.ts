import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/enrollment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles(Role.LEARNER)
  @Post()
  enroll(@Body() dto: CreateEnrollmentDto, @CurrentUser('userId') learnerId: string) {
    return this.enrollmentsService.enroll(dto, learnerId);
  }

  @Roles(Role.LEARNER)
  @Get('me')
  findMine(@CurrentUser('userId') learnerId: string) {
    return this.enrollmentsService.findMyEnrollments(learnerId);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Get('course/:courseId')
  findByCourse(
    @Param('courseId') courseId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.enrollmentsService.findByCourse(courseId, userId, role);
  }

  @Roles(Role.LEARNER)
  @Get('courses/:courseId/enrollments')
  listMineByCourse(@CurrentUser('userId') learnerId: string, @Param('courseId') courseId: string) {
    return this.enrollmentsService.findByCourse(courseId, learnerId, 'LEARNER' as Role);
  }

  @Roles(Role.ADMIN)
  @Get()
  all(@Query('status') status?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.enrollmentsService.findAll({
      status: status as any,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Roles(Role.LEARNER)
  @Post('courses/:courseId/enroll')
  enrollInCourse(@Param('courseId') courseId: string, @CurrentUser('userId') learnerId: string) {
    return this.enrollmentsService.enrollByCourseId(courseId, learnerId);
  }

  @Roles(Role.LEARNER)
  @Delete('courses/:courseId/enroll')
  unenrollFromCourse(@Param('courseId') courseId: string, @CurrentUser('userId') learnerId: string) {
    return this.enrollmentsService.unenrollByCourseId(courseId, learnerId);
  }
}
