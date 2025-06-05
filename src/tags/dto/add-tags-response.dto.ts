import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO for adding tags to a project operation
 * Returns the updated project with all associated tags
 */
export class AddTagsToProjectResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the project',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1',
  })
  id: string;

  @ApiProperty({
    description: 'Project name',
    example: 'E-commerce Platform',
  })
  name: string;

  @ApiProperty({
    description: 'Project description',
    example: 'Modern e-commerce solution with React and Node.js',
  })
  description: string;

  @ApiProperty({
    description: 'Project creation timestamp',
    example: '2025-05-31T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Project owner information',
    example: {
      id: 'clx1y2z3a4b5c6d7e8f9g0h2',
      name: 'John Doe',
      email: 'john.doe@example.com',
    },
  })
  owner: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    description:
      'All tags associated with the project (including newly added ones)',
    example: [
      {
        projectId: 'clx1y2z3a4b5c6d7e8f9g0h1',
        tagId: 'clx1tag123456789abcdef',
        tag: {
          id: 'clx1tag123456789abcdef',
          name: 'frontend',
          color: '#3B82F6',
          description: 'Frontend development tasks',
        },
      },
      {
        projectId: 'clx1y2z3a4b5c6d7e8f9g0h1',
        tagId: 'clx2tag987654321fedcba',
        tag: {
          id: 'clx2tag987654321fedcba',
          name: 'urgent',
          color: '#EF4444',
          description: 'High priority tasks',
        },
      },
    ],
  })
  projectTags: {
    projectId: string;
    tagId: string;
    tag: {
      id: string;
      name: string;
      color: string;
      description: string | null;
    };
  }[];

  @ApiProperty({
    description: 'Total number of project members',
    example: 3,
  })
  _count: {
    memberships: number;
  };
}
