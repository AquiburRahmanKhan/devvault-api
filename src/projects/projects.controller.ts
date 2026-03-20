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
  ForbiddenException,
  UseGuards,
} from '@nestjs/common';
import type { PaginatedResult } from '../common/types';
import {
  CreateProjectDto,
  ListProjectsQueryDto,
  UpdateProjectDto,
} from './dto';
import type { Project } from './project.entity';
import { ProjectsService } from './projects.service';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthUser } from '../auth/auth-user.type';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @Query() query: ListProjectsQueryDto,
  ): Promise<PaginatedResult<Project>> {
    return this.projectsService.list(query);
  }

  @Get(':id')
  async get(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<Project> {
    const project = await this.projectsService.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    return project;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateProjectDto,
  ): Promise<Project> {
    return this.projectsService.create(user.id, body);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectsService.update(id, user.id, body);

    if (project === undefined) throw new NotFoundException('Project not found');
    if (project === null)
      throw new ForbiddenException('You do not own this project');

    return project;
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    const deleted = await this.projectsService.delete(id, user.id);

    if (deleted === false) throw new NotFoundException('Project not found');
    if (deleted === null) {
      throw new ForbiddenException('You do not own this project');
    }
  }
}
