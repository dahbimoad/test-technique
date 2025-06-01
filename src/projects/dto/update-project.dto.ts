import { PartialType } from '@nestjs/swagger';
import { CreateProjectDto } from './create-project.dto';

/**
 * DTO for updating a project
 * All fields from CreateProjectDto are optional
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
