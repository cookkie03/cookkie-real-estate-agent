/**
 * Matching Algorithm (Main Orchestrator)
 *
 * Orchestrates all 7 scoring components to calculate property-client match.
 * Aggregates scores with proper weights to produce final match result.
 */

import { MatchResult, ScoreBreakdown } from '../entities/match-result.entity';
import { ZoneScorer } from './zone-scorer';
import { BudgetScorer } from './budget-scorer';
import { TypeScorer } from './type-scorer';
import { SurfaceScorer } from './surface-scorer';
import { AvailabilityScorer } from './availability-scorer';
import { PriorityScorer } from './priority-scorer';
import { AffinityScorer } from './affinity-scorer';

/**
 * Complete property data for matching
 */
export interface PropertyMatchData {
  id: string;
  // Zone data
  latitude: number;
  longitude: number;
  city: string;
  province?: string;
  zone?: string;
  // Budget data
  contractType: 'sale' | 'rent';
  priceSale?: number | null;
  priceRent?: number | null;
  // Type data
  propertyType: string;
  subtype?: string;
  features?: string[];
  // Surface data
  surfaceTotal?: number | null;
  surfaceInternal?: number | null;
  rooms?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  // Availability data
  status: 'draft' | 'available' | 'option' | 'sold' | 'rented' | 'suspended' | 'archived';
  availableFrom?: Date | null;
  estimatedDelivery?: Date | null;
  isImmediate?: boolean;
  // Priority data
  isExclusive?: boolean;
  isPremium?: boolean;
  viewsCount?: number;
  daysOnMarket?: number;
  createdAt?: Date;
  // Affinity data
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasTerrace?: boolean;
  hasBalcony?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasConcierge?: boolean;
  hasStorageRoom?: boolean;
  petFriendly?: boolean;
  energyClass?: string;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  floor?: number;
  exposition?: string;
  furnished?: 'yes' | 'no' | 'partial';
  condition?: 'new' | 'excellent' | 'good' | 'to_renovate';
}

/**
 * Complete client preferences for matching
 */
export interface ClientMatchData {
  id: string;
  // Zone preferences
  preferredCities?: string[];
  preferredZones?: string[];
  maxDistanceKm?: number;
  centerLat?: number;
  centerLon?: number;
  // Budget preferences
  contractType: 'sale' | 'rent';
  budgetMin?: number | null;
  budgetMax?: number | null;
  // Type preferences
  preferredTypes?: string[];
  acceptableTypes?: string[];
  requiredFeatures?: string[];
  desiredFeatures?: string[];
  // Surface requirements
  surfaceMin?: number | null;
  surfaceMax?: number | null;
  roomsMin?: number | null;
  roomsMax?: number | null;
  bedroomsMin?: number | null;
  bathroomsMin?: number | null;
  // Timing preferences
  desiredMoveInDate?: Date | null;
  flexibilityDays?: number;
  urgency?: 'low' | 'medium' | 'high';
  canWait?: boolean;
  // Priority data
  level: 'low' | 'medium' | 'high' | 'vip';
  isVerified?: boolean;
  hasPreApproval?: boolean;
  responseRate?: number;
  pastInteractions?: number;
  // Lifestyle preferences
  hasPets?: boolean;
  needsParking?: boolean;
  prefersElevator?: boolean;
  wantsOutdoorSpace?: boolean;
  prefersTopFloor?: boolean;
  prefersGroundFloor?: boolean;
  needsFurnished?: boolean;
  prefersModern?: boolean;
  ecoConscious?: boolean;
  wantsAmenities?: boolean;
  preferredExposition?: string[];
  specificNeeds?: string[];
}

/**
 * Matching configuration options
 */
export interface MatchingOptions {
  minScore?: number; // Minimum score to consider (default: 40)
  maxResults?: number; // Maximum results to return (default: 50)
  includeBreakdown?: boolean; // Include score breakdown (default: true)
  prioritizeNew?: boolean; // Boost score for new properties (default: false)
  strictMode?: boolean; // Require all critical criteria (default: false)
}

export class MatchingAlgorithm {
  /**
   * Calculate match score between a property and a client
   */
  static calculateMatch(
    property: PropertyMatchData,
    client: ClientMatchData,
    options: MatchingOptions = {},
  ): MatchResult | null {
    // 1. Pre-validation: Check critical criteria
    if (options.strictMode && !this.meetsCriticalCriteria(property, client)) {
      return null; // Property doesn't meet minimum requirements
    }

    // 2. Calculate individual scores
    const scoreBreakdown: ScoreBreakdown = {
      zone: ZoneScorer.calculate(
        {
          latitude: property.latitude,
          longitude: property.longitude,
          city: property.city,
          province: property.province,
          zone: property.zone,
        },
        {
          preferredCities: client.preferredCities,
          preferredZones: client.preferredZones,
          maxDistanceKm: client.maxDistanceKm,
          centerLat: client.centerLat,
          centerLon: client.centerLon,
        },
      ),

      budget: BudgetScorer.calculate(
        {
          contractType: property.contractType,
          priceSale: property.priceSale,
          priceRent: property.priceRent,
        },
        {
          contractType: client.contractType,
          budgetMin: client.budgetMin,
          budgetMax: client.budgetMax,
        },
      ),

      type: TypeScorer.calculate(
        {
          propertyType: property.propertyType,
          subtype: property.subtype,
          features: property.features,
        },
        {
          preferredTypes: client.preferredTypes,
          acceptableTypes: client.acceptableTypes,
          requiredFeatures: client.requiredFeatures,
          desiredFeatures: client.desiredFeatures,
        },
      ),

      surface: SurfaceScorer.calculate(
        {
          surfaceTotal: property.surfaceTotal,
          surfaceInternal: property.surfaceInternal,
          rooms: property.rooms,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
        },
        {
          surfaceMin: client.surfaceMin,
          surfaceMax: client.surfaceMax,
          roomsMin: client.roomsMin,
          roomsMax: client.roomsMax,
          bedroomsMin: client.bedroomsMin,
          bathroomsMin: client.bathroomsMin,
        },
      ),

      availability: AvailabilityScorer.calculate(
        {
          status: property.status,
          availableFrom: property.availableFrom,
          estimatedDelivery: property.estimatedDelivery,
          isImmediate: property.isImmediate,
        },
        {
          desiredMoveInDate: client.desiredMoveInDate,
          flexibilityDays: client.flexibilityDays,
          urgency: client.urgency,
          canWait: client.canWait,
        },
      ),

      priority: PriorityScorer.calculate(
        {
          status: property.status,
          isExclusive: property.isExclusive,
          isPremium: property.isPremium,
          viewsCount: property.viewsCount,
          daysOnMarket: property.daysOnMarket,
          createdAt: property.createdAt,
        },
        {
          level: client.level,
          isVerified: client.isVerified,
          hasPreApproval: client.hasPreApproval,
          responseRate: client.responseRate,
          pastInteractions: client.pastInteractions,
        },
      ),

      affinity: AffinityScorer.calculate(
        {
          hasElevator: property.hasElevator,
          hasParking: property.hasParking,
          hasGarden: property.hasGarden,
          hasTerrace: property.hasTerrace,
          hasBalcony: property.hasBalcony,
          hasPool: property.hasPool,
          hasGym: property.hasGym,
          hasConcierge: property.hasConcierge,
          hasStorageRoom: property.hasStorageRoom,
          petFriendly: property.petFriendly,
          energyClass: property.energyClass,
          hasAirConditioning: property.hasAirConditioning,
          hasHeating: property.hasHeating,
          floor: property.floor,
          exposition: property.exposition,
          furnished: property.furnished,
          condition: property.condition,
        },
        {
          hasPets: client.hasPets,
          needsParking: client.needsParking,
          prefersElevator: client.prefersElevator,
          wantsOutdoorSpace: client.wantsOutdoorSpace,
          prefersTopFloor: client.prefersTopFloor,
          prefersGroundFloor: client.prefersGroundFloor,
          needsFurnished: client.needsFurnished,
          prefersModern: client.prefersModern,
          ecoConscious: client.ecoConscious,
          wantsAmenities: client.wantsAmenities,
          preferredExposition: client.preferredExposition,
          specificNeeds: client.specificNeeds,
        },
      ),
    };

    // 3. Create match result
    const matchResult = new MatchResult({
      propertyId: property.id,
      clientId: client.id,
      scoreBreakdown,
    });

    // 4. Apply optional boosts
    if (options.prioritizeNew && property.daysOnMarket && property.daysOnMarket <= 7) {
      // Boost new properties slightly (already factored in priority scorer)
    }

    // 5. Check minimum score threshold
    const minScore = options.minScore ?? 40;
    if (matchResult.totalScore < minScore) {
      return null; // Below minimum threshold
    }

    return matchResult;
  }

  /**
   * Batch calculate matches between a property and multiple clients
   */
  static calculatePropertyMatches(
    property: PropertyMatchData,
    clients: ClientMatchData[],
    options: MatchingOptions = {},
  ): MatchResult[] {
    const matches: MatchResult[] = [];

    for (const client of clients) {
      const match = this.calculateMatch(property, client, options);
      if (match) {
        matches.push(match);
      }
    }

    // Sort by total score descending
    matches.sort((a, b) => b.totalScore - a.totalScore);

    // Apply max results limit
    const maxResults = options.maxResults ?? 50;
    return matches.slice(0, maxResults);
  }

  /**
   * Batch calculate matches between a client and multiple properties
   */
  static calculateClientMatches(
    client: ClientMatchData,
    properties: PropertyMatchData[],
    options: MatchingOptions = {},
  ): MatchResult[] {
    const matches: MatchResult[] = [];

    for (const property of properties) {
      const match = this.calculateMatch(property, client, options);
      if (match) {
        matches.push(match);
      }
    }

    // Sort by total score descending
    matches.sort((a, b) => b.totalScore - a.totalScore);

    // Apply max results limit
    const maxResults = options.maxResults ?? 50;
    return matches.slice(0, maxResults);
  }

  /**
   * Check if property meets critical criteria for client
   */
  private static meetsCriticalCriteria(
    property: PropertyMatchData,
    client: ClientMatchData,
  ): boolean {
    // 1. Contract type must match
    if (property.contractType !== client.contractType) {
      return false;
    }

    // 2. Property must be in acceptable status
    if (['sold', 'rented', 'archived'].includes(property.status)) {
      return false;
    }

    // 3. Budget must be within range (with some flexibility)
    if (client.budgetMax) {
      const price =
        property.contractType === 'sale'
          ? property.priceSale
          : property.priceRent;
      if (price && price > client.budgetMax * 1.3) {
        // 30% over budget is too much
        return false;
      }
    }

    // 4. Required features must be present
    if (client.requiredFeatures && client.requiredFeatures.length > 0) {
      if (!property.features || property.features.length === 0) {
        return false;
      }
      const hasAllRequired = client.requiredFeatures.every((required) => {
        const normalized = required.toLowerCase();
        return property.features?.some((f) =>
          f.toLowerCase().includes(normalized),
        );
      });
      if (!hasAllRequired) {
        return false;
      }
    }

    // 5. Critical lifestyle factors
    if (client.hasPets && property.petFriendly === false) {
      return false;
    }

    if (client.needsFurnished && property.furnished === 'no') {
      return false;
    }

    return true;
  }

  /**
   * Get match statistics for debugging/analytics
   */
  static getMatchStatistics(matches: MatchResult[]): {
    totalMatches: number;
    averageScore: number;
    excellentCount: number;
    goodCount: number;
    fairCount: number;
    poorCount: number;
    averageBreakdown: ScoreBreakdown;
  } {
    if (matches.length === 0) {
      return {
        totalMatches: 0,
        averageScore: 0,
        excellentCount: 0,
        goodCount: 0,
        fairCount: 0,
        poorCount: 0,
        averageBreakdown: {
          zone: 0,
          budget: 0,
          type: 0,
          surface: 0,
          availability: 0,
          priority: 0,
          affinity: 0,
        },
      };
    }

    const totalScore = matches.reduce((sum, m) => sum + m.totalScore, 0);
    const categories = {
      excellent: matches.filter((m) => m.getQualityCategory() === 'excellent').length,
      good: matches.filter((m) => m.getQualityCategory() === 'good').length,
      fair: matches.filter((m) => m.getQualityCategory() === 'fair').length,
      poor: matches.filter((m) => m.getQualityCategory() === 'poor').length,
    };

    const avgBreakdown: ScoreBreakdown = {
      zone: matches.reduce((sum, m) => sum + m.scoreBreakdown.zone, 0) / matches.length,
      budget: matches.reduce((sum, m) => sum + m.scoreBreakdown.budget, 0) / matches.length,
      type: matches.reduce((sum, m) => sum + m.scoreBreakdown.type, 0) / matches.length,
      surface: matches.reduce((sum, m) => sum + m.scoreBreakdown.surface, 0) / matches.length,
      availability: matches.reduce((sum, m) => sum + m.scoreBreakdown.availability, 0) / matches.length,
      priority: matches.reduce((sum, m) => sum + m.scoreBreakdown.priority, 0) / matches.length,
      affinity: matches.reduce((sum, m) => sum + m.scoreBreakdown.affinity, 0) / matches.length,
    };

    return {
      totalMatches: matches.length,
      averageScore: totalScore / matches.length,
      excellentCount: categories.excellent,
      goodCount: categories.good,
      fairCount: categories.fair,
      poorCount: categories.poor,
      averageBreakdown: avgBreakdown,
    };
  }
}
