/**
 * Client Entity (Domain)
 *
 * Represents a contact/client in the CRM.
 */

import { ContactStatus } from '@crm-immobiliare/shared-types';

export class Client {
  id: string;
  code: string;
  entityType: string;
  fullName: string;
  primaryEmail?: string;
  primaryPhone?: string;
  city?: string;
  status: ContactStatus;
  importance: string;
  leadScore?: number;
  budgetMin?: number;
  budgetMax?: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: Partial<Client>) {
    Object.assign(this, data);
  }

  isValid(): boolean {
    return !!(this.fullName && (this.primaryEmail || this.primaryPhone));
  }

  isLead(): boolean {
    return this.leadScore !== undefined && this.leadScore > 0;
  }
}
