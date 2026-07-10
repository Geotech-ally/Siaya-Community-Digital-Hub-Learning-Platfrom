import { IsEmail, IsOptional, IsString } from 'class-validator';

export class UpdateUserStatusDto {
  @IsOptional()
  isActive?: boolean;
}

export class UpdateUserProfileDto {
  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
