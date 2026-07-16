import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ReengagementService } from './reengagement.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [ScheduleModule, NotificationsModule],
  providers: [ReengagementService],
  exports: [ReengagementService],
})
export class ReengagementModule {}
