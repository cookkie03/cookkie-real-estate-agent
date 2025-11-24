/**
 * Shared Enums
 *
 * These enums mirror the Prisma schema enums
 * @packageDocumentation
 */

export enum ContactStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  BLACKLIST = 'blacklist',
}

export enum PropertyStatus {
  DRAFT = 'draft',
  AVAILABLE = 'available',
  OPTION = 'option',
  SOLD = 'sold',
  RENTED = 'rented',
  SUSPENDED = 'suspended',
  ARCHIVED = 'archived',
}

export enum RequestStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  SATISFIED = 'satisfied',
  CANCELLED = 'cancelled',
}

export enum MatchStatus {
  SUGGESTED = 'suggested',
  SENT = 'sent',
  VIEWED = 'viewed',
  VISITED = 'visited',
  INTERESTED = 'interested',
  REJECTED = 'rejected',
  CLOSED = 'closed',
}

export enum ActivityStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed',
}

export enum EntityType {
  PERSON = 'person',
  COMPANY = 'company',
}

export enum ContractType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  VILLA = 'villa',
  OFFICE = 'office',
  GARAGE = 'garage',
  LAND = 'land',
}

export enum Importance {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  VIP = 'vip',
}

export enum Priority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum Urgency {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}
