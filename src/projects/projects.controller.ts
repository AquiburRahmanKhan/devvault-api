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
import { serialize } from '../common/utils/serialize';
import { ProjectResponse } from './responses/project.response';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListProjectsQueryDto,
  ): Promise<PaginatedResult<ProjectResponse>> {
    const result = await this.projectsService.list(user.id, query);

    return {
      ...result,
      data: result.data.map((project) => serialize(ProjectResponse, project)),
    };
  }

  @Get(':id')
  async get(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<ProjectResponse> {
    const project = await this.projectsService.findById(id);
    if (!project) throw new NotFoundException('Project not found');
    return serialize(ProjectResponse, project);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() body: CreateProjectDto,
  ): Promise<ProjectResponse> {
    const project = await this.projectsService.create(user.id, body);
    return serialize(ProjectResponse, project);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentUser() user: AuthUser,
    @Body() body: UpdateProjectDto,
  ): Promise<ProjectResponse> {
    const project = await this.projectsService.update(id, user.id, body);

    if (project === undefined) throw new NotFoundException('Project not found');
    if (project === null)
      throw new ForbiddenException('You do not own this project');

    return serialize(ProjectResponse, project);
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
