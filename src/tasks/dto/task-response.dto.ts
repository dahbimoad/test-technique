import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '@prisma/client';

export class TaskResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() title: string;
  @ApiProperty() description: string;
  @ApiProperty({ enum: TaskStatus }) status: TaskStatus;
  @ApiProperty() projectId: string;
  @ApiProperty({ required: false, nullable: true }) assignedToId: string | null;
  @ApiProperty() createdAt: Date;
  @ApiProperty() updatedAt: Date;
}
