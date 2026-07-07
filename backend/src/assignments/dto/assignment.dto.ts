import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateAssignmentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  instructions: string;

  @IsNotEmpty()
  @IsString()
  courseId: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxScore?: number;
}

export class SubmitAssignmentDto {
  @IsOptional()
  @IsString()
  textResponse?: string;

  @IsOptional()
  @IsString()
  fileUrl?: string;
}

export class GradeAssignmentDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  grade?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}
