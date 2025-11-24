/**
 * Tasks Controller (Presentation Layer)
 *
 * REST API endpoints for task management and activity tracking.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { TasksService } from '../../application/services/tasks.service';
import {
  CreateTaskDto,
  UpdateTaskDto,
  TaskDto,
  TaskListDto,
  AddReminderDto,
  AddAttachmentDto,
  AddCommentDto,
  TaskStatisticsDto,
} from '../dto/tasks.dto';
import { TaskStatus, TaskPriority } from '../../domain/entities/task.entity';

@ApiTags('tasks')
@Controller('tasks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class TasksController {
  private readonly logger = new Logger(TasksController.name);

  constructor(private tasksService: TasksService) {}

  /**
   * POST /tasks
   * Create new task
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create task',
    description: 'Create a new task.',
  })
  @ApiResponse({
    status: 201,
    description: 'Task created',
    type: TaskDto,
  })
  async createTask(@Body() dto: CreateTaskDto): Promise<TaskDto> {
    this.logger.log(`Creating task: ${dto.title}`);

    const task = await this.tasksService.createTask({
      type: dto.type,
      title: dto.title,
      description: dto.description,
      priority: dto.priority,
      assignedTo: dto.assignedTo,
      assignedBy: dto.assignedBy,
      clientId: dto.clientId,
      propertyId: dto.propertyId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      estimatedDurationMinutes: dto.estimatedDurationMinutes,
      tags: dto.tags,
    });

    return this.mapTaskToDto(task);
  }

  /**
   * GET /tasks
   * List tasks
   */
  @Get()
  @ApiOperation({
    summary: 'List tasks',
    description: 'List tasks with optional filters.',
  })
  @ApiQuery({ name: 'status', required: false, enum: TaskStatus })
  @ApiQuery({ name: 'priority', required: false, enum: TaskPriority })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  @ApiQuery({ name: 'clientId', required: false, type: String })
  @ApiQuery({ name: 'propertyId', required: false, type: String })
  @ApiQuery({ name: 'overdue', required: false, type: Boolean })
  @ApiQuery({ name: 'dueSoon', required: false, type: Boolean })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Tasks list',
    type: TaskListDto,
  })
  async listTasks(
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('assignedTo') assignedTo?: string,
    @Query('clientId') clientId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('overdue') overdue?: boolean,
    @Query('dueSoon') dueSoon?: boolean,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<TaskListDto> {
    const result = await this.tasksService.listTasks({
      status,
      priority,
      assignedTo,
      clientId,
      propertyId,
      overdue,
      dueSoon,
      limit,
      offset,
    });

    return {
      tasks: result.tasks.map((t) => this.mapTaskToDto(t)),
      total: result.total,
    };
  }

  /**
   * GET /tasks/:id
   * Get single task
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get task',
    description: 'Get a single task by ID.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task found',
    type: TaskDto,
  })
  async getTask(@Param('id') id: string): Promise<TaskDto> {
    const task = await this.tasksService.getTaskById(id);
    return this.mapTaskToDto(task);
  }

  /**
   * PUT /tasks/:id
   * Update task
   */
  @Put(':id')
  @ApiOperation({
    summary: 'Update task',
    description: 'Update an existing task.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task updated',
    type: TaskDto,
  })
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<TaskDto> {
    this.logger.log(`Updating task: ${id}`);

    const task = await this.tasksService.updateTask(id, {
      title: dto.title,
      description: dto.description,
      status: dto.status,
      priority: dto.priority,
      assignedTo: dto.assignedTo,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      notes: dto.notes,
    });

    return this.mapTaskToDto(task);
  }

  /**
   * DELETE /tasks/:id
   * Delete task
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete task',
    description: 'Delete a task.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 204,
    description: 'Task deleted',
  })
  async deleteTask(@Param('id') id: string): Promise<void> {
    this.logger.log(`Deleting task: ${id}`);
    await this.tasksService.deleteTask(id);
  }

  /**
   * POST /tasks/:id/start
   * Start task
   */
  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start task',
    description: 'Mark task as in progress.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task started',
    type: TaskDto,
  })
  async startTask(@Param('id') id: string): Promise<TaskDto> {
    this.logger.log(`Starting task: ${id}`);
    const task = await this.tasksService.startTask(id);
    return this.mapTaskToDto(task);
  }

  /**
   * POST /tasks/:id/complete
   * Complete task
   */
  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Complete task',
    description: 'Mark task as completed.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task completed',
    type: TaskDto,
  })
  async completeTask(@Param('id') id: string): Promise<TaskDto> {
    this.logger.log(`Completing task: ${id}`);
    const task = await this.tasksService.completeTask(id);
    return this.mapTaskToDto(task);
  }

  /**
   * POST /tasks/:id/cancel
   * Cancel task
   */
  @Post(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cancel task',
    description: 'Mark task as cancelled.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 200,
    description: 'Task cancelled',
    type: TaskDto,
  })
  async cancelTask(
    @Param('id') id: string,
    @Body('reason') reason?: string,
  ): Promise<TaskDto> {
    this.logger.log(`Cancelling task: ${id}`);
    const task = await this.tasksService.cancelTask(id, reason);
    return this.mapTaskToDto(task);
  }

  /**
   * POST /tasks/:id/reminders
   * Add reminder to task
   */
  @Post(':id/reminders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add reminder',
    description: 'Add a reminder to a task.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 201,
    description: 'Reminder added',
    type: TaskDto,
  })
  async addReminder(
    @Param('id') id: string,
    @Body() dto: AddReminderDto,
  ): Promise<TaskDto> {
    this.logger.log(`Adding reminder to task: ${id}`);

    const task = await this.tasksService.addReminder(id, {
      reminderAt: new Date(dto.reminderAt),
      method: dto.method,
      sent: false,
    });

    return this.mapTaskToDto(task);
  }

  /**
   * POST /tasks/:id/attachments
   * Add attachment to task
   */
  @Post(':id/attachments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add attachment',
    description: 'Add an attachment to a task.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 201,
    description: 'Attachment added',
    type: TaskDto,
  })
  async addAttachment(
    @Param('id') id: string,
    @Body() dto: AddAttachmentDto,
  ): Promise<TaskDto> {
    this.logger.log(`Adding attachment to task: ${id}`);

    const task = await this.tasksService.addAttachment(id, {
      id: `attach_${Date.now()}`,
      name: dto.name,
      url: dto.url,
      mimeType: dto.mimeType,
      size: dto.size,
    });

    return this.mapTaskToDto(task);
  }

  /**
   * POST /tasks/:id/comments
   * Add comment to task
   */
  @Post(':id/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add comment',
    description: 'Add a comment to a task.',
  })
  @ApiParam({ name: 'id', description: 'Task ID' })
  @ApiResponse({
    status: 201,
    description: 'Comment added',
    type: TaskDto,
  })
  async addComment(
    @Param('id') id: string,
    @Body() dto: AddCommentDto,
  ): Promise<TaskDto> {
    this.logger.log(`Adding comment to task: ${id}`);

    const task = await this.tasksService.addComment(id, dto.userId, dto.text);

    return this.mapTaskToDto(task);
  }

  /**
   * GET /tasks/statistics
   * Get task statistics
   */
  @Get('statistics/summary')
  @ApiOperation({
    summary: 'Get task statistics',
    description: 'Get task statistics and metrics.',
  })
  @ApiQuery({ name: 'assignedTo', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Task statistics',
    type: TaskStatisticsDto,
  })
  async getStatistics(
    @Query('assignedTo') assignedTo?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<TaskStatisticsDto> {
    return await this.tasksService.getTaskStatistics({
      assignedTo,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }

  /**
   * GET /tasks/clients/:clientId
   * Get tasks by client
   */
  @Get('clients/:clientId')
  @ApiOperation({
    summary: 'Get tasks by client',
    description: 'Get all tasks for a specific client.',
  })
  @ApiParam({ name: 'clientId', description: 'Client ID' })
  @ApiResponse({
    status: 200,
    description: 'Client tasks',
    type: [TaskDto],
  })
  async getTasksByClient(
    @Param('clientId') clientId: string,
  ): Promise<TaskDto[]> {
    const tasks = await this.tasksService.getTasksByClient(clientId);
    return tasks.map((t) => this.mapTaskToDto(t));
  }

  /**
   * GET /tasks/properties/:propertyId
   * Get tasks by property
   */
  @Get('properties/:propertyId')
  @ApiOperation({
    summary: 'Get tasks by property',
    description: 'Get all tasks for a specific property.',
  })
  @ApiParam({ name: 'propertyId', description: 'Property ID' })
  @ApiResponse({
    status: 200,
    description: 'Property tasks',
    type: [TaskDto],
  })
  async getTasksByProperty(
    @Param('propertyId') propertyId: string,
  ): Promise<TaskDto[]> {
    const tasks = await this.tasksService.getTasksByProperty(propertyId);
    return tasks.map((t) => this.mapTaskToDto(t));
  }

  /**
   * Map entity to DTO
   */
  private mapTaskToDto(task: any): TaskDto {
    return {
      id: task.id,
      type: task.type,
      status: task.status,
      priority: task.priority,
      title: task.title,
      description: task.description,
      notes: task.notes,
      assignedTo: task.assignedTo,
      assignedBy: task.assignedBy,
      clientId: task.clientId,
      propertyId: task.propertyId,
      calendarEventId: task.calendarEventId,
      dueDate: task.dueDate,
      startDate: task.startDate,
      completedAt: task.completedAt,
      estimatedDurationMinutes: task.estimatedDurationMinutes,
      actualDurationMinutes: task.actualDurationMinutes,
      reminders: task.reminders,
      attachments: task.attachments,
      isRecurring: task.isRecurring,
      recurrenceRule: task.recurrenceRule,
      followers: task.followers,
      comments: task.comments,
      tags: task.tags,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }
}
