import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
