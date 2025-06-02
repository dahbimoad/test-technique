import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  MinLength,
  MaxLength,
} from 'class-validator';
import { TaskStatus } from '@prisma/client';

export class CreateTaskDto {
  @IsString()
  @IsNotEmpty({ message: 'Task title is required' })
  @MinLength(3, { message: 'Task title must be at least 3 characters long' })
  @MaxLength(100, { message: 'Task title must not exceed 100 characters' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: 'Task description is required' })
  @MinLength(5, {
    message: 'Task description must be at least 5 characters long',
  })
  @MaxLength(500, {
    message: 'Task description must not exceed 500 characters',
  })
  description: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({
    example: 'userId',
    required: false,
    description: 'Assign to user (must be a project member)',
  })
  @IsString()
  @IsOptional()
  assignedToId?: string;
}
