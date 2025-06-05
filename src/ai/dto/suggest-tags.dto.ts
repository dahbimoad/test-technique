import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class SuggestTagsDto {
  @ApiProperty({
    description: 'Content to analyze for tag suggestions',
    example: 'Build a responsive landing page with React components and TypeScript',
  })
  @IsNotEmpty()
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Project ID for context-aware tag suggestions',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1',
    required: false,
  })
  @IsOptional()
  @IsString()
  projectId?: string;
}
