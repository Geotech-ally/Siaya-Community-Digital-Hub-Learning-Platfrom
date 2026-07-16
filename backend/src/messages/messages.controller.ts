import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/message.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Roles(Role.ADMIN, Role.TRAINER, Role.LEARNER)
  @Post()
  send(
    @Body() dto: SendMessageDto,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.messagesService.send(dto, userId, role);
  }

  @Roles(Role.ADMIN, Role.TRAINER, Role.LEARNER)
  @Get('conversations')
  conversations(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
    @Query('courseId') courseId?: string,
  ) {
    return this.messagesService.conversations(userId, role, courseId);
  }

  @Roles(Role.ADMIN, Role.TRAINER, Role.LEARNER)
  @Get('course/:courseId/with/:userId')
  thread(
    @Param('courseId') courseId: string,
    @Param('userId') otherUserId: string,
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.messagesService.thread(courseId, otherUserId, userId, role);
  }
}
