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
} from '@nestjs/common';
import type { PaginatedResult } from '../common/types';
import {
  CreateProjectDto,
  ListProjectsQueryDto,
  ProjectOwnerDto,
  UpdateProjectDto,
} from './dto';
import type { Project } from './project.entity';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
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
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() body: CreateProjectDto): Promise<Project> {
    return this.projectsService.create(body);
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() owner: ProjectOwnerDto,
    @Body() body: UpdateProjectDto,
  ): Promise<Project> {
    const project = await this.projectsService.update(id, owner.ownerId, body);

    if (project === undefined) throw new NotFoundException('Project not found');
    if (project === null)
      throw new ForbiddenException('You do not own this project');

    return project;
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() owner: ProjectOwnerDto,
  ): Promise<void> {
    const deleted = await this.projectsService.delete(id, owner.ownerId);

    if (deleted === false) throw new NotFoundException('Project not found');
    if (deleted === null) {
      throw new ForbiddenException('You do not own this project');
    }
  }
}
