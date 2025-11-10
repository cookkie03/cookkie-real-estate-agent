/**
 * CONTACT SERVICE
 */
import { Contact, PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from './base/BaseService';
import { ValidationError } from './base/ServiceError';

export interface ContactFilters {
  status?: string;
  city?: string;
  search?: string;
}

export class ContactService extends BaseService<Contact, Prisma.ContactCreateInput, Prisma.ContactUpdateInput> {
  getModelName() {
    return 'contact' as const;
  }

  protected async validate(data: any): Promise<void> {
    if (data.primaryEmail && !this.isValidEmail(data.primaryEmail)) {
      throw new ValidationError('Invalid email format');
    }

    if (data.status && !['active', 'inactive', 'archived', 'blacklist'].includes(data.status)) {
      throw new ValidationError('Invalid status');
    }
  }

  protected supportsSoftDelete(): boolean {
    return true;
  }

  async searchContacts(filters: ContactFilters) {
    const where: Prisma.ContactWhereInput = {};

    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = filters.city;
    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search } },
        { primaryEmail: { contains: filters.search } },
        { primaryPhone: { contains: filters.search } },
      ];
    }

    return this.findMany(where);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}
