import { IsOptional, IsString, MinLength, IsEnum } from 'class-validator';
import { TaskStatusEnum } from './create-task.dto';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatusEnum)
  status?: TaskStatusEnum;
}
