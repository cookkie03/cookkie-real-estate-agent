// src/types/index.ts

import { Prisma } from '@prisma/client';

// --- Core Data Models (derived from Prisma) ---

// Using Prisma's generated types is the best practice.
// This avoids manual duplication and ensures types are always in sync with the schema.
export type Contact = Prisma.ContactGetPayload<{
  include: {
    ownedProperties: true;
    requests: true;
  };
}>;

export type Property = Prisma.PropertyGetPayload<{
  include: {
    owner: true;
    building: true;
  };
}>;

export type Activity = Prisma.ActivityGetPayload<{
  include: {
    contact: true;
    property: true;
  };
}>;

export type Request = Prisma.RequestGetPayload<{
  include: {
    contact: true;
  };
}>;


// --- Component-Specific & UI-related Types ---

/**
 * Represents a message in the AI chat interface.
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Represents an event in the activity feed on the dashboard.
 */
export interface FeedEvent {
  id: string;
  type: string; // Generic string for different event types
  title: string;
  timestamp: string; // Consistent property name, can be formatted as needed
  contactName?: string;
  propertyAddress?: string;
  zone?: string;
  price?: string;
}

/**
 * Represents a connector status for external services.
 */
export interface Connector {
  name: string;
  status: 'connected' | 'error' | 'pending';
  lastSync?: string;
}

/**
 * Represents an item in the mini-agenda on the dashboard.
 * This is likely a simplified version of the main Activity model.
 */
export interface AgendaItem {
  id: string;
  time: string;
  title: string;
  type: 'call' | 'meeting' | 'deadline';
  client?: string;
  address?: string;
}

/**
 * Represents a suggested action item.
 */
export interface ActionItem {
  id: string;
  label: string;
  reason: string;
  score?: number;
}

/**
 * Represents a list of suggested actions.
 */
export interface ActionList {
  title: string;
  icon: React.ElementType;
  items: ActionItem[];
  variant?: "default" | "success" | "warning";
}

/**
 * Represents statistics for a specific area in the IntelToolkit.
 */
export interface AreaStats {
  medianPrice: number;
  timeToSell: number;
  trend: "up" | "down" | "stable";
}