import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from './create-task.dto';

export class TaskResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: TaskStatus }) status: TaskStatus;
  @ApiProperty() projectId: string;
  @ApiProperty({ required: false }) assignedToId?: string;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
