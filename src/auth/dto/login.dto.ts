import { IsEmail, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDto {
  @ApiProperty({
    description: 'User email address (case insensitive)',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123'
  })
  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}