import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

import { randomUUID } from 'crypto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  private users: User[] = [];

  list(): User[] {
    return this.users;
  }

  findById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  create(input: CreateUserDto): User {
    const now = new Date().toISOString();
    const user: User = {
      id: randomUUID(),
      email: input.email.toLowerCase(),
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

    if (input.email !== undefined) user.email = input.email.toLowerCase();
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
