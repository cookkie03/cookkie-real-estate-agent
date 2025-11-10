/**
 * MATCH SERVICE
 * AI-powered property-request matching with scoring
 */
import { Match, PrismaClient, Prisma, MatchStatus, Request, Property } from '@prisma/client';
import { BaseService } from './base/BaseService';
import { ValidationError, NotFoundError } from './base/ServiceError';

export interface MatchCreateDTO {
  requestId: string;
  propertyId: string;
  contactId?: string;
  scoreTotal: number;
  scoreLocation?: number;
  scorePrice?: number;
  scoreSize?: number;
  scoreFeatures?: number;
  scoreCondition?: number;
}

export interface MatchUpdateDTO extends Partial<Omit<MatchCreateDTO, 'requestId' | 'propertyId'>> {
  status?: MatchStatus;
  clientReaction?: string;
  rejectionReason?: string;
  clientNotes?: string;
  agentNotes?: string;
  sentDate?: Date;
  viewedDate?: Date;
  visitedDate?: Date;
}

export interface MatchFilters {
  requestId?: string;
  propertyId?: string;
  contactId?: string;
  status?: MatchStatus | string;
  minScore?: number;
  clientReaction?: string;
}

export interface MatchingScores {
  total: number;
  location: number;
  price: number;
  size: number;
  features: number;
  condition: number;
}

export class MatchService extends BaseService<Match, MatchCreateDTO, MatchUpdateDTO> {
  getModelName() {
    return 'match' as const;
  }

  protected async validate(data: any): Promise<void> {
    // Validate scores (0-100)
    const scoreFields = ['scoreTotal', 'scoreLocation', 'scorePrice', 'scoreSize', 'scoreFeatures', 'scoreCondition'];

    for (const field of scoreFields) {
      if (data[field] !== undefined) {
        if (data[field] < 0 || data[field] > 100) {
          throw new ValidationError(`${field} must be between 0 and 100`);
        }
      }
    }

    // Validate client reaction
    if (data.clientReaction && !['interested', 'neutral', 'not_interested'].includes(data.clientReaction)) {
      throw new ValidationError('Invalid client reaction. Must be: interested, neutral, or not_interested');
    }

    // Validate rejection reason
    const validRejectionReasons = [
      'too_expensive', 'wrong_location', 'too_small', 'too_large',
      'wrong_type', 'poor_condition', 'no_features', 'other'
    ];

    if (data.rejectionReason && !validRejectionReasons.includes(data.rejectionReason)) {
      throw new ValidationError(`Invalid rejection reason. Must be one of: ${validRejectionReasons.join(', ')}`);
    }
  }

  protected supportsSoftDelete(): boolean {
    return false; // Matches use status transitions and closure tracking
  }

  /**
   * Calculate matching score between request and property
   */
  calculateMatchScore(request: Request, property: Property): MatchingScores {
    let locationScore = 0;
    let priceScore = 0;
    let sizeScore = 0;
    let featuresScore = 0;
    let conditionScore = 0;

    // 1. LOCATION SCORE (0-100)
    if (request.searchCities && property.city) {
      const cities = Array.isArray(request.searchCities)
        ? request.searchCities
        : JSON.parse(request.searchCities as string);

      if (cities.includes(property.city)) {
        locationScore = 100;

        // Bonus for zone match
        if (request.searchZones && property.zone) {
          const zones = Array.isArray(request.searchZones)
            ? request.searchZones
            : JSON.parse(request.searchZones as string);

          if (zones.includes(property.zone)) {
            locationScore = 100; // Perfect match
          } else {
            locationScore = 80; // City match only
          }
        }
      }
    }

    // TODO: Add geographic distance scoring if centerLat/centerLng provided

    // 2. PRICE SCORE (0-100)
    const propertyPrice = property.priceSale ? Number(property.priceSale) : 0;

    if (propertyPrice > 0 && request.priceMax) {
      const maxPrice = Number(request.priceMax);
      const minPrice = request.priceMin ? Number(request.priceMin) : 0;

      if (propertyPrice >= minPrice && propertyPrice <= maxPrice) {
        // Perfect range - score based on position in range
        const rangePosition = (propertyPrice - minPrice) / (maxPrice - minPrice);

        // Prefer properties in the middle-to-upper range
        if (rangePosition >= 0.5) {
          priceScore = 100;
        } else {
          priceScore = 70 + (rangePosition * 60); // 70-100
        }
      } else if (propertyPrice < minPrice) {
        // Below budget - still interesting, good deal
        const deviation = (minPrice - propertyPrice) / minPrice;
        priceScore = Math.max(0, 60 - (deviation * 100));
      } else if (propertyPrice > maxPrice) {
        // Above budget - penalize heavily
        const deviation = (propertyPrice - maxPrice) / maxPrice;
        priceScore = Math.max(0, 50 - (deviation * 200));
      }
    }

    // 3. SIZE SCORE (0-100)
    const propertySqm = property.sqmCommercial ? Number(property.sqmCommercial) : 0;

    if (propertySqm > 0) {
      const minSqm = request.sqmMin ? Number(request.sqmMin) : 0;
      const maxSqm = request.sqmMax ? Number(request.sqmMax) : Infinity;

      if (propertySqm >= minSqm && propertySqm <= maxSqm) {
        sizeScore = 100; // Perfect range
      } else if (propertySqm < minSqm) {
        // Too small - penalize
        const deviation = (minSqm - propertySqm) / minSqm;
        sizeScore = Math.max(0, 50 - (deviation * 100));
      } else {
        // Too large - minor penalty (more space is usually ok)
        const deviation = (propertySqm - maxSqm) / maxSqm;
        sizeScore = Math.max(0, 80 - (deviation * 50));
      }
    }

    // Rooms score
    let roomsScore = 0;
    if (property.rooms) {
      const minRooms = request.roomsMin || 0;
      const maxRooms = request.roomsMax || Infinity;

      if (property.rooms >= minRooms && property.rooms <= maxRooms) {
        roomsScore = 100;
      } else if (property.rooms < minRooms) {
        roomsScore = Math.max(0, 50 - ((minRooms - property.rooms) * 15));
      } else {
        roomsScore = Math.max(0, 80 - ((property.rooms - maxRooms) * 10));
      }
    }

    // Combine sqm and rooms (weighted average)
    sizeScore = (sizeScore * 0.6) + (roomsScore * 0.4);

    // 4. FEATURES SCORE (0-100)
    let featuresMatched = 0;
    let featuresRequired = 0;

    const featureChecks = [
      { required: request.requiresElevator, has: property.hasElevator },
      { required: request.requiresParking, has: property.hasParking },
      { required: request.requiresGarage, has: property.hasGarage },
      { required: request.requiresGarden, has: property.hasGarden },
      { required: request.requiresTerrace, has: property.hasTerrace },
      { required: request.requiresBalcony, has: property.hasBalcony },
    ];

    for (const check of featureChecks) {
      if (check.required) {
        featuresRequired++;
        if (check.has) {
          featuresMatched++;
        }
      }
    }

    if (featuresRequired > 0) {
      featuresScore = (featuresMatched / featuresRequired) * 100;
    } else {
      // No specific features required - check for bonus features
      let bonusFeatures = 0;
      if (property.hasElevator) bonusFeatures++;
      if (property.hasParking) bonusFeatures++;
      if (property.hasGarage) bonusFeatures++;
      if (property.hasGarden) bonusFeatures++;
      if (property.hasTerrace) bonusFeatures++;
      if (property.hasBalcony) bonusFeatures++;

      // Give 60 base + 10 per bonus feature
      featuresScore = Math.min(100, 60 + (bonusFeatures * 6.67));
    }

    // 5. CONDITION SCORE (0-100)
    const conditionRank: Record<string, number> = {
      'excellent': 100,
      'good': 85,
      'fair': 70,
      'needs_renovation': 50,
      'poor': 30,
    };

    if (property.condition) {
      conditionScore = conditionRank[property.condition] || 70;

      // Check minimum condition requirement
      if (request.minCondition) {
        const minConditionScore = conditionRank[request.minCondition] || 70;
        if (conditionScore < minConditionScore) {
          conditionScore = Math.min(conditionScore, 40); // Penalize heavily
        }
      }
    } else {
      conditionScore = 70; // Default for unknown condition
    }

    // TOTAL SCORE (weighted average)
    const weights = {
      location: 0.30,  // 30% - Location is king
      price: 0.25,     // 25% - Price is critical
      size: 0.20,      // 20% - Size matters
      features: 0.15,  // 15% - Features are important
      condition: 0.10, // 10% - Condition is flexible
    };

    const totalScore = Math.round(
      (locationScore * weights.location) +
      (priceScore * weights.price) +
      (sizeScore * weights.size) +
      (featuresScore * weights.features) +
      (conditionScore * weights.condition)
    );

    return {
      total: totalScore,
      location: Math.round(locationScore),
      price: Math.round(priceScore),
      size: Math.round(sizeScore),
      features: Math.round(featuresScore),
      condition: Math.round(conditionScore),
    };
  }

  /**
   * Create match with calculated scores
   */
  async createMatch(request: Request, property: Property): Promise<Match> {
    const scores = this.calculateMatchScore(request, property);

    return this.create({
      requestId: request.id,
      propertyId: property.id,
      contactId: request.contactId,
      scoreTotal: scores.total,
      scoreLocation: scores.location,
      scorePrice: scores.price,
      scoreSize: scores.size,
      scoreFeatures: scores.features,
      scoreCondition: scores.condition,
    });
  }

  /**
   * Find top matches for a request
   */
  async findTopMatchesForRequest(requestId: string, limit: number = 10, minScore: number = 60) {
    return this.findMany({
      requestId,
      scoreTotal: { gte: minScore },
    }, {
      orderBy: { scoreTotal: 'desc' },
      take: limit,
    });
  }

  /**
   * Find matches for a property
   */
  async findMatchesForProperty(propertyId: string) {
    return this.findMany({
      propertyId,
    }, {
      orderBy: { scoreTotal: 'desc' },
    });
  }

  /**
   * Update match status with timestamp
   */
  async updateStatus(matchId: string, status: MatchStatus) {
    const updateData: any = { status };

    // Set timestamps based on status
    if (status === 'sent') {
      updateData.sentDate = new Date();
    } else if (status === 'viewed') {
      updateData.viewedDate = new Date();
    } else if (status === 'visited') {
      updateData.visitedDate = new Date();
    } else if (status === 'closed') {
      updateData.closedDate = new Date();
    }

    return this.update(matchId, updateData);
  }

  /**
   * Record client reaction to match
   */
  async recordClientReaction(
    matchId: string,
    reaction: 'interested' | 'neutral' | 'not_interested',
    notes?: string,
    rejectionReason?: string
  ) {
    const updateData: any = {
      clientReaction: reaction,
      clientNotes: notes,
    };

    if (reaction === 'not_interested') {
      updateData.rejectionReason = rejectionReason;
      updateData.status = 'rejected';
    } else if (reaction === 'interested') {
      updateData.status = 'interested';
    }

    return this.update(matchId, updateData);
  }

  /**
   * Close match with reason
   */
  async closeMatch(matchId: string, reason: string, agentNotes?: string) {
    return this.update(matchId, {
      status: 'closed',
      closedDate: new Date(),
      closedReason: reason,
      agentNotes,
    } as any);
  }

  /**
   * Get match statistics for a request
   */
  async getMatchStatistics(requestId: string) {
    const matches = await this.findMany({ requestId });

    const stats = {
      total: matches.length,
      byStat: {} as Record<MatchStatus, number>,
      byReaction: {
        interested: 0,
        neutral: 0,
        not_interested: 0,
      },
      averageScore: 0,
      topScore: 0,
    };

    // Count by status
    for (const match of matches) {
      stats.byStat[match.status] = (stats.byStat[match.status] || 0) + 1;

      if (match.clientReaction) {
        stats.byReaction[match.clientReaction as keyof typeof stats.byReaction]++;
      }
    }

    // Calculate scores
    if (matches.length > 0) {
      const totalScore = matches.reduce((sum, m) => sum + m.scoreTotal, 0);
      stats.averageScore = Math.round(totalScore / matches.length);
      stats.topScore = Math.max(...matches.map(m => m.scoreTotal));
    }

    return stats;
  }

  /**
   * Search matches with complex filters
   */
  async searchMatches(filters: MatchFilters) {
    const where: Prisma.MatchWhereInput = {};

    if (filters.requestId) where.requestId = filters.requestId;
    if (filters.propertyId) where.propertyId = filters.propertyId;
    if (filters.contactId) where.contactId = filters.contactId;
    if (filters.status) where.status = filters.status as MatchStatus;
    if (filters.clientReaction) where.clientReaction = filters.clientReaction;

    if (filters.minScore !== undefined) {
      where.scoreTotal = { gte: filters.minScore };
    }

    return this.findMany(where, {
      orderBy: { scoreTotal: 'desc' },
    });
  }
}
