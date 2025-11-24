/**
 * Task Entity (Domain Layer)
 *
 * Represents a task or activity to be completed.
 */

export enum TaskType {
  FOLLOW_UP = 'follow_up',
  PROPERTY_VIEWING = 'property_viewing',
  PHONE_CALL = 'phone_call',
  EMAIL = 'email',
  DOCUMENT_PREPARATION = 'document_preparation',
  CONTRACT_SIGNING = 'contract_signing',
  PROPERTY_INSPECTION = 'property_inspection',
  CLIENT_MEETING = 'client_meeting',
  MARKET_RESEARCH = 'market_research',
  OTHER = 'other',
}

export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  ON_HOLD = 'on_hold',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface TaskReminder {
  reminderAt: Date;
  method: 'email' | 'push' | 'sms';
  sent: boolean;
}

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number; // bytes
}

export class Task {
  id: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;

  // Task details
  title: string;
  description?: string;
  notes?: string;

  // Assignment
  assignedTo?: string; // User/Agent ID
  assignedBy?: string; // User/Agent ID

  // Linked entities
  clientId?: string;
  propertyId?: string;
  calendarEventId?: string;

  // Timing
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  estimatedDurationMinutes?: number;
  actualDurationMinutes?: number;

  // Reminders
  reminders: TaskReminder[];

  // Attachments
  attachments: TaskAttachment[];

  // Recurrence
  isRecurring: boolean;
  recurrenceRule?: string; // RRULE format
  recurrenceParentId?: string; // Parent recurring task ID

  // Collaboration
  followers: string[]; // User IDs
  comments?: Array<{
    id: string;
    userId: string;
    text: string;
    createdAt: Date;
  }>;

  // Metadata
  tags: string[];
  customFields?: Record<string, any>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Task>) {
    Object.assign(this, data);
    this.id = data.id || this.generateId();
    this.status = data.status || TaskStatus.TODO;
    this.priority = data.priority || TaskPriority.MEDIUM;
    this.reminders = data.reminders || [];
    this.attachments = data.attachments || [];
    this.isRecurring = data.isRecurring || false;
    this.followers = data.followers || [];
    this.tags = data.tags || [];
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
  }

  /**
   * Start task
   */
  start(): void {
    this.status = TaskStatus.IN_PROGRESS;
    this.startDate = new Date();
    this.updatedAt = new Date();
  }

  /**
   * Complete task
   */
  complete(): void {
    this.status = TaskStatus.COMPLETED;
    this.completedAt = new Date();
    this.updatedAt = new Date();

    // Calculate actual duration
    if (this.startDate) {
      const durationMs = this.completedAt.getTime() - this.startDate.getTime();
      this.actualDurationMinutes = Math.floor(durationMs / (1000 * 60));
    }
  }

  /**
   * Cancel task
   */
  cancel(): void {
    this.status = TaskStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  /**
   * Put task on hold
   */
  putOnHold(): void {
    this.status = TaskStatus.ON_HOLD;
    this.updatedAt = new Date();
  }

  /**
   * Resume task
   */
  resume(): void {
    this.status = TaskStatus.IN_PROGRESS;
    this.updatedAt = new Date();
  }

  /**
   * Check if task is overdue
   */
  isOverdue(): boolean {
    if (!this.dueDate) return false;
    if (this.status === TaskStatus.COMPLETED) return false;
    return this.dueDate < new Date();
  }

  /**
   * Check if task is due soon (within next 24 hours)
   */
  isDueSoon(): boolean {
    if (!this.dueDate) return false;
    if (this.status === TaskStatus.COMPLETED) return false;

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return this.dueDate >= now && this.dueDate <= twentyFourHoursFromNow;
  }

  /**
   * Check if task is completed
   */
  isCompleted(): boolean {
    return this.status === TaskStatus.COMPLETED;
  }

  /**
   * Check if task is in progress
   */
  isInProgress(): boolean {
    return this.status === TaskStatus.IN_PROGRESS;
  }

  /**
   * Check if task has high priority
   */
  isHighPriority(): boolean {
    return this.priority === TaskPriority.HIGH || this.priority === TaskPriority.URGENT;
  }

  /**
   * Get time until due (in minutes)
   */
  getTimeUntilDue(): number | null {
    if (!this.dueDate) return null;
    const now = new Date();
    const diffMs = this.dueDate.getTime() - now.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Get time overdue (in minutes)
   */
  getTimeOverdue(): number | null {
    if (!this.isOverdue()) return null;
    const now = new Date();
    const diffMs = now.getTime() - this.dueDate!.getTime();
    return Math.floor(diffMs / (1000 * 60));
  }

  /**
   * Get completion percentage
   */
  getCompletionPercentage(): number {
    if (this.status === TaskStatus.COMPLETED) return 100;
    if (this.status === TaskStatus.TODO) return 0;
    if (this.status === TaskStatus.IN_PROGRESS) return 50;
    return 0;
  }

  /**
   * Add reminder
   */
  addReminder(reminder: TaskReminder): void {
    this.reminders.push(reminder);
    this.updatedAt = new Date();
  }

  /**
   * Mark reminder as sent
   */
  markReminderSent(index: number): void {
    if (this.reminders[index]) {
      this.reminders[index].sent = true;
      this.updatedAt = new Date();
    }
  }

  /**
   * Add attachment
   */
  addAttachment(attachment: TaskAttachment): void {
    this.attachments.push(attachment);
    this.updatedAt = new Date();
  }

  /**
   * Remove attachment
   */
  removeAttachment(attachmentId: string): void {
    this.attachments = this.attachments.filter((a) => a.id !== attachmentId);
    this.updatedAt = new Date();
  }

  /**
   * Add follower
   */
  addFollower(userId: string): void {
    if (!this.followers.includes(userId)) {
      this.followers.push(userId);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove follower
   */
  removeFollower(userId: string): void {
    this.followers = this.followers.filter((f) => f !== userId);
    this.updatedAt = new Date();
  }

  /**
   * Add comment
   */
  addComment(userId: string, text: string): void {
    if (!this.comments) this.comments = [];
    this.comments.push({
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      userId,
      text,
      createdAt: new Date(),
    });
    this.updatedAt = new Date();
  }

  /**
   * Add tag
   */
  addTag(tag: string): void {
    if (!this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  /**
   * Remove tag
   */
  removeTag(tag: string): void {
    this.tags = this.tags.filter((t) => t !== tag);
    this.updatedAt = new Date();
  }

  /**
   * Calculate priority score (for sorting)
   */
  getPriorityScore(): number {
    let score = 0;

    // Base priority
    switch (this.priority) {
      case TaskPriority.URGENT:
        score += 100;
        break;
      case TaskPriority.HIGH:
        score += 75;
        break;
      case TaskPriority.MEDIUM:
        score += 50;
        break;
      case TaskPriority.LOW:
        score += 25;
        break;
    }

    // Overdue penalty
    if (this.isOverdue()) {
      const overdueMinutes = this.getTimeOverdue()!;
      score += Math.min(overdueMinutes / 60, 50); // Max +50 for overdue
    }

    // Due soon bonus
    if (this.isDueSoon()) {
      score += 20;
    }

    return score;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Convert to database format
   */
  toDatabaseFormat(): any {
    return {
      type: this.type,
      status: this.status,
      priority: this.priority,
      title: this.title,
      description: this.description,
      notes: this.notes,
      assignedTo: this.assignedTo,
      assignedBy: this.assignedBy,
      clientId: this.clientId,
      propertyId: this.propertyId,
      calendarEventId: this.calendarEventId,
      dueDate: this.dueDate,
      startDate: this.startDate,
      completedAt: this.completedAt,
      estimatedDurationMinutes: this.estimatedDurationMinutes,
      actualDurationMinutes: this.actualDurationMinutes,
      reminders: JSON.stringify(this.reminders),
      attachments: JSON.stringify(this.attachments),
      isRecurring: this.isRecurring,
      recurrenceRule: this.recurrenceRule,
      recurrenceParentId: this.recurrenceParentId,
      followers: JSON.stringify(this.followers),
      comments: this.comments ? JSON.stringify(this.comments) : null,
      tags: JSON.stringify(this.tags),
      customFields: this.customFields ? JSON.stringify(this.customFields) : null,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
