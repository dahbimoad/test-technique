import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // à adapter selon ton projet

@Controller()
@UseGuards(JwtAuthGuard) // protège toutes les routes par JWT
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Créer une tâche dans un projet
  @Post('/projects/:projectId/tasks')
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.create(projectId, dto, req.user.id);
  }

  // Lister les tâches d'un projet
  @Get('/projects/:projectId/tasks')
  findAll(@Param('projectId') projectId: string, @Request() req) {
    return this.tasksService.findAll(projectId, req.user.id);
  }

  // Modifier une tâche
  @Patch('/tasks/:id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, dto, req.user.id);
  }

  // Supprimer une tâche
  @Delete('/tasks/:id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }
}
