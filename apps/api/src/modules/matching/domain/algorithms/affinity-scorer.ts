/**
 * Affinity Scorer (Peso: 5%)
 *
 * Scores property-client match based on personal preferences and soft factors.
 * Considers lifestyle, amenities, neighborhood characteristics.
 */

interface PropertyAmenities {
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
  energyClass?: string; // A+, A, B, C, D, E, F, G
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  floor?: number;
  exposition?: string; // Nord, Sud, Est, Ovest
  furnished?: 'yes' | 'no' | 'partial';
  condition?: 'new' | 'excellent' | 'good' | 'to_renovate';
}

interface ClientLifestyle {
  hasPets?: boolean;
  needsParking?: boolean;
  prefersElevator?: boolean;
  wantsOutdoorSpace?: boolean; // Garden or terrace
  prefersTopFloor?: boolean;
  prefersGroundFloor?: boolean;
  needsFurnished?: boolean;
  prefersModern?: boolean; // Prefers new/excellent condition
  ecoConscious?: boolean; // Cares about energy efficiency
  wantsAmenities?: boolean; // Values gym, pool, concierge
  preferredExposition?: string[]; // Preferred sun exposition
  specificNeeds?: string[]; // Any specific requirements
}

export class AffinityScorer {
  /**
   * Calculate affinity match score (0-100)
   */
  static calculate(
    property: PropertyAmenities,
    lifestyle: ClientLifestyle,
  ): number {
    let score = 0;
    let totalChecks = 0;

    // 1. Critical lifestyle factors (40 points)
    const criticalScore = this.calculateCriticalFactors(property, lifestyle);
    score += criticalScore.score;
    totalChecks += criticalScore.checks;

    // 2. Preferred amenities (30 points)
    const amenitiesScore = this.calculateAmenitiesScore(property, lifestyle);
    score += amenitiesScore.score;
    totalChecks += amenitiesScore.checks;

    // 3. Nice-to-have features (20 points)
    const niceToHaveScore = this.calculateNiceToHave(property, lifestyle);
    score += niceToHaveScore.score;
    totalChecks += niceToHaveScore.checks;

    // 4. Environmental factors (10 points)
    const environmentalScore = this.calculateEnvironmental(property, lifestyle);
    score += environmentalScore.score;
    totalChecks += environmentalScore.checks;

    // If no lifestyle preferences specified, give neutral score
    if (totalChecks === 0) {
      return 50;
    }

    return Math.round(score);
  }

  /**
   * Calculate critical lifestyle factors (must-haves)
   */
  private static calculateCriticalFactors(
    property: PropertyAmenities,
    lifestyle: ClientLifestyle,
  ): { score: number; checks: number } {
    let score = 0;
    let checks = 0;

    // Pets (critical if client has pets)
    if (lifestyle.hasPets !== undefined) {
      checks++;
      if (lifestyle.hasPets && property.petFriendly) {
        score += 15; // Critical match
      } else if (lifestyle.hasPets && !property.petFriendly) {
        score += 0; // Deal breaker
      } else {
        score += 10; // Not relevant but ok
      }
    }

    // Parking (important for car owners)
    if (lifestyle.needsParking !== undefined) {
      checks++;
      if (lifestyle.needsParking && property.hasParking) {
        score += 10; // Important match
      } else if (lifestyle.needsParking && !property.hasParking) {
        score += 0; // Significant issue
      } else {
        score += 7; // Not needed
      }
    }

    // Elevator (important for elderly/disabled or high floors)
    if (lifestyle.prefersElevator !== undefined) {
      checks++;
      if (lifestyle.prefersElevator && property.hasElevator) {
        score += 8; // Important match
      } else if (lifestyle.prefersElevator && !property.hasElevator) {
        if (property.floor && property.floor > 2) {
          score += 0; // Problem - high floor without elevator
        } else {
          score += 4; // Low floor, acceptable
        }
      } else {
        score += 6; // Not needed
      }
    }

    // Furnished (critical for some clients)
    if (lifestyle.needsFurnished !== undefined) {
      checks++;
      if (lifestyle.needsFurnished && property.furnished === 'yes') {
        score += 7; // Perfect match
      } else if (
        lifestyle.needsFurnished &&
        property.furnished === 'partial'
      ) {
        score += 4; // Partial match
      } else if (lifestyle.needsFurnished && property.furnished === 'no') {
        score += 0; // Not suitable
      } else {
        score += 5; // Not relevant
      }
    }

    return { score, checks };
  }

  /**
   * Calculate preferred amenities score
   */
  private static calculateAmenitiesScore(
    property: PropertyAmenities,
    lifestyle: ClientLifestyle,
  ): { score: number; checks: number } {
    let score = 0;
    let checks = 0;

    // Outdoor space preference
    if (lifestyle.wantsOutdoorSpace !== undefined) {
      checks++;
      const hasOutdoor = property.hasGarden || property.hasTerrace || property.hasBalcony;
      if (lifestyle.wantsOutdoorSpace && hasOutdoor) {
        score += 12; // Great match
      } else if (lifestyle.wantsOutdoorSpace && !hasOutdoor) {
        score += 3; // Missing desired feature
      } else {
        score += 8; // Not important
      }
    }

    // Amenities preference (gym, pool, concierge)
    if (lifestyle.wantsAmenities !== undefined) {
      checks++;
      const hasLuxuryAmenities =
        property.hasPool || property.hasGym || property.hasConcierge;
      if (lifestyle.wantsAmenities && hasLuxuryAmenities) {
        score += 10; // Great match
      } else if (lifestyle.wantsAmenities && !hasLuxuryAmenities) {
        score += 2; // Missing desired features
      } else {
        score += 7; // Not important
      }
    }

    // Modern preference
    if (lifestyle.prefersModern !== undefined) {
      checks++;
      const isModern =
        property.condition === 'new' || property.condition === 'excellent';
      if (lifestyle.prefersModern && isModern) {
        score += 8; // Good match
      } else if (lifestyle.prefersModern && property.condition === 'to_renovate') {
        score += 1; // Not ideal
      } else {
        score += 6; // Neutral
      }
    }

    return { score, checks };
  }

  /**
   * Calculate nice-to-have features score
   */
  private static calculateNiceToHave(
    property: PropertyAmenities,
    lifestyle: ClientLifestyle,
  ): { score: number; checks: number } {
    let score = 0;
    let checks = 0;

    // Floor preference
    if (lifestyle.prefersTopFloor !== undefined || lifestyle.prefersGroundFloor !== undefined) {
      checks++;
      if (property.floor !== undefined) {
        if (lifestyle.prefersTopFloor && property.floor >= 4) {
          score += 8; // High floor preference met
        } else if (lifestyle.prefersGroundFloor && property.floor === 0) {
          score += 8; // Ground floor preference met
        } else {
          score += 5; // Preference not met but ok
        }
      } else {
        score += 5; // Floor unknown
      }
    }

    // Exposition preference
    if (
      lifestyle.preferredExposition &&
      lifestyle.preferredExposition.length > 0
    ) {
      checks++;
      if (property.exposition) {
        const matches = lifestyle.preferredExposition.some((pref) =>
          property.exposition?.toLowerCase().includes(pref.toLowerCase()),
        );
        if (matches) {
          score += 7; // Exposition preference met
        } else {
          score += 3; // Not preferred exposition
        }
      } else {
        score += 5; // Exposition unknown
      }
    }

    // Storage room
    if (property.hasStorageRoom) {
      score += 5; // Always a nice bonus
      checks++;
    }

    return { score, checks };
  }

  /**
   * Calculate environmental/efficiency factors
   */
  private static calculateEnvironmental(
    property: PropertyAmenities,
    lifestyle: ClientLifestyle,
  ): { score: number; checks: number } {
    let score = 0;
    let checks = 0;

    // Energy efficiency
    if (lifestyle.ecoConscious !== undefined) {
      checks++;
      if (property.energyClass) {
        const energyScore = this.getEnergyClassScore(property.energyClass);
        if (lifestyle.ecoConscious) {
          score += energyScore; // Up to 10 points for good energy class
        } else {
          score += 5; // Not important but ok
        }
      } else {
        score += 5; // Energy class unknown
      }
    }

    return { score, checks };
  }

  /**
   * Get score based on energy class
   */
  private static getEnergyClassScore(energyClass: string): number {
    const normalized = energyClass.toUpperCase().replace('+', 'PLUS');

    const scores: Record<string, number> = {
      'APLUS': 10,
      'A': 9,
      'B': 7,
      'C': 5,
      'D': 3,
      'E': 2,
      'F': 1,
      'G': 0,
    };

    return scores[normalized] || 5;
  }

  /**
   * Calculate lifestyle compatibility percentage
   * Used for analytics and reporting
   */
  static calculateCompatibility(
    property: PropertyAmenities,
    lifestyle: ClientLifestyle,
  ): number {
    const score = this.calculate(property, lifestyle);
    return Math.round(score);
  }
}
