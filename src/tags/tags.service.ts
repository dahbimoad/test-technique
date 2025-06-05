import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTagDto, UpdateTagDto, TagResponseDto } from './dto';

/**
 * Service responsible for tag management operations
 * Handles CRUD operations for tags and project-tag associations
 */
@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new tag
   * @param createTagDto - Tag data to create
   * @param userId - ID of the user creating the tag
   * @returns Created tag with creator information
   */ async create(
    createTagDto: CreateTagDto,
    userId: string,
  ): Promise<TagResponseDto> {
    try {
      // Normalize the tag name first
      const normalizedName = createTagDto.name.toLowerCase().trim();

      // Check if tag name already exists (using normalized name)
      const existingTag = await this.prisma.tag.findFirst({
        where: {
          name: normalizedName,
        },
      });

      if (existingTag) {
        throw new BadRequestException(
          `Tag with name "${createTagDto.name}" already exists`,
        );
      }

      // Create the tag
      const tag = await this.prisma.tag.create({
        data: {
          ...createTagDto,
          name: normalizedName, // Use the same normalized name
          createdById: userId,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return tag;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create tag');
    }
  }

  /**
   * Get all tags with usage statistics
   * @returns Array of all tags with project count
   */
  async findAll(): Promise<TagResponseDto[]> {
    const tags = await this.prisma.tag.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { name: 'asc' }, // Alphabetically for now, will fix ordering later
      ],
    });

    return tags;
  }

  /**
   * Get a specific tag by ID
   * @param id - Tag ID
   * @returns Tag with usage statistics
   */ async findOne(id: string): Promise<TagResponseDto> {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    return tag;
  }

  /**
   * Update an existing tag
   * @param id - Tag ID to update
   * @param updateTagDto - Updated tag data
   * @param userId - ID of the user making the update
   * @returns Updated tag
   */
  async update(
    id: string,
    updateTagDto: UpdateTagDto,
    userId: string,
  ): Promise<TagResponseDto> {
    // Check if tag exists and get creator info
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    // Only the creator can update the tag
    if (existingTag.createdById !== userId) {
      throw new ForbiddenException('You can only update tags you created');
    } // If updating name, check for duplicates
    if (updateTagDto.name) {
      const normalizedUpdateName = updateTagDto.name.toLowerCase().trim();

      const duplicateTag = await this.prisma.tag.findFirst({
        where: {
          name: normalizedUpdateName,
          id: { not: id }, // Exclude current tag
        },
      });

      if (duplicateTag) {
        throw new BadRequestException(
          `Tag with name "${updateTagDto.name}" already exists`,
        );
      }
    }

    try {
      const updatedTag = await this.prisma.tag.update({
        where: { id },
        data: {
          ...updateTagDto,
          name: updateTagDto.name
            ? updateTagDto.name.toLowerCase().trim()
            : undefined,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return updatedTag;
    } catch (error) {
      throw new BadRequestException('Failed to update tag');
    }
  }

  /**
   * Delete a tag
   * @param id - Tag ID to delete
   * @param userId - ID of the user making the deletion
   */
  async remove(id: string, userId: string): Promise<void> {
    // Check if tag exists and get creator info
    const existingTag = await this.prisma.tag.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!existingTag) {
      throw new NotFoundException(`Tag with ID "${id}" not found`);
    }

    // Only the creator can delete the tag
    if (existingTag.createdById !== userId) {
      throw new ForbiddenException('You can only delete tags you created');
    }

    try {
      // Prisma will automatically handle cascade deletion of ProjectTag records
      await this.prisma.tag.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestException('Failed to delete tag');
    }
  }

  /**
   * Add tags to a project
   * @param projectId - Project ID
   * @param tagIds - Array of tag IDs to add
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
      throw new BadRequestException(
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
      });

      // Return updated project with tags
      return this.getProjectWithTags(projectId);
    } catch (error) {
      throw new BadRequestException('Failed to add tags to project');
    }
  }

  /**
   * Remove a tag from a project
   * @param projectId - Project ID
   * @param tagId - Tag ID to remove
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
      throw new BadRequestException('Failed to remove tag from project');
    }
  }

  /**
   * Get project with its associated tags
   * @param projectId - Project ID
   * @returns Project with tags array
   */
  private async getProjectWithTags(projectId: string) {
    return this.prisma.project.findUnique({
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
              },
            },
          },
        },
      },
    });
  }
}
