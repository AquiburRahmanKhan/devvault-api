import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';

const toInt = (v: unknown) => {
  if (typeof v !== 'string') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : v;
};

export class ListUsersQueryDto {
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
  @IsIn(['createdAt', 'updatedAt', 'email', 'name'])
  sort?: 'createdAt' | 'updatedAt' | 'email' | 'name' = 'createdAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';

  @IsOptional()
  @IsString()
  @MinLength(1)
  search?: string;
}
