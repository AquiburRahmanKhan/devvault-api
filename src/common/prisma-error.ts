import { ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';

export function handlePrismaError(
  error: unknown,
  options?: {
    uniqueMessage?: string;
  },
): never {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  ) {
    throw new ConflictException(
      options?.uniqueMessage ?? 'Unique field already exists',
    );
  }

  throw error;
}
