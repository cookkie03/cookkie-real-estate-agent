/**
 * PROPERTY SERVICE
 * Business logic per gestione immobili
 */
import { Property, PrismaClient, Prisma } from '@prisma/client';
import { BaseService } from './base/BaseService';
import { ValidationError, NotFoundError } from './base/ServiceError';

export interface PropertyCreateDTO extends Omit<Prisma.PropertyCreateInput, 'owner' | 'building'> {
  ownerContactId: string;
  buildingId?: string;
}

export interface PropertyUpdateDTO extends Partial<PropertyCreateDTO> {}

export interface PropertyFilters {
  status?: string;
  contractType?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  roomsMin?: number;
  roomsMax?: number;
  propertyType?: string;
}

export class PropertyService extends BaseService<Property, PropertyCreateDTO, PropertyUpdateDTO> {
  getModelName() {
    return 'property' as const;
  }

  protected async validate(data: any): Promise<void> {
    if (data.priceSale !== undefined && data.priceSale < 0) {
      throw new ValidationError('Sale price cannot be negative');
    }

    if (data.priceRent !== undefined && data.priceRent < 0) {
      throw new ValidationError('Rent price cannot be negative');
    }

    if (data.rooms !== undefined && data.rooms < 0) {
      throw new ValidationError('Rooms cannot be negative');
    }

    if (data.contractType && !['sale', 'rent', 'both'].includes(data.contractType)) {
      throw new ValidationError('Invalid contract type');
    }
  }

  protected supportsSoftDelete(): boolean {
    return true;
  }

  async findAvailableProperties(filters: PropertyFilters = {}) {
    const where: Prisma.PropertyWhereInput = {
      status: 'available',
      ...this.buildFilters(filters),
    };

    return this.findMany(where, {
      orderBy: { urgencyScore: 'desc' },
    });
  }

  async calculateUrgencyScore(propertyId: string): Promise<number> {
    const activities = await this.prisma.activity.findMany({
      where: { propertyId },
      orderBy: { date: 'desc' },
      take: 10,
    });

    const score = this.computeUrgencyFromActivities(activities);

    await this.update(propertyId, { urgencyScore: score } as any);

    return score;
  }

  private buildFilters(filters: PropertyFilters): Prisma.PropertyWhereInput {
    const where: Prisma.PropertyWhereInput = {};

    if (filters.contractType) where.contractType = filters.contractType;
    if (filters.city) where.city = filters.city;
    if (filters.propertyType) where.propertyType = filters.propertyType;

    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      where.priceSale = {};
      if (filters.priceMin) where.priceSale.gte = filters.priceMin;
      if (filters.priceMax) where.priceSale.lte = filters.priceMax;
    }

    if (filters.roomsMin !== undefined || filters.roomsMax !== undefined) {
      where.rooms = {};
      if (filters.roomsMin) where.rooms.gte = filters.roomsMin;
      if (filters.roomsMax) where.rooms.lte = filters.roomsMax;
    }

    return where;
  }

  private computeUrgencyFromActivities(activities: any[]): number {
    if (activities.length === 0) return 0;

    const now = new Date();
    const recentActivities = activities.filter(
      a => (now.getTime() - new Date(a.date).getTime()) / (1000 * 60 * 60 * 24) <= 30
    );

    return Math.min(5, Math.floor(recentActivities.length / 2));
  }
}
