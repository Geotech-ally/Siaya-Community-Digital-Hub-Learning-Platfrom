import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateUserStatusDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';

function splitName(name: string) {
  const [firstName, ...rest] = name.trim().split(/\s+/);
  return {
    firstName,
    lastName: rest.join(' ') || firstName,
  };
}

type SafeUserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: { fullName: string; email: string; password: string; role: Role }, adminId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const { firstName, lastName } = splitName(dto.fullName);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName,
        lastName,
        role: dto.role,
        createdByAdminId: adminId,
      },
      select: this.safeUserSelect(),
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      metadata: { role: dto.role, createdBy: 'ADMIN' },
    });

    return this.sanitize(user);
  }

  async createTrainer(dto: CreateTrainerDto, adminId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email }, select: { id: true } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const { firstName, lastName } = splitName(dto.fullName);
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const trainer = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName,
        lastName,
        role: Role.TRAINER,
        createdByAdminId: adminId,
      },
      select: this.safeUserSelect(),
    });

    await this.auditService.log({
      actorId: adminId,
      action: 'CREATE',
      entity: 'User',
      entityId: trainer.id,
      metadata: { role: Role.TRAINER, createdBy: 'ADMIN' },
    });

    return this.sanitize(trainer);
  }

  async findAll(role?: Role, search?: string) {
    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await this.prisma.user.findMany({
      where,
      select: this.safeUserSelect(),
      orderBy: { createdAt: 'desc' },
    });
    return users.map(this.sanitize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.safeUserSelect(),
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(id: string, data: { fullName?: string; email?: string; role?: Role; isActive?: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true, email: true } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (data.fullName !== undefined) Object.assign(updateData, splitName(data.fullName));
    if (data.email !== undefined && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
      if (existing) throw new ConflictException('An account with this email already exists');
      updateData.email = data.email;
    }
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
      select: this.safeUserSelect(),
    });

    await this.auditService.log({
      actorId: id,
      action: 'UPDATE',
      entity: 'User',
      entityId: id,
    });

    return this.sanitize(updated);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.user.delete({ where: { id } });

    await this.auditService.log({
      actorId: id,
      action: 'DELETE',
      entity: 'User',
      entityId: id,
    });

    return { message: 'User deleted' };
  }

  async activate(id: string, adminId: string) {
    return this.setActiveStatus(id, { isActive: true }, adminId);
  }

  async deactivate(id: string, adminId: string) {
    return this.setActiveStatus(id, { isActive: false }, adminId);
  }

  async setActiveStatus(id: string, dto: UpdateUserStatusDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
      select: this.safeUserSelect(),
    });

    await this.auditService.log({
      actorId: adminId,
      action: dto.isActive ? 'ACTIVATE' : 'DEACTIVATE',
      entity: 'User',
      entityId: id,
    });

    return this.sanitize(updated);
  }

  async getOwnProfile(userId: string) {
    return this.findOne(userId);
  }

  async updateOwnProfile(
    userId: string,
    data: { fullName?: string; email?: string },
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, email: true } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: { firstName?: string; lastName?: string; email?: string } = {};
    if (data.fullName !== undefined) Object.assign(updateData, splitName(data.fullName));
    if (data.email !== undefined && data.email !== user.email) {
      const existing = await this.prisma.user.findUnique({ where: { email: data.email }, select: { id: true } });
      if (existing) throw new ConflictException('An account with this email already exists');
      updateData.email = data.email;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: this.safeUserSelect(),
    });
    await this.auditService.log({
      actorId: userId,
      action: 'UPDATE',
      entity: 'User',
      entityId: userId,
      metadata: { selfProfile: true },
    });

    return this.sanitize(updated);
  }

  private safeUserSelect() {
    return {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    } as const;
  }

  private sanitize(user: SafeUserRecord) {
    const { firstName, lastName, ...safe } = user;
    return {
      ...safe,
      fullName: `${firstName} ${lastName}`.trim(),
    };
  }
}
