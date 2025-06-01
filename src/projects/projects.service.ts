import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto, InviteUserDto, ProjectResponseDto, InviteResponseDto } from './dto';
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
  async create(createProjectDto: CreateProjectDto, userId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.create({
      data: {
        name: createProjectDto.name,
        description: createProjectDto.description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { memberships: true }
        }
        }
    });

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: project.owner,
      userRole: Role.OWNER,
      memberCount: project._count.memberships + 1 // +1 for owner
    };
  }

  /**
   * Get all projects where user is owner or member
   * @param userId ID of the requesting user
   * @returns Array of projects with user role information
   */
  async findAllForUser(userId: string): Promise<ProjectResponseDto[]> {
    const projects = await this.prisma.project.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { 
            memberships: {
              some: { userId }
            }
          }
        ]
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        memberships: {
          where: { userId },
          select: { role: true }
        },
        _count: {
          select: { memberships: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return projects.map(project => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.createdAt,
      owner: project.owner,
      userRole: project.ownerId === userId ? Role.OWNER : project.memberships[0]?.role,
      memberCount: project._count.memberships + 1 // +1 for owner
    }));
  }

  /**
   * Get a specific project by ID
   * @param projectId Project ID
   * @param userId ID of the requesting user
   * @returns Project details with user role information
   */
  async findOne(projectId: string, userId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        memberships: {
          where: { userId },
          select: { role: true }
        },
        _count: {
          select: { memberships: true }
        }
      }
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
      memberCount: project._count.memberships + 1 // +1 for owner
    };
  }

  /**
   * Update a project (only owner can update)
   * @param projectId Project ID
   * @param updateProjectDto Update data
   * @param userId ID of the requesting user
   * @returns Updated project information
   */
  async update(projectId: string, updateProjectDto: UpdateProjectDto, userId: string): Promise<ProjectResponseDto> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true }
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
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { memberships: true }
        }
      }
    });

    return {
      id: updatedProject.id,
      name: updatedProject.name,
      description: updatedProject.description,
      createdAt: updatedProject.createdAt,
      owner: updatedProject.owner,
      userRole: Role.OWNER,
      memberCount: updatedProject._count.memberships + 1 // +1 for owner
    };
  }

  /**
   * Delete a project (only owner can delete)
   * @param projectId Project ID
   * @param userId ID of the requesting user
   */
  async remove(projectId: string, userId: string): Promise<{ message: string }> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { ownerId: true, name: true }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.ownerId !== userId) {
      throw new ForbiddenException('Only project owner can delete the project');
    }

    await this.prisma.project.delete({
      where: { id: projectId }
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
  async inviteUser(projectId: string, inviteUserDto: InviteUserDto, inviterId: string): Promise<InviteResponseDto> {
    const { email, role } = inviteUserDto;

    // Check if project exists and user has permission to invite
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        memberships: {
          where: { userId: inviterId },
          select: { role: true }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Only owner and contributors can invite users
    const isOwner = project.ownerId === inviterId;
    const inviterMembership = project.memberships[0];
    const canInvite = isOwner || (inviterMembership && inviterMembership.role === Role.CONTRIBUTOR);

    if (!canInvite) {
      throw new ForbiddenException('Only project owner and contributors can invite users');
    }

    // Find user by email
    const userToInvite = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true }
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
          projectId
        }
      }
    });

    if (existingMembership) {
      throw new ConflictException('User is already a member of this project');
    }

    // Create membership
    await this.prisma.membership.create({
      data: {
        userId: userToInvite.id,
        projectId,
        role
      }
    });

    return {
      message: 'User invited successfully',
      invitation: {
        email: userToInvite.email,
        role
      }
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
          select: { id: true, name: true, email: true }
        },
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const members = [
      {
        ...project.owner,
        role: Role.OWNER,
        joinedAt: project.createdAt
      },
      ...project.memberships.map(membership => ({
        ...membership.user,
        role: membership.role,
        joinedAt: membership.id // Using membership ID as a proxy for join date
      }))
    ];

    return { members };
  }
}
