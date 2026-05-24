import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProjectResponse {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description!: string | null;

  @Expose()
  ownerId!: string;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}
