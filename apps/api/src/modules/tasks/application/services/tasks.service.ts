/**
 * Tasks Service (Application Layer)
 *
 * Handles task management, reminders, and activity tracking.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  Task,
  TaskType,
  TaskStatus,
  TaskPriority,
  TaskReminder,
  TaskAttachment,
} from '../../domain/entities/task.entity';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create task
   */
  async createTask(params: {
    type: TaskType;
    title: string;
    description?: string;
    priority?: TaskPriority;
    assignedTo?: string;
    assignedBy?: string;
    clientId?: string;
    propertyId?: string;
    dueDate?: Date;
    estimatedDurationMinutes?: number;
    tags?: string[];
  }): Promise<Task> {
    this.logger.log(`Creating task: ${params.title}`);

    const task = new Task({
      type: params.type,
      title: params.title,
      description: params.description,
      priority: params.priority || TaskPriority.MEDIUM,
      assignedTo: params.assignedTo,
      assignedBy: params.assignedBy,
      clientId: params.clientId,
      propertyId: params.propertyId,
      dueDate: params.dueDate,
      estimatedDurationMinutes: params.estimatedDurationMinutes,
      tags: params.tags || [],
    });

    // TODO: Save to database
    // await this.prisma.task.create({ data: task.toDatabaseFormat() });

    this.logger.log(`✅ Task created: ${task.id}`);
    return task;
  }

  /**
   * Get task by ID
   */
  async getTaskById(taskId: string): Promise<Task> {
    // TODO: Query database
    // const data = await this.prisma.task.findUnique({ where: { id: taskId } });
    // if (!data) throw new NotFoundException(`Task not found: ${taskId}`);
    // return this.mapDatabaseToEntity(data);

    // Mock data for now
    return new Task({
      id: taskId,
      type: TaskType.FOLLOW_UP,
      title: 'Follow up with client',
      status: TaskStatus.TODO,
      priority: TaskPriority.HIGH,
    });
  }

  /**
   * List tasks
   */
  async listTasks(params: {
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedTo?: string;
    clientId?: string;
    propertyId?: string;
    overdue?: boolean;
    dueSoon?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<{ tasks: Task[]; total: number }> {
    this.logger.log('Listing tasks');

    // TODO: Query database with filters
    // const where: any = {};
    // if (params.status) where.status = params.status;
    // if (params.assignedTo) where.assignedTo = params.assignedTo;
    // ...

    // Mock data
    const tasks = [
      new Task({
        id: 'task_1',
        type: TaskType.FOLLOW_UP,
        title: 'Follow up with Mario Rossi',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        clientId: 'client_123',
      }),
      new Task({
        id: 'task_2',
        type: TaskType.PROPERTY_VIEWING,
        title: 'Property viewing at Via Roma 123',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        dueDate: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        propertyId: 'prop_456',
        clientId: 'client_789',
      }),
      new Task({
        id: 'task_3',
        type: TaskType.DOCUMENT_PREPARATION,
        title: 'Prepare contract documents',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000), // 2 days from now
      }),
    ];

    // Apply filters
    let filteredTasks = tasks;
    if (params.status) {
      filteredTasks = filteredTasks.filter((t) => t.status === params.status);
    }
    if (params.priority) {
      filteredTasks = filteredTasks.filter((t) => t.priority === params.priority);
    }
    if (params.overdue) {
      filteredTasks = filteredTasks.filter((t) => t.isOverdue());
    }
    if (params.dueSoon) {
      filteredTasks = filteredTasks.filter((t) => t.isDueSoon());
    }

    // Sort by priority score
    filteredTasks.sort((a, b) => b.getPriorityScore() - a.getPriorityScore());

    return {
      tasks: filteredTasks,
      total: filteredTasks.length,
    };
  }

  /**
   * Update task
   */
  async updateTask(
    taskId: string,
    updates: {
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string;
      dueDate?: Date;
      notes?: string;
    },
  ): Promise<Task> {
    this.logger.log(`Updating task: ${taskId}`);

    const task = await this.getTaskById(taskId);

    // Apply updates
    if (updates.title) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.status) task.status = updates.status;
    if (updates.priority) task.priority = updates.priority;
    if (updates.assignedTo !== undefined) task.assignedTo = updates.assignedTo;
    if (updates.dueDate !== undefined) task.dueDate = updates.dueDate;
    if (updates.notes !== undefined) task.notes = updates.notes;

    task.updatedAt = new Date();

    // TODO: Update in database
    // await this.prisma.task.update({
    //   where: { id: taskId },
    //   data: task.toDatabaseFormat(),
    // });

    this.logger.log(`✅ Task updated: ${taskId}`);
    return task;
  }

  /**
   * Start task
   */
  async startTask(taskId: string): Promise<Task> {
    this.logger.log(`Starting task: ${taskId}`);

    const task = await this.getTaskById(taskId);
    task.start();

    // TODO: Update in database

    return task;
  }

  /**
   * Complete task
   */
  async completeTask(taskId: string): Promise<Task> {
    this.logger.log(`Completing task: ${taskId}`);

    const task = await this.getTaskById(taskId);
    task.complete();

    // TODO: Update in database

    this.logger.log(`✅ Task completed: ${taskId}`);
    return task;
  }

  /**
   * Cancel task
   */
  async cancelTask(taskId: string, reason?: string): Promise<Task> {
    this.logger.log(`Cancelling task: ${taskId}`);

    const task = await this.getTaskById(taskId);
    task.cancel();

    if (reason && task.notes) {
      task.notes += `\n\nCancelled: ${reason}`;
    }

    // TODO: Update in database

    return task;
  }

  /**
   * Delete task
   */
  async deleteTask(taskId: string): Promise<void> {
    this.logger.log(`Deleting task: ${taskId}`);

    // TODO: Delete from database
    // await this.prisma.task.delete({ where: { id: taskId } });

    this.logger.log(`✅ Task deleted: ${taskId}`);
  }

  /**
   * Add reminder to task
   */
  async addReminder(
    taskId: string,
    reminder: TaskReminder,
  ): Promise<Task> {
    this.logger.log(`Adding reminder to task: ${taskId}`);

    const task = await this.getTaskById(taskId);
    task.addReminder(reminder);

    // TODO: Update in database

    return task;
  }

  /**
   * Add attachment to task
   */
  async addAttachment(
    taskId: string,
    attachment: TaskAttachment,
  ): Promise<Task> {
    this.logger.log(`Adding attachment to task: ${taskId}`);

    const task = await this.getTaskById(taskId);
    task.addAttachment(attachment);

    // TODO: Update in database

    return task;
  }

  /**
   * Add comment to task
   */
  async addComment(
    taskId: string,
    userId: string,
    text: string,
  ): Promise<Task> {
    this.logger.log(`Adding comment to task: ${taskId}`);

    const task = await this.getTaskById(taskId);
    task.addComment(userId, text);

    // TODO: Update in database

    return task;
  }

  /**
   * Get tasks by client
   */
  async getTasksByClient(clientId: string): Promise<Task[]> {
    const { tasks } = await this.listTasks({ clientId });
    return tasks;
  }

  /**
   * Get tasks by property
   */
  async getTasksByProperty(propertyId: string): Promise<Task[]> {
    const { tasks } = await this.listTasks({ propertyId });
    return tasks;
  }

  /**
   * Get overdue tasks
   */
  async getOverdueTasks(assignedTo?: string): Promise<Task[]> {
    const { tasks } = await this.listTasks({ overdue: true, assignedTo });
    return tasks;
  }

  /**
   * Get tasks due soon
   */
  async getTasksDueSoon(assignedTo?: string): Promise<Task[]> {
    const { tasks } = await this.listTasks({ dueSoon: true, assignedTo });
    return tasks;
  }

  /**
   * Get task statistics
   */
  async getTaskStatistics(params?: {
    assignedTo?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    total: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<TaskPriority, number>;
    overdue: number;
    dueSoon: number;
    completionRate: number;
    averageCompletionTime: number; // minutes
  }> {
    // TODO: Query database for actual statistics

    return {
      total: 45,
      byStatus: {
        [TaskStatus.TODO]: 15,
        [TaskStatus.IN_PROGRESS]: 12,
        [TaskStatus.COMPLETED]: 15,
        [TaskStatus.CANCELLED]: 2,
        [TaskStatus.ON_HOLD]: 1,
      },
      byPriority: {
        [TaskPriority.LOW]: 10,
        [TaskPriority.MEDIUM]: 20,
        [TaskPriority.HIGH]: 12,
        [TaskPriority.URGENT]: 3,
      },
      overdue: 5,
      dueSoon: 8,
      completionRate: 75.5,
      averageCompletionTime: 45,
    };
  }

  /**
   * Process due reminders (should be called by cron job)
   */
  async processDueReminders(): Promise<void> {
    this.logger.log('Processing due reminders');

    // TODO: Query tasks with unsent reminders that are due
    // TODO: Send reminders via email/push/SMS
    // TODO: Mark reminders as sent

    this.logger.log('✅ Reminders processed');
  }
}
