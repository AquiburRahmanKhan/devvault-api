import type { Task as PrismaTask } from '../../generated/prisma/client';
import type { Task } from './task.entity';

// Convert a Prisma database task to a Task entity
export function toTaskEntity(task: PrismaTask): Task {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    projectId: task.projectId,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
  };
}
