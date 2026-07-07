import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { IsNotEmpty, IsString } from 'class-validator';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

class BroadcastDto {
  title: string;
  body: string;
  courseId?: string;
}

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Roles(Role.ADMIN, Role.TRAINER)
  @Post('course/:courseId/broadcast')
  broadcast(@Param('courseId') courseId: string, @Body() dto: BroadcastDto) {
    return this.notificationsService.broadcastToCourse(courseId, dto.title, dto.body);
  }

  @Get('me')
  findMine(@CurrentUser('userId') userId: string) {
    return this.notificationsService.findMine(userId);
  }

  @Patch(':id/read')
  markRead(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.notificationsService.markRead(id, userId);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser('userId') userId: string) {
    return this.notificationsService.markAllRead(userId);
  }

  @Roles(Role.ADMIN)
  @Get('announcements')
  listAnnouncements(@Query('courseId') courseId?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.notificationsService.listAnnouncements({
      courseId,
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
    });
  }

  @Roles(Role.ADMIN)
  @Post('announcements')
  createAnnouncement(@Body() dto: BroadcastDto, @CurrentUser('userId') userId: string) {
    return this.notificationsService.createAnnouncement(dto, userId);
  }

  @Roles(Role.ADMIN)
  @Delete('announcements/:id')
  removeAnnouncement(@Param('id') id: string) {
    return this.notificationsService.removeAnnouncement(id);
  }
}
