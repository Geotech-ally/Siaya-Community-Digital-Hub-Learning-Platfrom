import {
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuditService } from '../audit/audit.service';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async register(dto: RegisterDto) {
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
        role: Role.LEARNER,
      },
    });

    await this.auditService.log({
      actorId: user.id,
      action: 'CREATE',
      entity: 'User',
      entityId: user.id,
      metadata: { selfRegistered: true, role: Role.LEARNER },
    });

    const tokens = await this.issueTokens(user.id, user.role, user.email);
    return { ...tokens, user: this.sanitize(user) };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new ForbiddenException('This account has been deactivated. Contact an administrator.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user.id, user.role, user.email);

    await this.auditService.log({
      actorId: user.id,
      action: 'LOGIN',
      entity: 'User',
      entityId: user.id,
    });

    return { ...tokens, user: this.sanitize(user) };
  }

  async refresh(userId: string, providedRefreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Access denied');
    }

    const matches = await bcrypt.compare(providedRefreshToken, user.refreshToken);
    if (!matches) {
      throw new UnauthorizedException('Access denied');
    }

    const tokens = await this.issueTokens(user.id, user.role, user.email);
    return { ...tokens, user: this.sanitize(user) };
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    await this.auditService.log({
      actorId: userId,
      action: 'LOGOUT',
      entity: 'User',
      entityId: userId,
    });

    return { message: 'Logged out successfully' };
  }

  private async issueTokens(userId: string, role: Role, email: string): Promise<AuthTokens> {
    const payload = { userId, role, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: refreshTokenHash },
    });

    return { accessToken, refreshToken };
  }

  private sanitize(user: { id: string; email: string; firstName: string; lastName: string; role: Role; isActive: boolean; createdAt: Date }) {
    const { passwordHash: _omit, refreshToken: _omit2, ...safe } = user as any;
    return {
      ...safe,
      fullName: `${user.firstName} ${user.lastName}`.trim(),
    };
  }
}
