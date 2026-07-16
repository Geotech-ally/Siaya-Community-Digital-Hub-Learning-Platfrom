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

  async process(job: Job) {
    this.logger.log(`Processing email job ${job.id} (${job.name})`);

    if (job.name === 'send-certificate-email') {
      const data = job.data as {
        recipientEmail: string;
        learnerName?: string;
        courseTitle: string;
        certificateNo: string;
        verifyUrl: string;
        message?: string;
      };
      await this.integrationsService.sendCertificateEmail(data);
      return;
    }

    if (job.name === 'send-course-drip') {
      const data = job.data as {
        recipientEmail: string;
        learnerName?: string;
        completedCourseTitle: string;
        recommendations: { title: string; url: string }[];
      };
      await this.integrationsService.sendCourseDripEmail(data);
      return;
    }

    const data = job.data as { userId: string; title: string; message: string };
    await this.integrationsService.sendNotificationEmail(data.userId, data.title, data.message);
  }
}
