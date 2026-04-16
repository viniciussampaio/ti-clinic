import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginCredentialsDto {
  @ApiProperty({ example: 'user@clinic.com', description: 'Registered email' })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'SecurePass1',
    description: 'Password (min 8 characters)',
    minLength: 8,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;
}
