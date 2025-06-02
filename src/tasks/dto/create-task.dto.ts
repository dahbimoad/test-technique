import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export enum TaskStatus {
  TODO = 'TODO',
  DOING = 'DOING',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Implement login', minLength: 3 })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Implement JWT login for users' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: TaskStatus, default: TaskStatus.TODO, required: false })
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @ApiProperty({ example: 'userId', required: false, description: 'Assign to user (must be a project member)' })
  @IsString()
  @IsOptional()
  assignedToId?: string;
}