import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for tag response data
 * Represents what the client receives when fetching tag information
 */
export class TagResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the tag',
    example: 'cuid123456789',
  })
  id: string;

  @ApiProperty({
    description: 'Tag name',
    example: 'urgent',
  })
  name: string;

  @ApiProperty({
    description: 'Hex color code for the tag',
    example: '#ff4444',
  })
  color: string;
  @ApiProperty({
    description: 'Optional tag description',
    example: 'Use for high-priority tasks',
    required: false,
  })
  description?: string | null;

  @ApiProperty({
    description: 'When the tag was created',
    example: '2023-12-01T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User who created this tag',
    type: 'object',
    properties: {
      id: { type: 'string', example: 'user123' },
      name: { type: 'string', example: 'John Doe' },
      email: { type: 'string', example: 'john@example.com' },
    },
  })
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
}
