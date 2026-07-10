import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto, UpdateUserProfileDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser('userId') userId: string) {
    return this.usersService.getOwnProfile(userId);
  }

  @Patch('me')
  updateMe(@CurrentUser('userId') userId: string, @Body() dto: UpdateUserProfileDto) {
    return this.usersService.updateOwnProfile(userId, dto);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Body() dto: CreateUserDto, @CurrentUser('userId') adminId: string) {
    return this.usersService.create(dto, adminId);
  }

  @Roles(Role.ADMIN)
  @Post('trainers')
  createTrainer(@Body() dto: CreateUserDto, @CurrentUser('userId') adminId: string) {
    return this.usersService.createTrainer(dto, adminId);
  }

  @Roles(Role.ADMIN)
  @Get()
  findAll(@Query('role') role?: Role, @Query('search') search?: string) {
    return this.usersService.findAll(role, search);
  }

  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserProfileDto) {
    return this.usersService.update(id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/activate')
  activate(@Param('id') id: string, @CurrentUser('userId') adminId: string) {
    return this.usersService.activate(id, adminId);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/deactivate')
  deactivate(@Param('id') id: string, @CurrentUser('userId') adminId: string) {
    return this.usersService.deactivate(id, adminId);
  }

  @Roles(Role.ADMIN)
  @Patch(':id/status')
  setStatus(
    @Param('id') id: string,
    @Body() dto: UpdateUserStatusDto,
    @CurrentUser('userId') adminId: string,
  ) {
    return this.usersService.setActiveStatus(id, dto, adminId);
  }

}
