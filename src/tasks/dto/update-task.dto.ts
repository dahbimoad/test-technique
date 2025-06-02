import { PartialType } from '@nestjs/swagger';
import { CreateTaskDto } from './create-task.dto';

/**
 * DTO pour la mise à jour d'une tâche.
 * Tous les champs sont optionnels grâce à PartialType.
 */
export class UpdateTaskDto extends PartialType(CreateTaskDto) {}
