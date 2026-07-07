import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EMAIL_QUEUE } from '../queue/queue.module';
import { IntegrationsService } from '../integrations/integrations.service';

@Processor(EMAIL_QUEUE)
export class EmailProcessor extends WorkerHost {
  private readonly logger = new Logger(EmailProcessor.name);

  constructor(private readonly integrationsService: IntegrationsService) {
    super();
  }

  async process(job: Job<{ userId: string; title: string; message: string }>) {
    this.logger.log(`Processing email job ${job.id} for user ${job.data.userId}`);
    await this.integrationsService.sendNotificationEmail(job.data.userId, job.data.title, job.data.message);
  }
}
