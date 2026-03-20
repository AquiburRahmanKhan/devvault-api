import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { PaginatedResult } from '../common/types';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './dto';
import type { Task } from './task.entity';
import { TasksService } from './tasks.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthUser } from '../auth/auth-user.type';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListTasksQueryDto,
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.list(user.id, query);
  }

  @Get(':id')
  async get(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Task> {
    const task = await this.tasksService.findById(id);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksService.create(user.id, body);

    if (task === undefined) throw new NotFoundException('Project not found');
    if (task === null) {
      throw new ForbiddenException('You do not own this project');
    }

    return task;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksService.update(id, user.id, body);

    if (task === undefined) throw new NotFoundException('Task not found');
    if (task === null) {
      throw new ForbiddenException('You do not own this task');
    }

    return task;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    const deleted = await this.tasksService.delete(id, user.id);

    if (deleted === false) throw new NotFoundException('Task not found');
    if (deleted === null) {
      throw new ForbiddenException('You do not own this task');
    }
  }
}
