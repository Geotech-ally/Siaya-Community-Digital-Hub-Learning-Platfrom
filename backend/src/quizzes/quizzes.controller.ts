import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { QuestionType } from '@prisma/client';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto, SubmitQuizDto } from './dto/quiz.dto';

class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  passingScorePercent?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitMinutes?: number;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post()
  create(
    @Body() dto: CreateQuizDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.quizzesService.create(dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('courses/:courseId')
  createForCourse(
    @Param('courseId') courseId: string,
    @Body() dto: Omit<CreateQuizDto, 'courseId'>,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.quizzesService.create({ ...dto, courseId }, userId, role);
  }

  @Get('course/:courseId')
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.findByCourse(courseId);
  }

  @Get('courses/:courseId/quizzes')
  listByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.findByCourse(courseId);
  }

  @Roles(Role.LEARNER)
  @Get(':id')
  findOneForLearner(@Param('id') id: string) {
    return this.quizzesService.findOneForLearner(id);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Get(':id/full')
  findOneForStaff(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.quizzesService.findOneForStaff(id, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.quizzesService.update(id, dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser('userId') userId: string, @CurrentUser('role') role: Role) {
    return this.quizzesService.remove(id, userId, role);
  }

  @Roles(Role.LEARNER)
  @Post(':id/attempts')
  submitAttempt(
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser('userId') learnerId: string,
  ) {
    return this.quizzesService.submit(id, dto, learnerId);
  }

  @Roles(Role.LEARNER)
  @Get(':id/attempts/me')
  myAttempts(@Param('id') id: string, @CurrentUser('userId') learnerId: string) {
    return this.quizzesService.findMySubmissions(learnerId, id);
  }

  @Roles(Role.LEARNER)
  @Post(':id/submit')
  submit(
    @Param('id') id: string,
    @Body() dto: SubmitQuizDto,
    @CurrentUser('userId') learnerId: string,
  ) {
    return this.quizzesService.submit(id, dto, learnerId);
  }

  @Roles(Role.LEARNER)
  @Get(':id/my-submissions')
  myQuizSubmissions(@Param('id') id: string, @CurrentUser('userId') learnerId: string) {
    return this.quizzesService.findMySubmissions(learnerId, id);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Get(':id/submissions')
  findSubmissions(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.quizzesService.findSubmissionsForQuiz(id, userId, role);
  }
}
