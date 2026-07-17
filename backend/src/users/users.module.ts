import { Module } from '@nestjs/common';
import { UsersController, AdminUserController } from './users.controller';
import { UsersService } from './users.service';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [AuditModule],
  controllers: [AdminUserController, UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
