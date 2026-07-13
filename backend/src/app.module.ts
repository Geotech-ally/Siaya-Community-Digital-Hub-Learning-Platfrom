import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';
import { QueueModule } from './queue/queue.module';

import { AuthModule } from './auth/auth.module';
import { PublicModule } from './public/public.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AssignmentsModule } from './assignments/assignments.module';
import { ProgressModule } from './progress/progress.module';
import { CertificatesModule } from './certificates/certificates.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { AuditModule } from './audit/audit.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { AiModule } from './ai/ai.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),

    // Infrastructure Layer
    PrismaModule,
    RedisModule,
    QueueModule,

    // Core API + Integration Layer
    PublicModule,
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    EnrollmentsModule,
    QuizzesModule,
    AssignmentsModule,
    ProgressModule,
    CertificatesModule,
    NotificationsModule,
    AnalyticsModule,
    DashboardModule,
    AuditModule,
    IntegrationsModule,
    AiModule,
  ],
  providers: [
    // Global rate limiting
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    // Global JWT authentication (routes opt out via @Public())
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    // Global RBAC enforcement (routes opt in via @Roles())
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
