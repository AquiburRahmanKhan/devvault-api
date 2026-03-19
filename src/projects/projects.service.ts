import { Injectable, NotFoundException } from '@nestjs/common';
import type { PaginatedResult } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateProjectDto,
  ListProjectsQueryDto,
  UpdateProjectDto,
} from './dto';
import type { Project } from './project.entity';
import { toProjectEntity } from './project.mapper';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureOwnership(projectId: string, ownerId: string) {
    const project = await this.prisma.client.project.findUnique({
      where: { id: projectId },
    });

    if (!project) return undefined;
    if (project.ownerId !== ownerId) return null;

    return project;
  }

  async list(query: ListProjectsQueryDto): Promise<PaginatedResult<Project>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'createdAt';
    const order = query.order ?? 'desc';
    const search = query.search?.trim();
    const ownerId = query.ownerId;

    const where = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              {
                description: {
                  contains: search,
                  mode: 'insensitive' as const,
                },
              },
            ],
          }
        : {}),
      ...(ownerId ? { ownerId } : {}),
    };

    const [total, projects] = await this.prisma.client.$transaction([
      this.prisma.client.project.count({ where }),
      this.prisma.client.project.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: projects.map(toProjectEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findById(id: string): Promise<Project | undefined> {
    const project = await this.prisma.client.project.findUnique({
      where: { id },
    });

    if (!project) return undefined;

    return toProjectEntity(project);
  }

  async create(input: CreateProjectDto): Promise<Project> {
    const owner = await this.prisma.client.user.findUnique({
      where: { id: input.ownerId },
    });

    if (!owner) {
      throw new NotFoundException('Owner user not found');
    }

    const normalizedDescription = input.description?.trim();

    const project = await this.prisma.client.project.create({
      data: {
        name: input.name.trim(),
        description: normalizedDescription ?? null,
        ownerId: input.ownerId,
      },
    });

    return toProjectEntity(project);
  }

  async update(
    id: string,
    ownerId: string,
    input: UpdateProjectDto,
  ): Promise<Project | undefined | null> {
    const existing = await this.ensureOwnership(id, ownerId);

    if (existing === undefined) return undefined;
    if (existing === null) return null;

    const project = await this.prisma.client.project.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() || null }
          : {}),
      },
    });

    return toProjectEntity(project);
  }

  async delete(id: string, ownerId: string): Promise<boolean | null> {
    const existing = await this.ensureOwnership(id, ownerId);

    if (existing === undefined) return false;
    if (existing === null) return null;

    await this.prisma.client.project.delete({
      where: { id },
    });

    return true;
  }
}
