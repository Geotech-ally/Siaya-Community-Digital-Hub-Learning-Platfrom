import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
