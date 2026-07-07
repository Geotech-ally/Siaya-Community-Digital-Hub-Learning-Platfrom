import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AssignmentsService } from './assignments.service';
import { CreateAssignmentDto, SubmitAssignmentDto, GradeAssignmentDto } from './dto/assignment.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post()
  create(@Body() dto: CreateAssignmentDto, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.assignmentsService.create(dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('courses/:courseId')
  createForCourse(
    @Param('courseId') courseId: string,
    @Body() dto: Omit<CreateAssignmentDto, 'courseId'>,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.assignmentsService.createForCourse(courseId, dto, userId, role);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(courseId);
  }

  @Get('courses/:courseId/assignments')
  listByCourse(@Param('courseId') courseId: string) {
    return this.assignmentsService.findByCourse(courseId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: Partial<{ title: string; instructions: string; dueDate: string; maxScore: number }>,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.assignmentsService.update(id, dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.assignmentsService.remove(id, userId, role);
  }

  @Roles(Role.LEARNER)
  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() dto: SubmitAssignmentDto, @CurrentUser('userId') learnerId: string) {
    return this.assignmentsService.submit(id, dto, learnerId);
  }

  @Roles(Role.LEARNER)
  @Get('me/submissions')
  myEntries(@CurrentUser('userId') learnerId: string) {
    return this.assignmentsService.findMySubmissions(learnerId);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Get(':id/submissions')
  findSubmissions(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.assignmentsService.listSubmissions(id, userId, role, {
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch('submissions/:submissionId/grade')
  grade(
    @Param('submissionId') submissionId: string,
    @Body() dto: GradeAssignmentDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.assignmentsService.grade(submissionId, dto, userId, role);
  }
}
