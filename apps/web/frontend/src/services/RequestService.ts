/**
 * REQUEST SERVICE
 * Business logic for client search requests
 */
import { Request, PrismaClient, Prisma, RequestStatus } from '@prisma/client';
import { BaseService } from './base/BaseService';
import { ValidationError, NotFoundError } from './base/ServiceError';

export interface RequestCreateDTO extends Omit<Prisma.RequestCreateInput, 'contact'> {
  contactId: string;
}

export interface RequestUpdateDTO extends Partial<RequestCreateDTO> {}

export interface RequestFilters {
  status?: RequestStatus | string;
  urgency?: string;
  requestType?: string;
  contactId?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
}

export class RequestService extends BaseService<Request, RequestCreateDTO, RequestUpdateDTO> {
  getModelName() {
    return 'request' as const;
  }

  protected async validate(data: any): Promise<void> {
    // Validate request type
    if (data.requestType && !['search_buy', 'search_rent', 'valuation'].includes(data.requestType)) {
      throw new ValidationError('Invalid request type. Must be: search_buy, search_rent, or valuation');
    }

    // Validate urgency
    if (data.urgency && !['low', 'medium', 'high'].includes(data.urgency)) {
      throw new ValidationError('Invalid urgency. Must be: low, medium, or high');
    }

    // Validate contract type
    if (data.contractType && !['sale', 'rent'].includes(data.contractType)) {
      throw new ValidationError('Invalid contract type. Must be: sale or rent');
    }

    // Validate budget
    if (data.priceMin !== undefined && data.priceMin < 0) {
      throw new ValidationError('Minimum price cannot be negative');
    }

    if (data.priceMax !== undefined && data.priceMax < 0) {
      throw new ValidationError('Maximum price cannot be negative');
    }

    if (data.priceMin && data.priceMax && data.priceMin > data.priceMax) {
      throw new ValidationError('Minimum price cannot be greater than maximum price');
    }

    // Validate size requirements
    if (data.sqmMin !== undefined && data.sqmMin < 0) {
      throw new ValidationError('Minimum sqm cannot be negative');
    }

    if (data.sqmMax !== undefined && data.sqmMax < 0) {
      throw new ValidationError('Maximum sqm cannot be negative');
    }

    if (data.sqmMin && data.sqmMax && data.sqmMin > data.sqmMax) {
      throw new ValidationError('Minimum sqm cannot be greater than maximum sqm');
    }

    // Validate rooms
    if (data.roomsMin !== undefined && data.roomsMin < 0) {
      throw new ValidationError('Minimum rooms cannot be negative');
    }

    if (data.roomsMax !== undefined && data.roomsMax < 0) {
      throw new ValidationError('Maximum rooms cannot be negative');
    }

    if (data.roomsMin && data.roomsMax && data.roomsMin > data.roomsMax) {
      throw new ValidationError('Minimum rooms cannot be greater than maximum rooms');
    }

    // Validate bedrooms
    if (data.bedroomsMin !== undefined && data.bedroomsMin < 0) {
      throw new ValidationError('Minimum bedrooms cannot be negative');
    }

    if (data.bedroomsMax !== undefined && data.bedroomsMax < 0) {
      throw new ValidationError('Maximum bedrooms cannot be negative');
    }

    if (data.bedroomsMin && data.bedroomsMax && data.bedroomsMin > data.bedroomsMax) {
      throw new ValidationError('Minimum bedrooms cannot be greater than maximum bedrooms');
    }

    // Validate geographic search
    if (data.searchRadiusKm && data.searchRadiusKm <= 0) {
      throw new ValidationError('Search radius must be positive');
    }

    if (data.centerLatitude && (data.centerLatitude < -90 || data.centerLatitude > 90)) {
      throw new ValidationError('Invalid latitude. Must be between -90 and 90');
    }

    if (data.centerLongitude && (data.centerLongitude < -180 || data.centerLongitude > 180)) {
      throw new ValidationError('Invalid longitude. Must be between -180 and 180');
    }

    // Validate dates
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      throw new ValidationError('Expiration date must be in the future');
    }
  }

  protected supportsSoftDelete(): boolean {
    return false; // Requests use status transitions instead
  }

  /**
   * Find all active requests for a contact
   */
  async findActiveByContact(contactId: string) {
    return this.findMany({
      contactId,
      status: 'active',
    }, {
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find requests by urgency level
   */
  async findByUrgency(urgency: 'low' | 'medium' | 'high') {
    return this.findMany({
      urgency,
      status: 'active',
    }, {
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find expiring requests (within X days)
   */
  async findExpiringSoon(daysThreshold: number = 7) {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);

    return this.findMany({
      status: 'active',
      expiresAt: {
        lte: thresholdDate,
        gte: new Date(),
      },
    }, {
      orderBy: { expiresAt: 'asc' },
    });
  }

  /**
   * Mark request as satisfied by a match
   */
  async markAsSatisfied(requestId: string, matchId: string) {
    const request = await this.findById(requestId);
    if (!request) {
      throw new NotFoundError(`Request ${requestId} not found`);
    }

    if (request.status === 'satisfied') {
      throw new ValidationError('Request is already satisfied');
    }

    return this.update(requestId, {
      status: 'satisfied',
      satisfiedByMatchId: matchId,
      satisfiedDate: new Date(),
    } as any);
  }

  /**
   * Pause/resume request
   */
  async togglePause(requestId: string) {
    const request = await this.findById(requestId);
    if (!request) {
      throw new NotFoundError(`Request ${requestId} not found`);
    }

    const newStatus: RequestStatus = request.status === 'paused' ? 'active' : 'paused';

    return this.update(requestId, {
      status: newStatus,
    } as any);
  }

  /**
   * Search requests with complex filters
   */
  async searchRequests(filters: RequestFilters) {
    const where: Prisma.RequestWhereInput = {};

    if (filters.status) where.status = filters.status as RequestStatus;
    if (filters.urgency) where.urgency = filters.urgency;
    if (filters.requestType) where.requestType = filters.requestType;
    if (filters.contactId) where.contactId = filters.contactId;

    // Price range overlap check
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const priceConditions = [];

      if (filters.priceMin !== undefined) {
        priceConditions.push({ priceMax: { gte: filters.priceMin } });
      }

      if (filters.priceMax !== undefined) {
        priceConditions.push({ priceMin: { lte: filters.priceMax } });
      }

      if (priceConditions.length > 0) {
        where.AND = priceConditions;
      }
    }

    return this.findMany(where, {
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Check if request matches property criteria (for matching algorithm)
   */
  checkPropertyMatch(request: Request, property: any): boolean {
    // Contract type match
    if (request.contractType && property.contractType !== request.contractType) {
      return false;
    }

    // Price range check
    if (request.priceMin && property.priceSale && property.priceSale < request.priceMin) {
      return false;
    }

    if (request.priceMax && property.priceSale && property.priceSale > request.priceMax) {
      return false;
    }

    // Size check
    if (request.sqmMin && property.sqmCommercial && property.sqmCommercial < request.sqmMin) {
      return false;
    }

    if (request.sqmMax && property.sqmCommercial && property.sqmCommercial > request.sqmMax) {
      return false;
    }

    // Rooms check
    if (request.roomsMin && property.rooms && property.rooms < request.roomsMin) {
      return false;
    }

    if (request.roomsMax && property.rooms && property.rooms > request.roomsMax) {
      return false;
    }

    // Required features
    if (request.requiresElevator && !property.hasElevator) {
      return false;
    }

    if (request.requiresParking && !property.hasParking) {
      return false;
    }

    if (request.requiresGarage && !property.hasGarage) {
      return false;
    }

    if (request.requiresGarden && !property.hasGarden) {
      return false;
    }

    if (request.requiresTerrace && !property.hasTerrace) {
      return false;
    }

    if (request.requiresBalcony && !property.hasBalcony) {
      return false;
    }

    // All criteria passed
    return true;
  }
}
