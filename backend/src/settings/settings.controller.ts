import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { SettingsService } from './settings.service';
import { UpdateSettingsDto } from './dto/settings.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('me')
  getMine(@CurrentUser('userId') userId: string) {
    return this.settingsService.getOrCreate(userId);
  }

  @Patch('me')
  updateMine(@CurrentUser('userId') userId: string, @Body() dto: UpdateSettingsDto) {
    return this.settingsService.update(userId, dto);
  }
}
