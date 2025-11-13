/**
 * Client/Contact Entity Types
 * @packageDocumentation
 */

import { ContactStatus } from '../enums';

export interface ContactEntity {
  id: string;
  code: string;
  entityType: string;

  // Personal Info
  fullName: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;

  // Contact Info
  primaryPhone?: string;
  secondaryPhone?: string;
  primaryEmail?: string;
  secondaryEmail?: string;

  // Address
  street?: string;
  civic?: string;
  city?: string;
  province?: string;
  zip?: string;
  country?: string;
  latitude?: number;
  longitude?: number;

  // Profiling
  source?: string;
  leadScore?: number;
  importance: string;

  // Budget
  budgetMin?: number;
  budgetMax?: number;

  // Status
  status: ContactStatus;
  lastContactDate?: Date;
  notes?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactListItem {
  id: string;
  code: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhone?: string;
  city?: string;
  importance: string;
  status: ContactStatus;
  lastContactDate?: Date;
  leadScore?: number;
  createdAt: Date;
}

export interface LeadEntity extends ContactEntity {
  leadScore: number;
  source: string;
  budgetMin?: number;
  budgetMax?: number;
}
