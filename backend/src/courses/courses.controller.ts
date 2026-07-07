import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CoursesService } from './courses.service';
import { CreateCourseDto, UpdateCourseDto, AssignTrainerDto } from './dto/course.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post()
  create(@Body() dto: CreateCourseDto, @CurrentUser('userId') userId: string) {
    return this.coursesService.create(dto, userId);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('department') department?: string,
    @Query('search') search?: string,
  ) {
    return this.coursesService.findAll({ status, department, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.coursesService.update(id, dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch(':id/publish')
  publish(
    @Param('id') id: string,
    @Body('isPublished') isPublished: boolean,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.coursesService.publish(id, isPublished, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Patch(':id/assign-trainer')
  assignTrainer(
    @Param('id') id: string,
    @Body() dto: AssignTrainerDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.coursesService.assignTrainer(id, dto, adminId);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.coursesService.remove(id, userId, role);
  }
}
