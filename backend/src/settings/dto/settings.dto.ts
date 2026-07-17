import { IsBoolean, IsString, MaxLength } from 'class-validator';

export class UpdateSettingsDto {
  @IsBoolean()
  emailNotifications?: boolean;

  @IsBoolean()
  messageNotifications?: boolean;

  @IsBoolean()
  courseAnnouncements?: boolean;

  @IsBoolean()
  publicProfile?: boolean;

  @IsBoolean()
  shareCertificates?: boolean;

  @IsString()
  @MaxLength(16)
  theme?: string;

  @IsString()
  @MaxLength(8)
  language?: string;
}
