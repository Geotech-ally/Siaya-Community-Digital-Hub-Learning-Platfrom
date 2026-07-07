import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class CreateTrainerDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @IsNotEmpty()
  fullName: string;
}
