import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TaskResponse {
  @Expose()
  id!: string;

  @Expose()
  title!: string;

  @Expose()
  description!: string | null;

  @Expose()
  status!: 'TODO' | 'IN_PROGRESS' | 'DONE';

  @Expose()
  projectId!: string;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}
