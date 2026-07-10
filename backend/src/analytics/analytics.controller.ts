import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(Role.ADMIN)
  @Get('platform')
  platform() {
    return this.analyticsService.platform();
  }

  @Roles(Role.TRAINER, Role.ADMIN)
  @Get('trainer')
  trainer(@CurrentUser('userId') userId: string) {
    return this.analyticsService.trainer(userId);
  }

  @Get('dashboard-summary')
  dashboardSummary(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.analyticsService.dashboardSummary(userId, role);
  }

  @Get('weekly-report')
  weeklyReport() {
    return this.analyticsService.weeklyReport();
  }

  @Get('user-activity/:userId')
  userActivity(@Param('userId') userId: string) {
    return this.analyticsService.userActivity(userId);
  }

  @Get('course-completion-rates')
  courseCompletionRates() {
    return this.analyticsService.courseCompletionRates();
  }

  @Get('learner-engagement')
  learnerEngagement() {
    return this.analyticsService.learnerEngagement();
  }
}
