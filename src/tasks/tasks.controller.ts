import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import type { PaginatedResult } from '../common/types';
import { CreateTaskDto, ListTasksQueryDto, UpdateTaskDto } from './dto';
import type { Task } from './task.entity';
import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async list(
    @Query() query: ListTasksQueryDto,
  ): Promise<PaginatedResult<Task>> {
    return this.tasksService.list(query);
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateTaskDto,
  ): Promise<Task> {
    const task = await this.tasksService.update(id, body);
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<void> {
    const deleted = await this.tasksService.delete(id);
    if (!deleted) throw new NotFoundException('Task not found');
  }
}
