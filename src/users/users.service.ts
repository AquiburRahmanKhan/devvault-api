import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import type { PaginatedResult } from '../common/types';
import type { CreateUserDto, UpdateUserDto, ListUsersQueryDto } from './dto';
import type { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaClient) {}

  async list(query: ListUsersQueryDto): Promise<PaginatedResult<User>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'createdAt';
    const order = query.order ?? 'desc';
    const search = query.search?.trim();

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: users.map((user) => ({
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return undefined;

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return undefined;

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async create(input: CreateUserDto): Promise<User> {
    const normalizedEmail = input.email.toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: input.name.trim(),
      },
    });

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async update(id: string, input: UpdateUserDto): Promise<User | undefined> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) return undefined;

    if (input.email !== undefined) {
      const emailOwner = await this.prisma.user.findUnique({
        where: { email: input.email.toLowerCase() },
      });

      if (emailOwner && emailOwner.id !== id) {
        throw new ConflictException('Email already exists');
      }
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: {
        ...(input.email !== undefined ? { email: input.email.toLowerCase() } : {}),
        ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      },
    });

    return {
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) return false;

    await this.prisma.user.delete({ where: { id } });
    return true;
  }
}