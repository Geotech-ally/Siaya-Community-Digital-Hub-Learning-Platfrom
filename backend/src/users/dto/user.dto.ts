import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '@prisma/client';

// Admin-only creation of trainers (and other staff). The role is forced to
// TRAINER here; admins cannot be created through this endpoint to avoid
// self-escalation paths. Generic user creation uses CreateUserDto below.
export class CreateTrainerDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}

// Generic admin user creation (used by ADMIN to provision any role except
// another ADMIN — that is intentionally blocked to prevent privilege escalation).
export class CreateUserDto {
  @IsString()
  @MinLength(1)
  firstName: string;

  @IsString()
  @MinLength(1)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(Role)
  role: Role;

  @IsOptional()
  @IsString()
  createdByAdminId?: string;
}

export class ChangeRoleDto {
  @IsEnum(Role)
  role: Role;
}
