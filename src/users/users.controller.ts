import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import type { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(): User[] {
    return this.usersService.list();
  }

  @Get(':id')
  get(@Param('id') id: string): User {
    const user = this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Post()
  create(@Body() body: CreateUserDto): User {
    return this.usersService.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateUserDto): User {
    const user = this.usersService.update(id, body);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Delete(':id')
  remove(@Param('id') id: string): { ok: true } {
    const deleted = this.usersService.delete(id);
    if (!deleted) throw new NotFoundException('User not found');
    return { ok: true };
  }
}
