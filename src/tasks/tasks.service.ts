import { Injectable, NotFoundException } from '@nestjs/common';
import type { PaginatedResult } from '../common/types';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './dto';
import type { Task } from './task.entity';
import { toTaskEntity } from './task.mapper';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListTasksQueryDto): Promise<PaginatedResult<Task>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'createdAt';
    const order = query.order ?? 'desc';
    const projectId = query.projectId;

    const where = {
      ...(projectId ? { projectId } : {}),
    };

    const [total, tasks] = await this.prisma.client.$transaction([
      this.prisma.client.task.count({ where }),
      this.prisma.client.task.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: tasks.map(toTaskEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findById(id: string): Promise<Task | undefined> {
    const task = await this.prisma.client.task.findUnique({
      where: { id },
    });

    if (!task) return undefined;

    return toTaskEntity(task);
  }

  async create(input: CreateTaskDto): Promise<Task> {
    const project = await this.prisma.client.project.findUnique({
      where: { id: input.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const normalizedDescription = input.description?.trim();

    const task = await this.prisma.client.task.create({
      data: {
        title: input.title.trim(),
        description: normalizedDescription ? normalizedDescription : null,
        projectId: input.projectId,
        status: input.status ?? 'TODO',
      },
    });

    return toTaskEntity(task);
  }

  async update(id: string, input: UpdateTaskDto): Promise<Task | undefined> {
    const existing = await this.prisma.client.task.findUnique({
      where: { id },
    });

    if (!existing) return undefined;

    const task = await this.prisma.client.task.update({
      where: { id },
      data: {
        ...(input.title !== undefined ? { title: input.title.trim() } : {}),
        ...(input.description !== undefined
          ? { description: input.description.trim() || null }
          : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    return toTaskEntity(task);
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.prisma.client.task.findUnique({
      where: { id },
    });

    if (!existing) return false;

    await this.prisma.client.task.delete({
      where: { id },
    });

    return true;
  }
}
