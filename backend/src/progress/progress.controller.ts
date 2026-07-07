import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Roles(Role.LEARNER)
  @Post('complete-lesson')
  markComplete(
    @Body('courseId') courseId: string,
    @Body('lessonId') lessonId: string,
    @CurrentUser('userId') learnerId: string,
  ) {
    return this.progressService.markComplete(courseId, lessonId, learnerId);
  }

  @Roles(Role.LEARNER)
  @Get('me')
  myProgress(@CurrentUser('userId') learnerId: string) {
    return this.progressService.myProgress(learnerId);
  }

  @Roles(Role.LEARNER)
  @Get('me/course/:courseId')
  myCourseProgress(@Param('courseId') courseId: string, @CurrentUser('userId') learnerId: string) {
    return this.progressService.myCourseProgress(learnerId, courseId);
  }

  @Roles(Role.LEARNER)
  @Get('courses/:courseId')
  courseProgress(@Param('courseId') courseId: string, @CurrentUser('userId') learnerId: string) {
    return this.progressService.myCourseProgress(learnerId, courseId);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Get('learner/:learnerId/course/:courseId')
  learnerProgress(
    @Param('learnerId') learnerId: string,
    @Param('courseId') courseId: string,
    @CurrentUser('userId') actorId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.progressService.learnerCourseProgress(learnerId, courseId, actorId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Get('courses/:courseId/learners/:learnerId')
  learnerProgressAlt(
    @Param('courseId') courseId: string,
    @Param('learnerId') learnerId: string,
    @CurrentUser('userId') actorId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.progressService.learnerCourseProgress(learnerId, courseId, actorId, role);
  }
}
