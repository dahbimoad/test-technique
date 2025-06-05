import {
  IsString,
  IsOptional,
  IsHexColor,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new tag
 * Used when users want to create custom tags for better project organization
 */
export class CreateTagDto {
  @ApiProperty({
    description: 'Tag name - must be unique across the system',
    example: 'urgent',
    minLength: 1,
    maxLength: 50,
  })
  @IsString()
  @MinLength(1, { message: 'Tag name cannot be empty' })
  @MaxLength(50, { message: 'Tag name cannot exceed 50 characters' })
  name: string;

  @ApiPropertyOptional({
    description: 'Hex color code for the tag (includes #)',
    example: '#ff4444',
    default: '#6366f1',
  })
  @IsOptional()
  @IsHexColor({ message: 'Color must be a valid hex color code' })
  color?: string;

  @ApiPropertyOptional({
    description: 'Optional description explaining when to use this tag',
    example: 'Use for high-priority tasks that need immediate attention',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: 'Description cannot exceed 200 characters' })
  description?: string;
}
