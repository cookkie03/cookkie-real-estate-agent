/**
 * Surface Scorer (Peso: 15%)
 *
 * Scores property-client match based on size/surface area requirements.
 * Considers both internal surface and number of rooms.
 */

interface PropertySurface {
  surfaceTotal?: number | null; // Total surface in m²
  surfaceInternal?: number | null; // Internal surface in m²
  rooms?: number | null; // Number of rooms
  bedrooms?: number | null; // Number of bedrooms
  bathrooms?: number | null; // Number of bathrooms
}

interface ClientSurfaceRequirements {
  surfaceMin?: number | null; // Minimum m²
  surfaceMax?: number | null; // Maximum m²
  roomsMin?: number | null; // Minimum rooms
  roomsMax?: number | null; // Maximum rooms
  bedroomsMin?: number | null; // Minimum bedrooms
  bathroomsMin?: number | null; // Minimum bathrooms
}

export class SurfaceScorer {
  /**
   * Calculate surface match score (0-100)
   */
  static calculate(
    property: PropertySurface,
    requirements: ClientSurfaceRequirements,
  ): number {
    // If no requirements specified, give neutral score
    if (this.hasNoRequirements(requirements)) {
      return 50;
    }

    let totalScore = 0;
    let componentCount = 0;

    // 1. Surface area score (40 points if specified)
    if (requirements.surfaceMin || requirements.surfaceMax) {
      const surfaceScore = this.calculateSurfaceScore(property, requirements);
      totalScore += surfaceScore * 0.4;
      componentCount++;
    }

    // 2. Rooms count score (30 points if specified)
    if (requirements.roomsMin || requirements.roomsMax) {
      const roomsScore = this.calculateRoomsScore(property, requirements);
      totalScore += roomsScore * 0.3;
      componentCount++;
    }

    // 3. Bedrooms count score (20 points if specified)
    if (requirements.bedroomsMin) {
      const bedroomsScore = this.calculateBedroomsScore(property, requirements);
      totalScore += bedroomsScore * 0.2;
      componentCount++;
    }

    // 4. Bathrooms count score (10 points if specified)
    if (requirements.bathroomsMin) {
      const bathroomsScore = this.calculateBathroomsScore(property, requirements);
      totalScore += bathroomsScore * 0.1;
      componentCount++;
    }

    // If no components were evaluated, return neutral score
    if (componentCount === 0) {
      return 50;
    }

    // Normalize the score to 0-100 range
    return Math.round(totalScore);
  }

  /**
   * Calculate surface area match score (0-100)
   */
  private static calculateSurfaceScore(
    property: PropertySurface,
    requirements: ClientSurfaceRequirements,
  ): number {
    const surface = property.surfaceInternal || property.surfaceTotal;

    if (!surface) {
      return 50; // Neutral if surface unknown
    }

    const min = requirements.surfaceMin || 0;
    const max = requirements.surfaceMax || Infinity;

    // Perfect match: within range (100 points)
    if (surface >= min && surface <= max) {
      return 100;
    }

    // Below minimum
    if (surface < min) {
      const shortfall = min - surface;
      const allowedShortfall = min * 0.15; // 15% below acceptable

      if (shortfall <= allowedShortfall) {
        const ratio = 1 - shortfall / allowedShortfall;
        return Math.round(60 + ratio * 40); // 60-100 points
      }
      return 0; // Too small
    }

    // Above maximum
    if (surface > max) {
      const excess = surface - max;
      const allowedExcess = max * 0.25; // 25% above acceptable

      if (excess <= allowedExcess) {
        const ratio = 1 - excess / allowedExcess;
        return Math.round(70 + ratio * 30); // 70-100 points
      }
      return 30; // Much larger (still somewhat acceptable)
    }

    return 50;
  }

  /**
   * Calculate rooms count match score (0-100)
   */
  private static calculateRoomsScore(
    property: PropertySurface,
    requirements: ClientSurfaceRequirements,
  ): number {
    if (!property.rooms) {
      return 50; // Neutral if rooms unknown
    }

    const min = requirements.roomsMin || 0;
    const max = requirements.roomsMax || Infinity;

    // Perfect match: within range
    if (property.rooms >= min && property.rooms <= max) {
      return 100;
    }

    // Below minimum
    if (property.rooms < min) {
      const shortfall = min - property.rooms;
      if (shortfall === 1) return 50; // 1 room less is acceptable
      return 0; // Too few rooms
    }

    // Above maximum
    if (property.rooms > max) {
      const excess = property.rooms - max;
      if (excess === 1) return 80; // 1 room more is good
      if (excess === 2) return 60; // 2 rooms more is acceptable
      return 40; // Much more rooms
    }

    return 50;
  }

  /**
   * Calculate bedrooms count match score (0-100)
   */
  private static calculateBedroomsScore(
    property: PropertySurface,
    requirements: ClientSurfaceRequirements,
  ): number {
    if (!property.bedrooms) {
      return 50; // Neutral if bedrooms unknown
    }

    const min = requirements.bedroomsMin || 0;

    // Meets or exceeds minimum
    if (property.bedrooms >= min) {
      const excess = property.bedrooms - min;
      if (excess === 0) return 100; // Exact match
      if (excess === 1) return 90; // 1 extra bedroom
      if (excess === 2) return 80; // 2 extra bedrooms
      return 70; // Many extra bedrooms
    }

    // Below minimum
    const shortfall = min - property.bedrooms;
    if (shortfall === 1) return 40; // 1 bedroom less might work
    return 0; // Too few bedrooms
  }

  /**
   * Calculate bathrooms count match score (0-100)
   */
  private static calculateBathroomsScore(
    property: PropertySurface,
    requirements: ClientSurfaceRequirements,
  ): number {
    if (!property.bathrooms) {
      return 50; // Neutral if bathrooms unknown
    }

    const min = requirements.bathroomsMin || 1;

    // Meets or exceeds minimum
    if (property.bathrooms >= min) {
      return 100;
    }

    // Below minimum
    const shortfall = min - property.bathrooms;
    if (shortfall === 1) return 50; // 1 bathroom less might be acceptable
    return 0; // Too few bathrooms
  }

  /**
   * Check if no requirements were specified
   */
  private static hasNoRequirements(
    requirements: ClientSurfaceRequirements,
  ): boolean {
    return (
      !requirements.surfaceMin &&
      !requirements.surfaceMax &&
      !requirements.roomsMin &&
      !requirements.roomsMax &&
      !requirements.bedroomsMin &&
      !requirements.bathroomsMin
    );
  }
}
