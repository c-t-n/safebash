import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  // MaxLength(72): bcrypt silently truncates beyond 72 bytes
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;
}
