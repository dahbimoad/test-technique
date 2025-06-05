import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@prisma/client';

/**
 * Response DTO for project operations
 * Provides structured project data with membership information
 */
export class ProjectResponseDto {
  @ApiProperty({
    description: 'Project unique identifier',
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
    example: 'A modern e-commerce platform built with NestJS and React',
  })
  description: string;

  @ApiProperty({
    description: 'Project creation date',
    example: '2024-01-15T10:30:00.000Z',
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
    description: 'Current user role in the project',
    example: 'CONTRIBUTOR',
    enum: Role,
    enumName: 'Role',
  })
  userRole: Role;
  @ApiProperty({
    description: 'Number of project members',
    example: 5,
  })
  memberCount: number;

  @ApiProperty({
    description: 'Project tags',
    example: [
      {
        id: 'tag1',
        name: 'urgent',
        color: '#ff4444',
        description: 'High priority tasks',
      },
    ],
    required: false,
  })
  tags?: {
    id: string;
    name: string;
    color: string;
    description?: string | null;
  }[];
}

/**
 * Response DTO for successful project invitation
 */
export class InviteResponseDto {
  @ApiProperty({
    description: 'Success message',
    example: 'User invited successfully',
  })
  message: string;

  @ApiProperty({
    description: 'Invited user information',
    example: {
      email: 'jane.doe@example.com',
      role: 'CONTRIBUTOR',
    },
  })
  invitation: {
    email: string;
    role: Role;
  };
}
