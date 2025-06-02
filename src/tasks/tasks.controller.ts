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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller()
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  // Créer une tâche dans un projet
  @Post('/projects/:projectId/tasks')
  @ApiOperation({ summary: 'Créer une tâche dans un projet' })
  @ApiResponse({ status: 201, description: 'Tâche créée avec succès.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  @ApiBody({ type: CreateTaskDto, isArray: false }) // <-- ajouter cette ligne
  create(
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.create(projectId, dto, req.user.id);
  }

  // Lister les tâches d'un projet
  @Get('/projects/:projectId/tasks')
  @ApiOperation({ summary: "Lister les tâches d'un projet" })
  @ApiResponse({ status: 200, description: 'Liste des tâches récupérée.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  findAll(@Param('projectId') projectId: string, @Request() req) {
    return this.tasksService.findAll(projectId, req.user.id);
  }

  // Modifier une tâche
  @Patch('/tasks/:id')
  @ApiOperation({ summary: 'Modifier une tâche' })
  @ApiResponse({ status: 200, description: 'Tâche modifiée.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto, @Request() req) {
    return this.tasksService.update(id, dto, req.user.id);
  }

  // Supprimer une tâche
  @Delete('/tasks/:id')
  @ApiOperation({ summary: 'Supprimer une tâche' })
  @ApiResponse({ status: 200, description: 'Tâche supprimée.' })
  @ApiResponse({ status: 401, description: 'Non autorisé.' })
  remove(@Param('id') id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.id);
  }
}
