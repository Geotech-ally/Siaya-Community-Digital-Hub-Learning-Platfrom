import { Controller, Get } from '@nestjs/common';
import { Role } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getDashboard(
    @CurrentUser('userId') userId: string,
    @CurrentUser('role') role: Role,
  ) {
    return this.dashboardService.getDashboard(userId, role);
  }
}
