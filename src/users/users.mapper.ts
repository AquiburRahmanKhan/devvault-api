import type { User } from './user.entity';
import type { User as PrismaUser } from '../../generated/prisma/client';

export function toUserEntity(user: PrismaUser): User {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
