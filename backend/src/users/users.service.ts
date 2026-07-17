import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { CreateTrainerDto, CreateUserDto, ChangeRoleDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  private safeSelect() {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
      createdByAdminId: true,
    } as const;
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: this.safeSelect(),
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ADMIN-only: create a TRAINER. Role is hard-coded to TRAINER so it can never
  // be escalated to ADMIN via this endpoint.
  async createTrainer(dto: CreateTrainerDto, adminId: string) {
    return this.createUserWithRole(
      {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: dto.password,
        role: Role.TRAINER,
      },
      adminId,
    );
  }

  // ADMIN-only: generic user creation. Refuses to create additional ADMINs.
  async createUser(dto: CreateUserDto, adminId: string) {
    if (dto.role === Role.ADMIN) {
      throw new ForbiddenException('Admins cannot be created through this endpoint');
    }
    return this.createUserWithRole(dto, adminId);
  }

  private async createUserWithRole(
    dto: { firstName: string; lastName: string; email: string; password: string; role: Role },
    adminId: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role,
        createdByAdminId: adminId,
      },
      select: this.safeSelect(),
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      metadata: { role: user.role, createdByAdmin: true },
    });

    return user;
  }

  async listUsers(actorRole: Role) {
    if (actorRole !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can list users');
    }
    return this.prisma.user.findMany({
      select: this.safeSelect(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async changeRole(targetUserId: string, dto: ChangeRoleDto, actorId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, email: true },
    });
    if (!target) throw new NotFoundException('User not found');

    if (dto.role === Role.ADMIN) {
      throw new ForbiddenException('Cannot grant ADMIN role through this endpoint');
    }

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { role: dto.role },
      select: this.safeSelect(),
    });

    await this.auditService.log({
      actorId,
      action: 'ROLE_CHANGE',
      entity: 'User',
      entityId: targetUserId,
      metadata: { from: target.role, to: dto.role },
    });

    return updated;
  }

  async setActive(targetUserId: string, isActive: boolean, actorId: string) {
    const target = await this.prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true },
    });
    if (!target) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id: targetUserId },
      data: { isActive },
      select: this.safeSelect(),
    });

    await this.auditService.log({
      actorId,
      action: isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entity: 'User',
      entityId: targetUserId,
      metadata: { role: target.role },
    });

    return updated;
  }
}
