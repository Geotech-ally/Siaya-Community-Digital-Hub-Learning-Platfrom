import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CourseStatus, Department } from '@prisma/client';

export class CreateCourseDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsEnum(Department)
  department: Department;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsString()
  categoryId?: string;
}

export class AssignTrainerDto {
  @IsNotEmpty()
  @IsString()
  trainerId: string;
}
