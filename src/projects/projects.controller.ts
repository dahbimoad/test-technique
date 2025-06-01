import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto, InviteUserDto, ProjectResponseDto, InviteResponseDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ProjectAuthGuard, RequireProjectRole } from './guards/project-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User, Role } from '@prisma/client';

/**
 * Controller handling all project-related operations
 * Implements role-based access control and member management
 */
@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * Create a new project
   * User becomes the project owner automatically
   */  @Post()
  @ApiOperation({
    summary: 'Create a new project',
    description: 'Creates a new project with the authenticated user as the owner. The user automatically gets OWNER role with full permissions.'
  })
  @ApiBody({ 
    type: CreateProjectDto,
    description: 'Project creation data'
  })
  @ApiResponse({
    status: 201,
    description: 'Project created successfully - returns project details with user role',
    type: ProjectResponseDto,
    example: {
      id: 'clx1y2z3a4b5c6d7e8f9g0h1',
      name: 'E-commerce Platform',
      description: 'Modern e-commerce solution with React and Node.js',
      createdAt: '2025-05-31T10:30:00.000Z',
      owner: {
        id: 'clx1y2z3a4b5c6d7e8f9g0h2',
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      userRole: 'OWNER',
      memberCount: 1
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    example: {
      statusCode: 400,
      message: [
        'Name must be at least 3 characters long',
        'Description is required'
      ],
      error: 'Bad Request'
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  async create(
    @Body() createProjectDto: CreateProjectDto,
    @GetUser() user: User,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.create(createProjectDto, user.id);
  }

  /**
   * Get all projects where user is owner or member
   */  @Get()
  @ApiOperation({
    summary: 'Get all user projects',
    description: 'Retrieves all projects where the authenticated user is owner or member with their respective roles'
  })
  @ApiResponse({
    status: 200,
    description: 'Projects retrieved successfully - returns array of projects with user roles',
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
          email: 'john.doe@example.com'
        },
        userRole: 'OWNER',
        memberCount: 3
      },
      {
        id: 'clx1y2z3a4b5c6d7e8f9g0h3',
        name: 'Mobile App',
        description: 'React Native mobile application',
        createdAt: '2025-05-30T15:20:00.000Z',
        owner: {
          id: 'clx1y2z3a4b5c6d7e8f9g0h4',
          name: 'Jane Smith',
          email: 'jane.smith@example.com'
        },
        userRole: 'CONTRIBUTOR',
        memberCount: 2
      }
    ]
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  async findAll(@GetUser() user: User): Promise<ProjectResponseDto[]> {
    return this.projectsService.findAllForUser(user.id);
  }

  /**
   * Get a specific project by ID
   * Requires project membership
   */  @Get(':id')
  @UseGuards(ProjectAuthGuard)
  @ApiOperation({
    summary: 'Get project by ID',
    description: 'Retrieves detailed information about a specific project. User must be owner or member to access.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique project identifier',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1',
    type: 'string'
  })
  @ApiResponse({
    status: 200,
    description: 'Project retrieved successfully - returns project details with user role',
    type: ProjectResponseDto,
    example: {
      id: 'clx1y2z3a4b5c6d7e8f9g0h1',
      name: 'E-commerce Platform',
      description: 'Modern e-commerce solution with React and Node.js',
      createdAt: '2025-05-31T10:30:00.000Z',
      owner: {
        id: 'clx1y2z3a4b5c6d7e8f9g0h2',
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      userRole: 'CONTRIBUTOR',
      memberCount: 5
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a member of this project',
    example: {
      statusCode: 403,
      message: 'You are not a member of this project',
      error: 'Forbidden'
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    example: {
      statusCode: 404,
      message: 'Project not found',
      error: 'Not Found'
    }
  })
  async findOne(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.findOne(id, user.id);
  }

  /**
   * Update a project
   * Only project owner can update
   */  @Patch(':id')
  @UseGuards(ProjectAuthGuard)
  @RequireProjectRole([Role.OWNER])
  @ApiOperation({
    summary: 'Update project',
    description: 'Updates project information (name and/or description). Only project owner has permission to update.'
  })
  @ApiParam({
    name: 'id',
    description: 'Unique project identifier',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1',
    type: 'string'
  })
  @ApiBody({ 
    type: UpdateProjectDto,
    description: 'Project update data - all fields are optional'
  })
  @ApiResponse({
    status: 200,
    description: 'Project updated successfully - returns updated project details',
    type: ProjectResponseDto,
    example: {
      id: 'clx1y2z3a4b5c6d7e8f9g0h1',
      name: 'E-commerce Platform v2',
      description: 'Updated modern e-commerce solution with new features',
      createdAt: '2025-05-31T10:30:00.000Z',
      owner: {
        id: 'clx1y2z3a4b5c6d7e8f9g0h2',
        name: 'John Doe',
        email: 'john.doe@example.com'
      },
      userRole: 'OWNER',
      memberCount: 5
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - validation failed',
    example: {
      statusCode: 400,
      message: [
        'Name must be at least 3 characters long'
      ],
      error: 'Bad Request'
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized'
    }
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only project owner can update',
    example: {
      statusCode: 403,
      message: 'Only project owner can update the project',
      error: 'Forbidden'
    }
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found',
    example: {
      statusCode: 404,
      message: 'Project not found',
      error: 'Not Found'
    }
  })
  async update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @GetUser() user: User,
  ): Promise<ProjectResponseDto> {
    return this.projectsService.update(id, updateProjectDto, user.id);
  }

  /**
   * Delete a project
   * Only project owner can delete
   */
  @Delete(':id')
  @UseGuards(ProjectAuthGuard)
  @RequireProjectRole([Role.OWNER])
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete project',
    description: 'Deletes a project permanently. Only project owner can delete.'
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1'
  })
  @ApiResponse({
    status: 200,
    description: 'Project deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Project "E-commerce Platform" deleted successfully'
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only project owner can delete'
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found'
  })
  async remove(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    return this.projectsService.remove(id, user.id);
  }

  /**
   * Invite a user to join the project
   * Only owner and contributors can invite
   */
  @Post(':id/invite')
  @UseGuards(ProjectAuthGuard)
  @RequireProjectRole([Role.OWNER, Role.CONTRIBUTOR])
  @ApiOperation({
    summary: 'Invite user to project',
    description: 'Invites a user to join the project. Only owner and contributors can invite.'
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1'
  })
  @ApiResponse({
    status: 201,
    description: 'User invited successfully',
    type: InviteResponseDto
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data'
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Insufficient permissions to invite users'
  })
  @ApiResponse({
    status: 404,
    description: 'Project or user not found'
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User is already a member'
  })
  async inviteUser(
    @Param('id') id: string,
    @Body() inviteUserDto: InviteUserDto,
    @GetUser() user: User,
  ): Promise<InviteResponseDto> {
    return this.projectsService.inviteUser(id, inviteUserDto, user.id);
  }

  /**
   * Get all members of a project
   * Any project member can view the member list
   */
  @Get(':id/members')
  @UseGuards(ProjectAuthGuard)
  @ApiOperation({
    summary: 'Get project members',
    description: 'Retrieves all members of the project with their roles'
  })
  @ApiParam({
    name: 'id',
    description: 'Project ID',
    example: 'clx1y2z3a4b5c6d7e8f9g0h1'
  })
  @ApiResponse({
    status: 200,
    description: 'Project members retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        members: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'clx1y2z3a4b5c6d7e8f9g0h2' },
              name: { type: 'string', example: 'John Doe' },
              email: { type: 'string', example: 'john.doe@example.com' },
              role: { type: 'string', enum: ['OWNER', 'CONTRIBUTOR', 'VIEWER'] },
              joinedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token'
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - User is not a member of this project'
  })
  @ApiResponse({
    status: 404,
    description: 'Project not found'
  })
  async getProjectMembers(
    @Param('id') id: string,
    @GetUser() user: User,
  ) {
    return this.projectsService.getProjectMembers(id, user.id);
  }
}
