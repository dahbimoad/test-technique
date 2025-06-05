import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for creating a new project
 * Validates project name and description input
 */
export class CreateProjectDto {
  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Platform',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty({ message: 'Project name is required' })
  @MinLength(3, { message: 'Project name must be at least 3 characters long' })
  @MaxLength(100, { message: 'Project name must not exceed 100 characters' })
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'A modern e-commerce platform built with NestJS and React',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'Project description is required' })
  @MinLength(10, {
    message: 'Project description must be at least 10 characters long',
  })
  @MaxLength(500, {
    message: 'Project description must not exceed 500 characters',
  })
  @Transform(({ value }) => value?.trim())
  description: string;
}
