import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsInt, Min, IsString, IsIn } from 'class-validator';

/**
 * DTO for pagination query parameters
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Page number (1-based)',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: ['name', 'createdAt', 'memberCount'],
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'memberCount'])
  sort?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsString()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @ApiPropertyOptional({
    description: 'Search term to filter projects by name or description',
    example: 'e-commerce',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Comma-separated list of tag names to filter by',
    example: 'web,api,react',
  })
  @IsOptional()
  @IsString()
  tags?: string;
}

/**
 * Pagination metadata response
 */
export class PaginationMetaDto {
  @ApiPropertyOptional({
    description: 'Current page number',
    example: 1,
  })
  currentPage: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  itemsPerPage: number;

  @ApiPropertyOptional({
    description: 'Total number of items',
    example: 25,
  })
  totalItems: number;

  @ApiPropertyOptional({
    description: 'Total number of pages',
    example: 3,
  })
  totalPages: number;

  @ApiPropertyOptional({
    description: 'Whether there is a next page',
    example: true,
  })
  hasNextPage: boolean;

  @ApiPropertyOptional({
    description: 'Whether there is a previous page',
    example: false,
  })
  hasPreviousPage: boolean;
}

/**
 * Generic paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  @ApiPropertyOptional({
    description: 'Array of items for current page',
  })
  data: T[];

  @ApiPropertyOptional({
    description: 'Pagination metadata',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
