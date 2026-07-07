import { IsNotEmpty, IsString } from 'class-validator';

export class MarkLessonCompleteDto {
  @IsNotEmpty()
  @IsString()
  lessonId: string;
}
