import { IsUUID } from 'class-validator';

export class ProjectOwnerDto {
  @IsUUID('4')
  ownerId!: string;
}
