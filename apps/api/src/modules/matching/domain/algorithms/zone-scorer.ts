/**
 * Zone Scorer (Peso: 25%)
 *
 * Scores property-client match based on location/zone preferences.
 * Uses Haversine formula for distance calculation.
 */

interface PropertyLocation {
  latitude: number;
  longitude: number;
  city: string;
  province?: string;
  zone?: string;
}

interface ClientPreferences {
  preferredCities?: string[];
  preferredZones?: string[];
  maxDistanceKm?: number;
  centerLat?: number;
  centerLon?: number;
}

export class ZoneScorer {
  private static readonly MAX_DISTANCE_KM = 50; // Default max distance
  private static readonly EARTH_RADIUS_KM = 6371;

  /**
   * Calculate zone match score (0-100)
   */
  static calculate(
    property: PropertyLocation,
    preferences: ClientPreferences,
  ): number {
    let score = 0;

    // 1. Exact city match (40 points)
    if (this.hasExactCityMatch(property, preferences)) {
      score += 40;
    }

    // 2. Zone match (30 points)
    if (this.hasZoneMatch(property, preferences)) {
      score += 30;
    }

    // 3. Distance-based score (30 points)
    if (preferences.centerLat && preferences.centerLon) {
      const distanceScore = this.calculateDistanceScore(property, preferences);
      score += distanceScore;
    } else if (!preferences.centerLat && !preferences.centerLon) {
      // If no center coordinates, give neutral score for distance component
      score += 15; // Half of max distance points
    }

    return Math.min(100, score);
  }

  /**
   * Check if property city matches client preferred cities
   */
  private static hasExactCityMatch(
    property: PropertyLocation,
    preferences: ClientPreferences,
  ): boolean {
    if (!preferences.preferredCities || preferences.preferredCities.length === 0) {
      return false;
    }

    const normalizedPropertyCity = property.city.toLowerCase().trim();
    return preferences.preferredCities.some(
      (city) => city.toLowerCase().trim() === normalizedPropertyCity,
    );
  }

  /**
   * Check if property zone matches client preferred zones
   */
  private static hasZoneMatch(
    property: PropertyLocation,
    preferences: ClientPreferences,
  ): boolean {
    if (
      !property.zone ||
      !preferences.preferredZones ||
      preferences.preferredZones.length === 0
    ) {
      return false;
    }

    const normalizedPropertyZone = property.zone.toLowerCase().trim();
    return preferences.preferredZones.some(
      (zone) => zone.toLowerCase().trim() === normalizedPropertyZone,
    );
  }

  /**
   * Calculate distance-based score (0-30 points)
   */
  private static calculateDistanceScore(
    property: PropertyLocation,
    preferences: ClientPreferences,
  ): number {
    const distance = this.calculateDistance(
      property.latitude,
      property.longitude,
      preferences.centerLat!,
      preferences.centerLon!,
    );

    const maxDistance = preferences.maxDistanceKm || this.MAX_DISTANCE_KM;

    if (distance > maxDistance) {
      return 0; // Too far
    }

    // Linear decay: closer = higher score
    const ratio = 1 - distance / maxDistance;
    return Math.round(ratio * 30);
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return this.EARTH_RADIUS_KM * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
