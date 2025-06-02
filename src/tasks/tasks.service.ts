import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, TaskStatus } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskResponseDto } from './dto/task-response.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  // Créer une tâche dans un projet
  async create(
    projectId: string,
    dto: CreateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    // Vérifie que l'utilisateur est membre du projet et a le droit (Contributor+)
    const membership = await this.prisma.membership.findFirst({
      where: { projectId, userId },
    });
    if (
      !membership ||
      (membership.role !== 'OWNER' && membership.role !== 'CONTRIBUTOR')
    ) {
      throw new ForbiddenException(
        'You are not allowed to create tasks in this project',
      );
    }

    // Vérifie que l'assignee est bien membre du projet (si précisé)
    if (dto.assignedToId) {
      const assignee = await this.prisma.membership.findFirst({
        where: { projectId, userId: dto.assignedToId },
      });
      if (!assignee)
        throw new NotFoundException('Assigned user is not a project member');
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status ?? TaskStatus.TODO,
        projectId,
        assignedToId: dto.assignedToId,
      },
    });
    return task;
  }

  // Lister toutes les tâches d'un projet (membres seulement)
  async findAll(projectId: string, userId: string): Promise<TaskResponseDto[]> {
    const membership = await this.prisma.membership.findFirst({
      where: { projectId, userId },
    });
    if (!membership)
      throw new ForbiddenException('You are not a member of this project');

    return this.prisma.task.findMany({ where: { projectId } });
  }

  // Modifier une tâche (Contributor+)
  async update(
    taskId: string,
    dto: UpdateTaskDto,
    userId: string,
  ): Promise<TaskResponseDto> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    // Vérifie que l'utilisateur est membre du projet et Contributor+
    const membership = await this.prisma.membership.findFirst({
      where: { projectId: task.projectId, userId },
    });
    if (
      !membership ||
      (membership.role !== 'OWNER' && membership.role !== 'CONTRIBUTOR')
    ) {
      throw new ForbiddenException(
        'You are not allowed to update tasks in this project',
      );
    }

    // Vérifie que l'assignee est bien membre du projet (si précisé)
    if (dto.assignedToId) {
      const assignee = await this.prisma.membership.findFirst({
        where: { projectId: task.projectId, userId: dto.assignedToId },
      });
      if (!assignee)
        throw new NotFoundException('Assigned user is not a project member');
    }

    return this.prisma.task.update({
      where: { id: taskId },
      data: { ...dto },
    });
  }

  // Supprimer une tâche (Contributor+)
  async remove(taskId: string, userId: string): Promise<void> {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.prisma.membership.findFirst({
      where: { projectId: task.projectId, userId },
    });
    if (
      !membership ||
      (membership.role !== 'OWNER' && membership.role !== 'CONTRIBUTOR')
    ) {
      throw new ForbiddenException(
        'You are not allowed to delete tasks in this project',
      );
    }

    await this.prisma.task.delete({ where: { id: taskId } });
  }
}
