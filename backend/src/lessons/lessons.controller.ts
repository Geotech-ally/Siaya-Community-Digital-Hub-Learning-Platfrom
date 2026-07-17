import { Body, Controller, Delete, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { LessonsService } from './lessons.service';
import { CreateModuleDto, CreateLessonDto, UpdateLessonDto } from './dto/lesson.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('modules')
  createModule(
    @Body() dto: CreateModuleDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.lessonsService.createModule(dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('lessons')
  createLesson(
    @Body() dto: CreateLessonDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.lessonsService.createLesson(dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch('lessons/:id')
  updateLesson(
    @Param('id') id: string,
    @Body() dto: UpdateLessonDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.lessonsService.updateLesson(id, dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Delete('lessons/:id')
  removeLesson(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.lessonsService.removeLesson(id, userId, role);
  }

  // All roles: view full structured content for a course (no PDFs)
  @Public()
  @Get('courses/:courseId/content')
  findByCourse(@Param('courseId') courseId: string) {
    return this.lessonsService.findLessonsByCourse(courseId);
  }

  @Public()
  @Get('courses/:courseId/lessons')
  listLessonsByCourse(@Param('courseId') courseId: string) {
    return this.lessonsService.findLessonsByCourse(courseId);
  }

  @Public()
  @Get('courses/:courseId/lessons/:id')
  findOneByCourse(@Param('courseId') courseId: string, @Param('id') id: string) {
    const lesson = this.lessonsService.findLessonById(id).catch(() => {
      throw new NotFoundException('Lesson not found');
    });
    return lesson;
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('courses/:courseId/lessons')
  createLessonByCourse(@Param('courseId') courseId: string, @Body() dto: CreateLessonDto, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.lessonsService.createLesson({ ...dto, courseId }, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch('courses/:courseId/lessons/:id')
  updateLessonByCourse(@Param('courseId') courseId: string, @Param('id') id: string, @Body() dto: UpdateLessonDto, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.lessonsService.updateLesson(id, dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Delete('courses/:courseId/lessons/:id')
  removeLessonByCourse(@Param('courseId') courseId: string, @Param('id') id: string, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.lessonsService.removeLesson(id, userId, role);
  }

  @Roles(Role.LEARNER)
  @Post('courses/:courseId/lessons/:lessonId/complete')
  markComplete(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser('userId') learnerId: string,
  ) {
    return this.lessonsService.markComplete(courseId, lessonId, learnerId);
  }

  @Get('lessons/:id')
  findOne(@Param('id') id: string) {
    return this.lessonsService.findLessonById(id);
  }
}
