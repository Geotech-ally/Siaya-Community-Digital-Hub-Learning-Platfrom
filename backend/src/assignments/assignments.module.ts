import { Module } from '@nestjs/common';
import { AssignmentsService } from './assignments.service';
import { AssignmentsController } from './assignments.controller';
import { AuditModule } from '../audit/audit.module';
import { CertificatesModule } from '../certificates/certificates.module';

@Module({
  imports: [AuditModule, CertificatesModule],
  controllers: [AssignmentsController],
  providers: [AssignmentsService],
  exports: [AssignmentsService],
})
export class AssignmentsModule {}
