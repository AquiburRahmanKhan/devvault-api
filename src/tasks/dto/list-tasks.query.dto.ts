import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Max, Min, IsIn } from 'class-validator';

const toInt = (v: unknown) => {
  if (typeof v !== 'string') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

export class ListTasksQueryDto {
  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => toInt(value))
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @IsOptional()
  @IsUUID('4')
  projectId?: string;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'title', 'status'])
  sort?: 'createdAt' | 'updatedAt' | 'title' | 'status' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
