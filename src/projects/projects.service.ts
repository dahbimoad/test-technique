import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateProjectDto,
  UpdateProjectDto,
  InviteUserDto,
  ProjectResponseDto,
  InviteResponseDto,
  PaginationQueryDto,
  PaginatedProjectsResponseDto,
  PaginationMetaDto,
} from './dto';
import { Role, User, Project } from '@prisma/client';

/**
 * Service responsible for project management operations
 * Handles CRUD operations, member management, and role-based access control
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new project with the authenticated user as owner
   * @param createProjectDto Project creation data
   * @param userId ID of the user creating the project
   * @returns Created project with user role information
   */
  async create(
    createProjectDto: CreateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: project.owner,
      userRole: Role.OWNER,
      memberCount: project._count.memberships + 1, // +1 for owner
    };
  }
  /**
   * Get all projects where user is owner or member with pagination
   * @param userId ID of the requesting user
   * @param paginationQuery Pagination and filtering parameters
   * @returns Paginated projects with user role information
   */
  async findAllForUserPaginated(
    userId: string,
    paginationQuery: PaginationQueryDto,
  ): Promise<PaginatedProjectsResponseDto> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt',
      order = 'desc',
      search,
      tags,
    } = paginationQuery;

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Build base where clause
    const whereClause: any = {
      OR: [
        { ownerId: userId },
        {
          memberships: {
            some: { userId },
          },
        },
      ],
    };

    // Add search filtering if provided
    if (search) {
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        OR: [
          {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
          {
            description: {
              contains: search,
              mode: 'insensitive',
            },
          },
        ],
      });
    }

    // Add tag filtering if provided
    if (tags) {
      const tagNames = tags.split(',').map((tag) => tag.trim().toLowerCase());
      whereClause.AND = whereClause.AND || [];
      whereClause.AND.push({
        projectTags: {
          some: {
            tag: {
              name: {
                in: tagNames,
              },
            },
          },
        },
      });
    }

    // Build order by clause
    let orderBy: any;
    switch (sort) {
      case 'name':
        orderBy = { name: order };
        break;
      case 'memberCount':
        // For member count, we need to sort by the count of memberships
        orderBy = { memberships: { _count: order } };
        break;
      case 'createdAt':
      default:
        orderBy = { createdAt: order };
        break;
    }

    // Get total count for pagination metadata
    const totalItems = await this.prisma.project.count({
      where: whereClause,
    });

    // Get paginated projects
    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        memberships: {
          where: { userId },
          select: { role: true },
        },
        projectTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: { memberships: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    });

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    const meta: PaginationMetaDto = {
      currentPage: page,
      itemsPerPage: limit,
      totalItems,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };

    // Transform projects to response DTOs
    const data = projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: project.owner,
      userRole:
        project.ownerId === userId ? Role.OWNER : project.memberships[0]?.role,
      memberCount: project._count.memberships + 1, // +1 for owner
      tags: project.projectTags.map((pt) => pt.tag),
    }));

    return {
      data,
      meta,
    };
  }

  /**
   * Get all projects where user is owner or member
   * @param userId ID of the requesting user
   * @param tagNames Optional array of tag names to filter by
   * @returns Array of projects with user role information
   */
  async findAllForUser(
    userId: string,
    tagNames?: string[],
  ): Promise<ProjectResponseDto[]> {
    const whereClause: any = {
      OR: [
        { ownerId: userId },
        {
          memberships: {
            some: { userId },
          },
        },
      ],
    };

    // Add tag filtering if provided
    if (tagNames && tagNames.length > 0) {
      whereClause.AND = {
        projectTags: {
          some: {
            tag: {
              name: {
                in: tagNames.map((name) => name.toLowerCase()),
              },
            },
          },
        },
      };
    }

    const projects = await this.prisma.project.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        memberships: {
          where: { userId },
          select: { role: true },
        },
        projectTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: { memberships: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: project.owner,
      userRole:
        project.ownerId === userId ? Role.OWNER : project.memberships[0]?.role,
      memberCount: project._count.memberships + 1, // +1 for owner
      tags: project.projectTags.map((pt) => pt.tag), // Include tags in response
    }));
  }

  /**
   * Get a specific project by ID
   * @param projectId Project ID
   * @param userId ID of the requesting user
   * @returns Project details with user role information
   */
  async findOne(
    projectId: string,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        memberships: {
          where: { userId },
          select: { role: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user has access to this project
    const isOwner = project.ownerId === userId;
    const membership = project.memberships[0];

    if (!isOwner && !membership) {
      throw new ForbiddenException('You are not a member of this project');
    }

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: project.owner,
      userRole: isOwner ? Role.OWNER : membership.role,
      memberCount: project._count.memberships + 1, // +1 for owner
    };
  }

  /**
   * Update a project (only owner can update)
   * @param projectId Project ID
   * @param updateProjectDto Update data
   * @param userId ID of the requesting user
   * @returns Updated project information
   */
  async update(
    projectId: string,
    updateProjectDto: UpdateProjectDto,
    userId: string,
  ): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can update the project');
    }

    const updatedProject = await this.prisma.project.update({
      where: { id: projectId },
      data: updateProjectDto,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });

    return {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      createdAt: updatedProject.createdAt,
      owner: updatedProject.owner,
      userRole: Role.OWNER,
      memberCount: updatedProject._count.memberships + 1, // +1 for owner
    };
  }

  /**
   * Delete a project (only owner can delete)
   * @param projectId Project ID
   * @param userId ID of the requesting user
   */
  async remove(
    projectId: string,
    userId: string,
  ): Promise<{ message: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, name: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can delete the project');
    }

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { message: `Project "${project.name}" deleted successfully` };
  }

  /**
   * Invite a user to join a project
   * @param projectId Project ID
   * @param inviteUserDto Invitation data (email and role)
   * @param inviterId ID of the user sending the invitation
   * @returns Invitation confirmation
   */
  async inviteUser(
    projectId: string,
    inviteUserDto: InviteUserDto,
    inviterId: string,
  ): Promise<InviteResponseDto> {
    const { email, role } = inviteUserDto;

    // Check if project exists and user has permission to invite
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        memberships: {
          where: { userId: inviterId },
          select: { role: true },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Only owner and contributors can invite users
    const isOwner = project.ownerId === inviterId;
    const inviterMembership = project.memberships[0];
    const canInvite =
      isOwner ||
      (inviterMembership && inviterMembership.role === Role.CONTRIBUTOR);

    if (!canInvite) {
      throw new ForbiddenException(
        'Only project owner and contributors can invite users',
      );
    }

    // Find user by email
    const userToInvite = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!userToInvite) {
      throw new NotFoundException('User with this email not found');
    }

    // Check if user is already a member or owner
    if (project.ownerId === userToInvite.id) {
      throw new ConflictException('User is already the project owner');
    }

    const existingMembership = await this.prisma.membership.findUnique({
      where: {
        userId_projectId: {
          userId: userToInvite.id,
          projectId,
        },
      },
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this project');
    }

    // Create membership
    await this.prisma.membership.create({
      data: {
        userId: userToInvite.id,
        projectId,
        role,
      },
    });

    return {
      message: 'User invited successfully',
      invitation: {
        email: userToInvite.email,
        role,
      },
    };
  }

  /**
   * Get all members of a project
   * @param projectId Project ID
   * @param userId ID of the requesting user (for access validation)
   * @returns Array of project members with their roles
   */
  async getProjectMembers(projectId: string, userId: string) {
    // First check if user has access to this project
    await this.findOne(projectId, userId);

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const members = [
      {
        ...project.owner,
        role: Role.OWNER,
        joinedAt: project.createdAt,
      },
      ...project.memberships.map((membership) => ({
        ...membership.user,
        role: membership.role,
        joinedAt: membership.id, // Using membership ID as a proxy for join date
      })),
    ];

    return { members };
  }

  /**
   * Add tags to a project
   * @param projectId Project ID
   * @param tagIds Array of tag IDs to add
   * @param userId ID of the requesting user (for access validation)
   * @returns Updated project with tags
   */
  async addTagsToProject(projectId: string, tagIds: string[]) {
    // Verify all tags exist
    const existingTags = await this.prisma.tag.findMany({
      where: { id: { in: tagIds } },
      select: { id: true },
    });

    const existingTagIds = existingTags.map((tag) => tag.id);
    const missingTagIds = tagIds.filter((id) => !existingTagIds.includes(id));

    if (missingTagIds.length > 0) {
      throw new NotFoundException(
        `Tags not found: ${missingTagIds.join(', ')}`,
      );
    }

    // Get current project tags to avoid duplicates
    const currentProjectTags = await this.prisma.projectTag.findMany({
      where: { projectId },
      select: { tagId: true },
    });

    const currentTagIds = currentProjectTags.map((pt) => pt.tagId);
    const newTagIds = tagIds.filter((id) => !currentTagIds.includes(id));

    if (newTagIds.length === 0) {
      throw new ConflictException(
        'All specified tags are already added to this project',
      );
    }

    try {
      // Create new project-tag associations
      await this.prisma.projectTag.createMany({
        data: newTagIds.map((tagId) => ({
          projectId,
          tagId,
        })),
      }); // Return updated project with tags
      const updatedProject = await this.getProjectWithTags(projectId);
      if (!updatedProject) {
        throw new NotFoundException('Project not found after update');
      }
      return updatedProject;
    } catch (error) {
      throw new Error('Failed to add tags to project');
    }
  }

  /**
   * Remove a tag from a project
   * @param projectId Project ID
   * @param tagId Tag ID to remove
   * @returns Updated project with tags
   */
  async removeTagFromProject(projectId: string, tagId: string) {
    const projectTag = await this.prisma.projectTag.findUnique({
      where: {
        projectId_tagId: {
          projectId,
          tagId,
        },
      },
    });

    if (!projectTag) {
      throw new NotFoundException('Tag is not associated with this project');
    }

    try {
      await this.prisma.projectTag.delete({
        where: {
          projectId_tagId: {
            projectId,
            tagId,
          },
        },
      });

      return this.getProjectWithTags(projectId);
    } catch (error) {
      throw new Error('Failed to remove tag from project');
    }
  }

  /**
   * Get project tags
   * @param projectId Project ID
   * @returns Project tags
   */
  async getProjectTags(projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        projectTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
                createdAt: true,
                createdBy: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID "${projectId}" not found`);
    }

    return project.projectTags.map((pt) => pt.tag);
  }

  /**
   * Get project with its associated tags (private helper method)
   * @param projectId Project ID
   * @returns Project with tags array
   */
  private async getProjectWithTags(projectId: string) {
    return this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        projectTags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                color: true,
                description: true,
              },
            },
          },
        },
        _count: {
          select: { memberships: true },
        },
      },
    });
  }
}
