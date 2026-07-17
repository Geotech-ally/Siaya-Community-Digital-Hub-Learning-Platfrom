import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DripService } from './drip.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [ScheduleModule, QueueModule],
  providers: [DripService],
  exports: [DripService],
})
export class DripModule {}
