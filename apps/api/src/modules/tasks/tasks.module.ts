/**
 * Tasks Module
 *
 * Task management, activity tracking, and reminders.
 *
 * ✅ IMPLEMENTED (Phase 4 - Nice to Have):
 * - domain/entities/task.entity.ts - Task entity with full lifecycle
 * - application/services/tasks.service.ts - Task management service
 * - presentation/controllers/tasks.controller.ts - REST API endpoints
 * - presentation/dto/tasks.dto.ts - Request/response DTOs
 *
 * Features:
 * - Task CRUD operations
 * - Task lifecycle (todo → in_progress → completed/cancelled)
 * - Priority levels (low, medium, high, urgent)
 * - Task types (follow-up, viewing, call, email, meeting, etc.)
 * - Due dates and overdue detection
 * - Reminders (email, push, SMS)
 * - Task assignments
 * - Client/property linking
 * - Calendar event integration
 * - Attachments support
 * - Comments and collaboration
 * - Follower notifications
 * - Tags and custom fields
 * - Recurring tasks (RRULE)
 * - Time tracking (estimated vs actual)
 * - Task statistics and metrics
 * - Priority scoring for sorting
 *
 * Task Types:
 * - Follow-up
 * - Property viewing
 * - Phone call
 * - Email
 * - Document preparation
 * - Contract signing
 * - Property inspection
 * - Client meeting
 * - Market research
 * - Other
 *
 * API Endpoints:
 * - GET /tasks - List tasks (with filters)
 * - GET /tasks/:id - Get single task
 * - POST /tasks - Create task
 * - PUT /tasks/:id - Update task
 * - DELETE /tasks/:id - Delete task
 * - POST /tasks/:id/start - Start task
 * - POST /tasks/:id/complete - Complete task
 * - POST /tasks/:id/cancel - Cancel task
 * - POST /tasks/:id/reminders - Add reminder
 * - POST /tasks/:id/attachments - Add attachment
 * - POST /tasks/:id/comments - Add comment
 * - GET /tasks/statistics/summary - Get statistics
 * - GET /tasks/clients/:clientId - Get client tasks
 * - GET /tasks/properties/:propertyId - Get property tasks
 *
 * TODO (Future enhancements):
 * - Task templates
 * - Bulk operations
 * - Task dependencies (prerequisite tasks)
 * - Sub-tasks
 * - Time logging integration
 * - Mobile push notifications
 * - Email digest of daily tasks
 * - Kanban board view
 * - Task automation triggers
 *
 * Best Practices:
 * - Use background jobs for reminder processing
 * - Send notifications via queue
 * - Cache user's active tasks
 * - Index by assignedTo, dueDate, status
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { TasksController } from './presentation/controllers/tasks.controller';
import { TasksService } from './application/services/tasks.service';

@Module({
  imports: [DatabaseModule],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}
