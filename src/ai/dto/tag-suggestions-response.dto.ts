import { ApiProperty } from '@nestjs/swagger';

export class TagSuggestionsResponseDto {
  @ApiProperty({
    description: 'List of AI-suggested tags',
    example: ['frontend', 'react', 'typescript', 'ui/ux', 'responsive'],
    type: [String],
  })
  suggestions: string[];

  @ApiProperty({
    description: 'Confidence score for the suggestions (0-1)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  confidence: number;
}
