import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { TagsService } from './tags.service';
import {
  CreateTagDto,
  UpdateTagDto,
  TagResponseDto,
  AddTagsToProjectDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from '@prisma/client';

/**
 * Controller handling all tag-related operations
 * Provides endpoints for tag CRUD operations and project-tag associations
 */
@ApiTags('Tags')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  /**
   * Create a new tag
   * Allows users to create custom tags for better project organization
   */
  @Post()
  @ApiOperation({
    summary: 'Create a new tag',
    description:
      'Create a custom tag that can be used to categorize projects. Tag names must be unique.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Tag created successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tag name already exists or invalid data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async create(
    @Body() createTagDto: CreateTagDto,
    @GetUser() user: User,
  ): Promise<TagResponseDto> {
    return this.tagsService.create(createTagDto, user.id);
  }

  /**
   * Get all available tags
   * Returns all tags sorted by usage count (most used first)
   */
  @Get()
  @ApiOperation({
    summary: 'Get all tags',
    description:
      'Retrieve all available tags with usage statistics, sorted by popularity.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tags retrieved successfully',
    type: [TagResponseDto],
  })
  async findAll(): Promise<TagResponseDto[]> {
    return this.tagsService.findAll();
  }

  /**
   * Get a specific tag by ID
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get tag by ID',
    description: 'Retrieve detailed information about a specific tag.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID',
    example: 'cuid123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag retrieved successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  async findOne(@Param('id') id: string): Promise<TagResponseDto> {
    return this.tagsService.findOne(id);
  }

  /**
   * Update an existing tag
   * Only the creator of the tag can update it
   */
  @Patch(':id')
  @ApiOperation({
    summary: 'Update tag',
    description:
      'Update tag information. Only the creator can update their tags.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID to update',
    example: 'cuid123456789',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Tag updated successfully',
    type: TagResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only tag creator can update it',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Tag name already exists or invalid data',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTagDto: UpdateTagDto,
    @GetUser() user: User,
  ): Promise<TagResponseDto> {
    return this.tagsService.update(id, updateTagDto, user.id);
  }

  /**
   * Delete a tag
   * Only the creator of the tag can delete it
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete tag',
    description:
      'Delete a tag. Only the creator can delete their tags. This will also remove the tag from all projects.',
  })
  @ApiParam({
    name: 'id',
    description: 'Tag ID to delete',
    example: 'cuid123456789',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Tag deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Tag not found',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only tag creator can delete it',
  })
  async remove(@Param('id') id: string, @GetUser() user: User): Promise<void> {
    return this.tagsService.remove(id, user.id);
  }
}
