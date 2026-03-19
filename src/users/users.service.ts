import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { PaginatedResult } from '../common/types';
import type { CreateUserDto, UpdateUserDto, ListUsersQueryDto } from './dto';
import type { User } from './user.entity';
import { toUserEntity } from './users.mapper';
import { handlePrismaError } from '../common/prisma-error';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

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

    const [total, users] = await this.prisma.client.$transaction([
      this.prisma.client.user.count({ where }),
      this.prisma.client.user.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return {
      data: users.map(toUserEntity),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findById(id: string): Promise<User | undefined> {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) return undefined;

    return toUserEntity(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const user = await this.prisma.client.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return undefined;

    return toUserEntity(user);
  }

  async create(input: CreateUserDto): Promise<User> {
    const normalizedEmail = input.email.toLowerCase();

    try {
      const user = await this.prisma.client.user.create({
        data: {
          email: normalizedEmail,
          name: input.name.trim(),
        },
      });

      return toUserEntity(user);
    } catch (error) {
      handlePrismaError(error, { uniqueMessage: 'Email already exists' });
      throw error; // fallback for TS
    }
  }

  async update(id: string, input: UpdateUserDto): Promise<User | undefined> {
    const existing = await this.prisma.client.user.findUnique({
      where: { id },
    });
    if (!existing) return undefined;

    try {
      const user = await this.prisma.client.user.update({
        where: { id },
        data: {
          ...(input.email !== undefined
            ? { email: input.email.toLowerCase() }
            : {}),
          ...(input.name !== undefined ? { name: input.name.trim() } : {}),
        },
      });

      return toUserEntity(user);
    } catch (error) {
      handlePrismaError(error, { uniqueMessage: 'Email already exists' });
      throw error; // fallback for TS
    }
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.prisma.client.user.findUnique({
      where: { id },
    });
    if (!existing) return false;

    await this.prisma.client.user.delete({ where: { id } });
    return true;
  }
}
