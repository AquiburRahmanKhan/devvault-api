import { ConflictException, Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

import { randomUUID } from 'crypto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ListUsersQueryDto } from './dto/list-users.query.dto';

export type PaginatedResult<T> = {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

@Injectable()
export class UsersService {
  private users: User[] = [];

  list(query: ListUsersQueryDto): PaginatedResult<User> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'createdAt';
    const order = query.order ?? 'desc';
    const search = query.search?.trim().toLowerCase();

    // 1) filter
    let items = [...this.users];
    if (search) {
      items = items.filter((u) => {
        return (
          u.email.toLowerCase().includes(search) ||
          u.name.toLowerCase().includes(search)
        );
      });
    }

    // 2) sort
    items.sort((a, b) => {
      const av = a[sort];
      const bv = b[sort];
      // all are strings in our entity, so localeCompare works
      const cmp = av.localeCompare(bv);
      return order === 'asc' ? cmp : -cmp;
    });

    // 3) paginate
    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const start = (safePage - 1) * limit;
    const data = items.slice(start, start + limit);

    return {
      data,
      meta: { page: safePage, limit, total, totalPages },
    };
  }

  findById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email.toLowerCase());
  }

  create(input: CreateUserDto): User {
    const now = new Date().toISOString();

    const normalizedEmail = input.email.toLowerCase();

    if (this.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email already exists');
    }

    const user: User = {
      id: randomUUID(),
      email: normalizedEmail,
      name: input.name.trim(),
      createdAt: now,
      updatedAt: now,
    };

    this.users.push(user);
    return user;
  }

  update(id: string, input: UpdateUserDto): User | undefined {
    const user = this.findById(id);
    if (!user) return undefined;

    if (input.email !== undefined) {
      const normalized = input.email.toLowerCase();
      const existing = this.findByEmail(normalized);
      if (existing && existing.id !== id) {
        throw new ConflictException('Email already exists');
      }
      user.email = normalized;
    }
    if (input.name !== undefined) user.name = input.name.trim();
    user.updatedAt = new Date().toISOString();

    return user;
  }

  delete(id: string): boolean {
    const before = this.users.length;
    this.users = this.users.filter((u) => u.id !== id);
    return this.users.length !== before;
  }
}
