import { IsArray, IsString, ArrayNotEmpty, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for adding tags to a project
 * Accepts an array of existing tag IDs to be associated with a project
 * All provided tag IDs must exist in the database
 */
export class AddTagsToProjectDto {
  @ApiProperty({
    description:
      'Array of existing tag IDs to add to the project. All tag IDs must be valid and exist in the database.',
    example: [
      'clx1tag123456789abcdef',
      'clx2tag987654321fedcba',
      'clx3tag567890123456789',
    ],
    type: [String],
    minItems: 1,
    uniqueItems: true,
    items: {
      type: 'string',
      description: 'Valid tag ID (CUID format)',
      example: 'clx1tag123456789abcdef',
    },
  })
  @IsArray({ message: 'tagIds must be an array' })
  @ArrayNotEmpty({ message: 'tagIds array cannot be empty' })
  @IsString({ each: true, message: 'Each tag ID must be a string' })
  @IsNotEmpty({ each: true, message: 'Tag IDs cannot be empty strings' })
  tagIds: string[];
}
