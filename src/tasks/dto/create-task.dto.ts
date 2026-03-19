import {
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
  IsEnum,
} from 'class-validator';

export enum TaskStatusEnum {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
}

export class CreateTaskDto {
  @IsString()
  @MinLength(2)
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsUUID('4')
  projectId!: string;

  @IsOptional()
  @IsEnum(TaskStatusEnum)
  status?: TaskStatusEnum;
}
