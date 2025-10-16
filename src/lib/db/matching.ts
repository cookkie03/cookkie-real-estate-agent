/**
 * Matching Algorithm - Property-Request Scoring System
 *
 * Calculates compatibility scores between properties and search requests.
 * Scoring breakdown:
 * - Location: 35% (city, zone, distance)
 * - Price: 30% (how close to budget)
 * - Size: 20% (sqm, rooms match)
 * - Features: 15% (required amenities)
 */

import { parseArray } from './helpers';

export interface MatchScore {
  totalScore: number;
  locationScore: number;
  priceScore: number;
  sizeScore: number;
  featuresScore: number;
}

export interface PropertyForMatching {
  id: string;
  city: string;
  zone: string | null;
  latitude: number;
  longitude: number;
  contractType: string;
  propertyType: string;
  priceSale: number | null;
  priceRentMonthly: number | null;
  sqmCommercial: number | null;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  hasElevator: boolean;
  hasParking: boolean;
  hasGarage: boolean;
  hasGarden: boolean;
  hasTerrace: boolean;
  condition: string | null;
  energyClass: string | null;
  yearBuilt: number | null;
  floor: string | null;
}

export interface RequestForMatching {
  id: string;
  contractType: string | null;
  searchCities: string | null; // JSON array
  searchZones: string | null; // JSON array
  searchRadiusKm: number | null;
  centerLatitude: number | null;
  centerLongitude: number | null;
  propertyTypes: string | null; // JSON array
  priceMin: number | null;
  priceMax: number | null;
  sqmMin: number | null;
  sqmMax: number | null;
  roomsMin: number | null;
  roomsMax: number | null;
  bedroomsMin: number | null;
  bathroomsMin: number | null;
  requiresElevator: boolean;
  requiresParking: boolean;
  requiresGarden: boolean;
  requiresTerrace: boolean;
  excludeGroundFloor: boolean;
  excludeTopFloorNoElevator: boolean;
  minCondition: string | null;
  minEnergyClass: string | null;
  maxFloor: number | null;
  minYearBuilt: number | null;
}

/**
 * Calculates distance between two coordinates in kilometers using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculates location score (0-100)
 * Weighted 35% of total score
 */
function calculateLocationScore(
  property: PropertyForMatching,
  request: RequestForMatching
): number {
  const searchCities = parseArray<string>(request.searchCities);
  const searchZones = parseArray<string>(request.searchZones);

  // Perfect match: city in list AND zone in list
  if (searchCities.includes(property.city)) {
    if (property.zone && searchZones.length > 0) {
      return searchZones.includes(property.zone) ? 100 : 70;
    }
    return 100;
  }

  // Radius-based search
  if (
    request.centerLatitude &&
    request.centerLongitude &&
    request.searchRadiusKm
  ) {
    const distance = calculateDistance(
      request.centerLatitude,
      request.centerLongitude,
      property.latitude,
      property.longitude
    );

    if (distance <= request.searchRadiusKm) {
      // Score decreases linearly with distance
      const score = Math.max(0, 100 - (distance / request.searchRadiusKm) * 30);
      return Math.round(score);
    }
  }

  return 0;
}

/**
 * Calculates price score (0-100)
 * Weighted 30% of total score
 */
function calculatePriceScore(
  property: PropertyForMatching,
  request: RequestForMatching
): number {
  const price =
    request.contractType === 'sale'
      ? property.priceSale
      : property.priceRentMonthly;

  if (!price || !request.priceMin || !request.priceMax) return 50; // Neutral if missing

  const min = request.priceMin;
  const max = request.priceMax;

  // Perfect match: within budget
  if (price >= min && price <= max) {
    return 100;
  }

  // Below budget: still good (cheaper is better)
  if (price < min) {
    const deviation = (min - price) / min;
    return Math.max(0, Math.round(100 - deviation * 100));
  }

  // Above budget: penalize proportionally
  if (price > max) {
    const deviation = (price - max) / max;
    return Math.max(0, Math.round(100 - deviation * 150)); // Heavier penalty
  }

  return 50;
}

/**
 * Calculates size score (0-100)
 * Weighted 20% of total score
 */
function calculateSizeScore(
  property: PropertyForMatching,
  request: RequestForMatching
): number {
  let sqmScore = 50;
  let roomsScore = 50;

  // SQM Score
  if (property.sqmCommercial && request.sqmMin && request.sqmMax) {
    const sqm = property.sqmCommercial;
    if (sqm >= request.sqmMin && sqm <= request.sqmMax) {
      sqmScore = 100;
    } else if (sqm < request.sqmMin) {
      const deviation = (request.sqmMin - sqm) / request.sqmMin;
      sqmScore = Math.max(0, Math.round(100 - deviation * 100));
    } else {
      const deviation = (sqm - request.sqmMax) / request.sqmMax;
      sqmScore = Math.max(0, Math.round(100 - deviation * 50)); // Bigger is less bad
    }
  }

  // Rooms Score
  if (property.rooms && request.roomsMin) {
    if (request.roomsMax && property.rooms >= request.roomsMin && property.rooms <= request.roomsMax) {
      roomsScore = 100;
    } else if (property.rooms >= request.roomsMin) {
      roomsScore = 85; // More rooms than min is OK
    } else {
      const deviation = (request.roomsMin - property.rooms) / request.roomsMin;
      roomsScore = Math.max(0, Math.round(100 - deviation * 200));
    }
  }

  // Bedrooms bonus
  if (property.bedrooms && request.bedroomsMin) {
    if (property.bedrooms >= request.bedroomsMin) {
      roomsScore = Math.min(100, roomsScore + 10);
    } else {
      roomsScore -= 15;
    }
  }

  // Average of sqm and rooms
  return Math.round((sqmScore + roomsScore) / 2);
}

/**
 * Calculates features score (0-100)
 * Weighted 15% of total score
 */
function calculateFeaturesScore(
  property: PropertyForMatching,
  request: RequestForMatching
): number {
  let score = 100;
  let penalties = 0;

  // Required features (hard requirements)
  if (request.requiresElevator && !property.hasElevator) {
    penalties += 30;
  }

  if (request.requiresParking && !(property.hasParking || property.hasGarage)) {
    penalties += 25;
  }

  if (request.requiresGarden && !property.hasGarden) {
    penalties += 20;
  }

  if (request.requiresTerrace && !property.hasTerrace) {
    penalties += 20;
  }

  // Exclusions
  if (request.excludeGroundFloor && property.floor === '0') {
    penalties += 25;
  }

  if (request.excludeTopFloorNoElevator && !property.hasElevator) {
    // Rough check if top floor (would need building data)
    penalties += 15;
  }

  // Condition check
  if (request.minCondition) {
    const conditionOrder = ['to_renovate', 'fair', 'good', 'excellent', 'new'];
    const reqIndex = conditionOrder.indexOf(request.minCondition);
    const propIndex = property.condition ? conditionOrder.indexOf(property.condition) : -1;

    if (propIndex >= 0 && propIndex < reqIndex) {
      penalties += 15;
    }
  }

  // Energy class check
  if (request.minEnergyClass && property.energyClass) {
    const energyOrder = ['G', 'F', 'E', 'D', 'C', 'B', 'A', 'A+'];
    const reqIndex = energyOrder.indexOf(request.minEnergyClass);
    const propIndex = energyOrder.indexOf(property.energyClass);

    if (propIndex >= 0 && propIndex < reqIndex) {
      penalties += 10;
    }
  }

  // Year built check
  if (request.minYearBuilt && property.yearBuilt && property.yearBuilt < request.minYearBuilt) {
    penalties += 10;
  }

  score -= penalties;
  return Math.max(0, score);
}

/**
 * Calculates overall match score between property and request
 */
export function calculateMatchScore(
  property: PropertyForMatching,
  request: RequestForMatching
): MatchScore {
  const locationScore = calculateLocationScore(property, request);
  const priceScore = calculatePriceScore(property, request);
  const sizeScore = calculateSizeScore(property, request);
  const featuresScore = calculateFeaturesScore(property, request);

  // Weighted average (35% + 30% + 20% + 15% = 100%)
  const totalScore = Math.round(
    locationScore * 0.35 +
    priceScore * 0.30 +
    sizeScore * 0.20 +
    featuresScore * 0.15
  );

  return {
    totalScore,
    locationScore,
    priceScore,
    sizeScore,
    featuresScore,
  };
}

/**
 * Checks if property passes basic filters for request (pre-scoring filter)
 * Returns true if property should be considered for matching
 */
export function propertyMatchesBasicFilters(
  property: PropertyForMatching,
  request: RequestForMatching
): boolean {
  // Contract type must match
  if (request.contractType && property.contractType !== request.contractType) {
    return false;
  }

  // Property type must be in allowed list (if specified)
  const allowedTypes = parseArray<string>(request.propertyTypes);
  if (allowedTypes.length > 0 && !allowedTypes.includes(property.propertyType)) {
    return false;
  }

  // Price must be in reasonable range (allow 20% buffer)
  if (request.priceMin && request.priceMax) {
    const price = request.contractType === 'sale' ? property.priceSale : property.priceRentMonthly;
    if (price) {
      const buffer = 0.2;
      if (price < request.priceMin * (1 - buffer) || price > request.priceMax * (1 + buffer)) {
        return false;
      }
    }
  }

  // SQM must be in reasonable range (allow 20% buffer)
  if (request.sqmMin && request.sqmMax && property.sqmCommercial) {
    const buffer = 0.2;
    if (
      property.sqmCommercial < request.sqmMin * (1 - buffer) ||
      property.sqmCommercial > request.sqmMax * (1 + buffer)
    ) {
      return false;
    }
  }

  // Rooms minimum (strict)
  if (request.roomsMin && property.rooms && property.rooms < request.roomsMin) {
    return false;
  }

  // Bathrooms minimum (strict)
  if (request.bathroomsMin && property.bathrooms && property.bathrooms < request.bathroomsMin) {
    return false;
  }

  // All filters passed
  return true;
}
