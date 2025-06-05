import { ApiProperty } from '@nestjs/swagger';
import { ProjectResponseDto } from './project-response.dto';
import { PaginationMetaDto } from './pagination.dto';

/**
 * Paginated response for projects
 */
export class PaginatedProjectsResponseDto {
  @ApiProperty({
    description: 'Array of projects for current page',
    type: [ProjectResponseDto],
    example: [
      {
        id: 'clx1y2z3a4b5c6d7e8f9g0h1',
        name: 'E-commerce Platform',
        description: 'Modern e-commerce solution',
        createdAt: '2025-05-31T10:30:00.000Z',
        owner: {
          id: 'clx1y2z3a4b5c6d7e8f9g0h2',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
        userRole: 'OWNER',
        memberCount: 3,
      },
      {
        id: 'clx1y2z3a4b5c6d7e8f9g0h3',
        name: 'Mobile App',
        description: 'React Native mobile application',
        createdAt: '2025-05-30T15:20:00.000Z',
        owner: {
          id: 'clx1y2z3a4b5c6d7e8f9g0h4',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
        },
        userRole: 'CONTRIBUTOR',
        memberCount: 2,
      },
    ],
  })
  data: ProjectResponseDto[];

  @ApiProperty({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
    example: {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 25,
      totalPages: 3,
      hasNextPage: true,
      hasPreviousPage: false,
    },
  })
  meta: PaginationMetaDto;
}
