import { Injectable } from '@nestjs/common';
import { AuditAction } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

interface LogParams {
  actorId: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(params: LogParams) {
    return this.prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: params.metadata,
      },
    });
  }

  // Admin-only: full audit trail, optionally filtered
  async findAll(filters: { entity?: string; actorId?: string; from?: Date; to?: Date }) {
    return this.prisma.auditLog.findMany({
      where: {
        entity: filters.entity,
        actorId: filters.actorId,
        createdAt: {
          gte: filters.from,
          lte: filters.to,
        },
      },
      orderBy: { createdAt: 'desc' },
      include: { actor: { select: { id: true, email: true, role: true } } },
    });
  }
}
