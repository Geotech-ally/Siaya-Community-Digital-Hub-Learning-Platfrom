import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateUserStatusDto } from './dto/update-user.dto';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: { fullName: string; email: string; password: string; role: Role }, adminId: string) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const [firstName, ...rest] = dto.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
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
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }

    const [firstName, ...rest] = dto.fullName.trim().split(/\s+/);
    const lastName = rest.join(' ') || firstName;
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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(this.sanitize);
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.sanitize(user);
  }

  async update(id: string, data: { fullName?: string; email?: string; role?: Role }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = {};
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.fullName) {
      const [firstName, ...rest] = data.fullName.trim().split(/\s+/);
      updateData.firstName = firstName;
      updateData.lastName = rest.join(' ') || firstName;
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updateData,
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
    const user = await this.prisma.user.findUnique({ where: { id } });
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

  // Admin: activate / deactivate any user
  async setActiveStatus(id: string, dto: UpdateUserStatusDto, adminId: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive: dto.isActive },
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

  private sanitize(user: { id: string; email: string; firstName: string; lastName: string; role: Role; isActive: boolean; createdAt: Date }) {
    const { passwordHash: _omit, refreshToken: _omit2, ...safe } = user as any;
    return {
      ...safe,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    };
  }
}
