import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UserResponse {
  @Expose()
  id!: string;

  @Expose()
  email!: string;

  @Expose()
  name!: string;

  @Expose()
  role!: string;

  @Expose()
  createdAt!: string;

  @Expose()
  updatedAt!: string;
}
