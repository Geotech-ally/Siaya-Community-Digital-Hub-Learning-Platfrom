import { Module } from '@nestjs/common';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { AuditModule } from '../audit/audit.module';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [AuditModule, CertificatesModule],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
