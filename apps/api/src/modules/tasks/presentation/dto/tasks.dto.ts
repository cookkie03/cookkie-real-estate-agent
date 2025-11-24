/**
 * Tasks DTOs (Presentation Layer)
 *
 * Data Transfer Objects for Tasks endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsDate,
} from 'class-validator';
import {
  TaskType,
  TaskStatus,
  TaskPriority,
  TaskReminder,
  TaskAttachment,
} from '../../domain/entities/task.entity';

/**
 * Create task DTO
 */
export class CreateTaskDto {
  @ApiProperty({
    description: 'Task type',
    enum: TaskType,
    example: TaskType.FOLLOW_UP,
  })
  @IsEnum(TaskType)
  type: TaskType;

  @ApiProperty({
    description: 'Task title',
    example: 'Follow up with Mario Rossi',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Assigned to (user ID)',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Assigned by (user ID)',
  })
  @IsOptional()
  @IsString()
  assignedBy?: string;

  @ApiPropertyOptional({
    description: 'Linked client ID',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Linked property ID',
  })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'Due date (ISO 8601)',
    example: '2025-11-20T14:00:00Z',
  })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 30,
  })
  @IsOptional()
  @IsNumber()
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Tags',
    example: ['urgent', 'client-request'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

/**
 * Update task DTO
 */
export class UpdateTaskDto {
  @ApiPropertyOptional({
    description: 'Task title',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Task description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Task status',
    enum: TaskStatus,
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({
    description: 'Task priority',
    enum: TaskPriority,
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({
    description: 'Assigned to (user ID)',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Due date (ISO 8601)',
  })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

/**
 * Task DTO (response)
 */
export class TaskDto {
  @ApiProperty({
    description: 'Task ID',
  })
  id: string;

  @ApiProperty({
    description: 'Task type',
    enum: TaskType,
  })
  type: TaskType;

  @ApiProperty({
    description: 'Task status',
    enum: TaskStatus,
  })
  status: TaskStatus;

  @ApiProperty({
    description: 'Task priority',
    enum: TaskPriority,
  })
  priority: TaskPriority;

  @ApiProperty({
    description: 'Task title',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Task description',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
  })
  notes?: string;

  @ApiPropertyOptional({
    description: 'Assigned to',
  })
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Assigned by',
  })
  assignedBy?: string;

  @ApiPropertyOptional({
    description: 'Linked client ID',
  })
  clientId?: string;

  @ApiPropertyOptional({
    description: 'Linked property ID',
  })
  propertyId?: string;

  @ApiPropertyOptional({
    description: 'Linked calendar event ID',
  })
  calendarEventId?: string;

  @ApiPropertyOptional({
    description: 'Due date',
  })
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'Start date',
  })
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Completed at',
  })
  completedAt?: Date;

  @ApiPropertyOptional({
    description: 'Estimated duration (minutes)',
  })
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({
    description: 'Actual duration (minutes)',
  })
  actualDurationMinutes?: number;

  @ApiProperty({
    description: 'Reminders',
  })
  reminders: TaskReminder[];

  @ApiProperty({
    description: 'Attachments',
  })
  attachments: TaskAttachment[];

  @ApiProperty({
    description: 'Is recurring task',
  })
  isRecurring: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence rule (RRULE)',
  })
  recurrenceRule?: string;

  @ApiProperty({
    description: 'Followers (user IDs)',
  })
  followers: string[];

  @ApiPropertyOptional({
    description: 'Comments',
  })
  comments?: Array<{
    id: string;
    userId: string;
    text: string;
    createdAt: Date;
  }>;

  @ApiProperty({
    description: 'Tags',
  })
  tags: string[];

  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated at',
  })
  updatedAt: Date;
}

/**
 * Task list DTO
 */
export class TaskListDto {
  @ApiProperty({
    description: 'Tasks',
    type: [TaskDto],
  })
  tasks: TaskDto[];

  @ApiProperty({
    description: 'Total count',
  })
  total: number;
}

/**
 * Add reminder DTO
 */
export class AddReminderDto {
  @ApiProperty({
    description: 'Reminder time (ISO 8601)',
    example: '2025-11-20T13:00:00Z',
  })
  @IsString()
  reminderAt: string;

  @ApiProperty({
    description: 'Reminder method',
    enum: ['email', 'push', 'sms'],
    example: 'email',
  })
  @IsEnum(['email', 'push', 'sms'])
  method: 'email' | 'push' | 'sms';
}

/**
 * Add attachment DTO
 */
export class AddAttachmentDto {
  @ApiProperty({
    description: 'File name',
    example: 'contract.pdf',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'File URL',
    example: 'https://storage.example.com/files/contract.pdf',
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'MIME type',
    example: 'application/pdf',
  })
  @IsString()
  mimeType: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  @IsNumber()
  size: number;
}

/**
 * Add comment DTO
 */
export class AddCommentDto {
  @ApiProperty({
    description: 'User ID',
    example: 'user_123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Comment text',
    example: 'Client confirmed the viewing appointment.',
  })
  @IsString()
  text: string;
}

/**
 * Task statistics DTO
 */
export class TaskStatisticsDto {
  @ApiProperty({
    description: 'Total tasks',
  })
  total: number;

  @ApiProperty({
    description: 'Tasks by status',
  })
  byStatus: Record<TaskStatus, number>;

  @ApiProperty({
    description: 'Tasks by priority',
  })
  byPriority: Record<TaskPriority, number>;

  @ApiProperty({
    description: 'Overdue tasks count',
  })
  overdue: number;

  @ApiProperty({
    description: 'Tasks due soon count',
  })
  dueSoon: number;

  @ApiProperty({
    description: 'Completion rate (%)',
  })
  completionRate: number;

  @ApiProperty({
    description: 'Average completion time (minutes)',
  })
  averageCompletionTime: number;
}
