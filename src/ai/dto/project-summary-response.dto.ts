import { ApiProperty } from '@nestjs/swagger';

export class ProjectSummaryResponseDto {
  @ApiProperty({
    description: 'AI-generated project summary',
    example: 'E-commerce Platform is a modern web application focused on building a scalable online retail solution. The project utilizes React for frontend development and Node.js for backend services, with current progress showing 15 completed tasks and active development in authentication and payment systems.',
  })
  summary: string;

  @ApiProperty({
    description: 'Key insights about the project',
    example: [
      'Strong technical foundation with modern tech stack',
      'Well-organized task structure and clear milestones',
      'Active development momentum with regular updates'
    ],
    type: [String],
  })
  keyInsights: string[];
}
