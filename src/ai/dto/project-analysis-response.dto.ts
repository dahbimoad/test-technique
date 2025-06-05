import { ApiProperty } from '@nestjs/swagger';

export class ProjectAnalysisResponseDto {
  @ApiProperty({
    description: 'Project health score from 0-100',
    example: 78,
    minimum: 0,
    maximum: 100,
  })
  healthScore: number;

  @ApiProperty({
    description: 'Identified risk factors for the project',
    example: [
      'High number of overdue tasks',
      'Limited team size for project scope',
      'Complex dependencies between tasks'
    ],
    type: [String],
  })
  riskFactors: string[];

  @ApiProperty({
    description: 'AI-generated recommendations for improvement',
    example: [
      'Consider breaking down large tasks into smaller chunks',
      'Prioritize fixing overdue tasks',
      'Add more team members or extend timeline',
      'Implement better task dependency management'
    ],
    type: [String],
  })
  recommendations: string[];

  @ApiProperty({
    description: 'AI-predicted project completion date',
    example: '2025-08-15',
    format: 'date',
  })
  predictedCompletionDate: string;

  @ApiProperty({
    description: 'Identified project bottlenecks',
    example: [
      'Frontend development tasks waiting for design approval',
      'Backend API development blocking frontend integration'
    ],
    type: [String],
  })
  bottlenecks: string[];
}
