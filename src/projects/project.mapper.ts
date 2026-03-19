import type { Project as PrismaProject } from '../../generated/prisma/client';
import type { Project } from './project.entity';

export function toProjectEntity(project: PrismaProject): Project {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    ownerId: project.ownerId,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
