import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserResponse } from './responses/user.response';
import type { PaginatedResult } from '../common/types';
import { UsersService } from './users.service';
import { serialize } from '../common/utils/serialize';
import { CreateUserDto, UpdateUserDto } from './dto';
import type { ListUsersQueryDto } from './dto';
import type { User } from './user.entity';
import { RolesGuard } from '../auth/roles.guard';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AdminOnly } from 'src/auth/admin-only.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @AdminOnly()
  async list(
    @Query() query: ListUsersQueryDto,
  ): Promise<PaginatedResult<UserResponse>> {
    const result = await this.usersService.list(query);
    return {
      ...result,
      data: result.data.map((user) => serialize(UserResponse, user)),
    };
  }

  @Get(':id')
  async get(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<UserResponse> {
    const user = await this.usersService.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return serialize(UserResponse, user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateUserDto): Promise<User> {
    return this.usersService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateUserDto,
  ): Promise<User> {
    const user = await this.usersService.update(id, body);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    const deleted = await this.usersService.delete(id);
    if (!deleted) throw new NotFoundException('User not found');
  }
}
