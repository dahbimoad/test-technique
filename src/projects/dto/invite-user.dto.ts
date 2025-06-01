import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';
import { Role } from '@prisma/client';

/**
 * DTO for inviting a user to a project
 * Validates email and role assignment
 */
export class InviteUserDto {
  @ApiProperty({
    description: 'Email of the user to invite',
    example: 'john.doe@example.com',
    format: 'email'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  email: string;

  @ApiProperty({
    description: 'Role to assign to the invited user',
    example: 'CONTRIBUTOR',
    enum: Role,
    enumName: 'Role'
  })
  @IsEnum(Role, { message: 'Role must be one of: OWNER, CONTRIBUTOR, VIEWER' })
  role: Role;
}
