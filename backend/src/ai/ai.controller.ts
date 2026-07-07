import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { AiService } from './ai.service';

class AssistDto {
  question: string;
  courseId?: string;
  context?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('suggest-quiz-questions')
  suggestQuestions(@Body('content') content: string) {
    return this.aiService.suggestQuizQuestions(content);
  }

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('summarize-lesson')
  summarize(@Body('content') content: string) {
    return this.aiService.summarizeLesson(content);
  }

  @Roles(Role.LEARNER, Role.TRAINER, Role.ADMIN)
  @Post('assist')
  assist(@Body() dto: AssistDto) {
    return this.aiService.assist(dto.question, dto.courseId, dto.context);
  }
}
