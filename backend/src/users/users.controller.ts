import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateTrainerDto, CreateUserDto, ChangeRoleDto } from './dto/user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminUserController {
  constructor(private readonly usersService: UsersService) {}

  // ADMIN-only trainer provisioning. Endpoint required by the RBAC spec.
  @Roles(Role.ADMIN)
  @Post('trainers')
  createTrainer(
    @Body() dto: CreateTrainerDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.usersService.createTrainer(dto, adminId);
  }

  @Roles(Role.ADMIN)
  @Post('users')
  createUser(@Body() dto: CreateUserDto, @CurrentUser('userId') adminId: string) {
    return this.usersService.createUser(dto, adminId);
  }

  @Roles(Role.ADMIN)
  @Get('users')
  listUsers(@CurrentUser('role') role: Role) {
    return this.usersService.listUsers(role);
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id/role')
  changeRole(
    @Param('id') id: string,
    @Body() dto: ChangeRoleDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.usersService.changeRole(id, dto, adminId);
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id/activate')
  activate(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.usersService.setActive(id, true, adminId);
  }

  @Roles(Role.ADMIN)
  @Patch('users/:id/deactivate')
  deactivate(
    @Param('id') id: string,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.usersService.setActive(id, false, adminId);
  }
}

// Authenticated current-user profile. Used by the frontend `hydrate()` flow.
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('userId') userId: string) {
    return this.usersService.getProfile(userId);
  }
}
