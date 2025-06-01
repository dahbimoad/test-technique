import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '@prisma/client';

/**
 * Custom decorator to specify required roles for project access
 * @param roles Array of roles that can access the resource
 */
export const RequireProjectRole = (roles: Role[]) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('project-roles', roles, descriptor.value);
    return descriptor;
  };
};

/**
 * Guard to check if user has required role in a specific project
 * Validates project membership and role-based permissions
 */
@Injectable()
export class ProjectAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get project ID from route parameters
    const projectId = request.params.id || request.params.projectId;
    
    if (!projectId) {
      throw new ForbiddenException('Project ID is required');
    }

    // Check if project exists
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        owner: true,
        memberships: {
          where: { userId: user.id },
          select: { role: true }
        }
      }
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    // Check if user is project owner or member
    const isOwner = project.owner.id === user.id;
    const membership = project.memberships[0];
    
    if (!isOwner && !membership) {
      throw new ForbiddenException('You are not a member of this project');
    }

    // Get user's role in the project
    const userRole = isOwner ? Role.OWNER : membership.role;
    
    // Get required roles from decorator
    const requiredRoles = this.reflector.get<Role[]>('project-roles', context.getHandler());
    
    // If no specific roles required, just check membership
    if (!requiredRoles || requiredRoles.length === 0) {
      request.projectRole = userRole;
      request.project = project;
      return true;
    }

    // Check if user has required role
    if (!requiredRoles.includes(userRole)) {
      throw new ForbiddenException(`Insufficient permissions. Required roles: ${requiredRoles.join(', ')}`);
    }

    // Attach role and project to request for use in controllers
    request.projectRole = userRole;
    request.project = project;
    
    return true;
  }
}
