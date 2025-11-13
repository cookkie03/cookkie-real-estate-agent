/**
 * Matching Service (Application Layer)
 *
 * Orchestrates matching business logic using the domain algorithms.
 * Coordinates between repositories and domain logic.
 */

import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  MatchingAlgorithm,
  PropertyMatchData,
  ClientMatchData,
  MatchingOptions,
} from '../../domain/algorithms/matching.algorithm';
import { MatchResult } from '../../domain/entities/match-result.entity';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find best matches for a specific property
   */
  async findMatchesForProperty(
    propertyId: string,
    options: MatchingOptions = {},
  ): Promise<MatchResult[]> {
    this.logger.log(`Finding matches for property: ${propertyId}`);

    // 1. Fetch property data
    const property = await this.fetchPropertyData(propertyId);
    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found`);
    }

    // 2. Fetch potential clients (active clients looking for this contract type)
    const clients = await this.fetchPotentialClients(property.contractType);

    this.logger.log(
      `Evaluating ${clients.length} potential clients for property ${propertyId}`,
    );

    // 3. Calculate matches
    const matches = MatchingAlgorithm.calculatePropertyMatches(
      property,
      clients,
      options,
    );

    this.logger.log(
      `Found ${matches.length} matches for property ${propertyId}`,
    );

    // 4. Log statistics
    const stats = MatchingAlgorithm.getMatchStatistics(matches);
    this.logger.debug(`Match statistics: ${JSON.stringify(stats)}`);

    return matches;
  }

  /**
   * Find best properties for a specific client
   */
  async findMatchesForClient(
    clientId: string,
    options: MatchingOptions = {},
  ): Promise<MatchResult[]> {
    this.logger.log(`Finding matches for client: ${clientId}`);

    // 1. Fetch client data
    const client = await this.fetchClientData(clientId);
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    // 2. Fetch available properties (matching contract type)
    const properties = await this.fetchAvailableProperties(
      client.contractType,
    );

    this.logger.log(
      `Evaluating ${properties.length} available properties for client ${clientId}`,
    );

    // 3. Calculate matches
    const matches = MatchingAlgorithm.calculateClientMatches(
      client,
      properties,
      options,
    );

    this.logger.log(`Found ${matches.length} matches for client ${clientId}`);

    // 4. Log statistics
    const stats = MatchingAlgorithm.getMatchStatistics(matches);
    this.logger.debug(`Match statistics: ${JSON.stringify(stats)}`);

    return matches;
  }

  /**
   * Calculate match score between specific property and client
   */
  async calculateSpecificMatch(
    propertyId: string,
    clientId: string,
    options: MatchingOptions = {},
  ): Promise<MatchResult | null> {
    this.logger.log(
      `Calculating match between property ${propertyId} and client ${clientId}`,
    );

    const property = await this.fetchPropertyData(propertyId);
    if (!property) {
      throw new NotFoundException(`Property ${propertyId} not found`);
    }

    const client = await this.fetchClientData(clientId);
    if (!client) {
      throw new NotFoundException(`Client ${clientId} not found`);
    }

    const match = MatchingAlgorithm.calculateMatch(property, client, options);

    if (match) {
      this.logger.log(
        `Match score: ${match.totalScore} (${match.getQualityCategory()})`,
      );
    } else {
      this.logger.log('No match - below minimum threshold');
    }

    return match;
  }

  /**
   * Fetch property data and transform to match data format
   */
  private async fetchPropertyData(
    propertyId: string,
  ): Promise<PropertyMatchData | null> {
    const property = await this.prisma.property.findUnique({
      where: { id: propertyId },
    });

    if (!property) {
      return null;
    }

    // Calculate days on market
    const daysOnMarket = property.createdAt
      ? Math.floor(
          (Date.now() - property.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : undefined;

    return {
      id: property.id,
      latitude: property.latitude,
      longitude: property.longitude,
      city: property.city,
      province: property.province || undefined,
      zone: property.zone || undefined,
      contractType: property.contractType as 'sale' | 'rent',
      priceSale: property.priceSale,
      priceRent: property.priceRent,
      propertyType: property.propertyType,
      subtype: property.subtype || undefined,
      features: property.features
        ? JSON.parse(property.features as string)
        : undefined,
      surfaceTotal: property.surfaceTotal,
      surfaceInternal: property.surfaceInternal,
      rooms: property.rooms,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      status: property.status as any,
      availableFrom: property.availableFrom,
      estimatedDelivery: property.estimatedDelivery,
      isImmediate: property.isImmediate || false,
      isExclusive: property.isExclusive || false,
      isPremium: property.isPremium || false,
      viewsCount: property.viewsCount || 0,
      daysOnMarket,
      createdAt: property.createdAt,
      hasElevator: property.hasElevator || false,
      hasParking: property.hasParking || false,
      hasGarden: property.hasGarden || false,
      hasTerrace: property.hasTerrace || false,
      hasBalcony: property.hasBalcony || false,
      hasPool: property.hasPool || false,
      hasGym: property.hasGym || false,
      hasConcierge: property.hasConcierge || false,
      hasStorageRoom: property.hasStorageRoom || false,
      petFriendly: property.petFriendly || false,
      energyClass: property.energyClass || undefined,
      hasAirConditioning: property.hasAirConditioning || false,
      hasHeating: property.hasHeating || false,
      floor: property.floor,
      exposition: property.exposition || undefined,
      furnished: property.furnished as any,
      condition: property.condition as any,
    };
  }

  /**
   * Fetch client data and transform to match data format
   */
  private async fetchClientData(
    clientId: string,
  ): Promise<ClientMatchData | null> {
    const client = await this.prisma.contact.findUnique({
      where: { id: clientId },
    });

    if (!client) {
      return null;
    }

    return {
      id: client.id,
      preferredCities: client.preferredCities
        ? JSON.parse(client.preferredCities as string)
        : undefined,
      preferredZones: client.preferredZones
        ? JSON.parse(client.preferredZones as string)
        : undefined,
      maxDistanceKm: client.maxDistanceKm,
      centerLat: client.centerLat,
      centerLon: client.centerLon,
      contractType: client.contractType as 'sale' | 'rent',
      budgetMin: client.budgetMin,
      budgetMax: client.budgetMax,
      preferredTypes: client.preferredTypes
        ? JSON.parse(client.preferredTypes as string)
        : undefined,
      acceptableTypes: client.acceptableTypes
        ? JSON.parse(client.acceptableTypes as string)
        : undefined,
      requiredFeatures: client.requiredFeatures
        ? JSON.parse(client.requiredFeatures as string)
        : undefined,
      desiredFeatures: client.desiredFeatures
        ? JSON.parse(client.desiredFeatures as string)
        : undefined,
      surfaceMin: client.surfaceMin,
      surfaceMax: client.surfaceMax,
      roomsMin: client.roomsMin,
      roomsMax: client.roomsMax,
      bedroomsMin: client.bedroomsMin,
      bathroomsMin: client.bathroomsMin,
      desiredMoveInDate: client.desiredMoveInDate,
      flexibilityDays: client.flexibilityDays,
      urgency: client.urgency as any,
      canWait: client.canWait || false,
      level: (client.priority || 'medium') as any,
      isVerified: client.isVerified || false,
      hasPreApproval: client.hasPreApproval || false,
      responseRate: client.responseRate,
      pastInteractions: client.interactionCount || 0,
      hasPets: client.hasPets || false,
      needsParking: client.needsParking || false,
      prefersElevator: client.prefersElevator || false,
      wantsOutdoorSpace: client.wantsOutdoorSpace || false,
      prefersTopFloor: client.prefersTopFloor || false,
      prefersGroundFloor: client.prefersGroundFloor || false,
      needsFurnished: client.needsFurnished || false,
      prefersModern: client.prefersModern || false,
      ecoConscious: client.ecoConscious || false,
      wantsAmenities: client.wantsAmenities || false,
      preferredExposition: client.preferredExposition
        ? JSON.parse(client.preferredExposition as string)
        : undefined,
      specificNeeds: client.specificNeeds
        ? JSON.parse(client.specificNeeds as string)
        : undefined,
    };
  }

  /**
   * Fetch potential clients for a contract type
   */
  private async fetchPotentialClients(
    contractType: 'sale' | 'rent',
  ): Promise<ClientMatchData[]> {
    const clients = await this.prisma.contact.findMany({
      where: {
        contractType,
        status: 'active', // Only active clients
      },
      take: 500, // Limit to prevent performance issues
    });

    const clientsData: ClientMatchData[] = [];

    for (const client of clients) {
      const data = await this.fetchClientData(client.id);
      if (data) {
        clientsData.push(data);
      }
    }

    return clientsData;
  }

  /**
   * Fetch available properties for a contract type
   */
  private async fetchAvailableProperties(
    contractType: 'sale' | 'rent',
  ): Promise<PropertyMatchData[]> {
    const properties = await this.prisma.property.findMany({
      where: {
        contractType,
        status: {
          in: ['available', 'draft', 'option'], // Available statuses
        },
      },
      take: 500, // Limit to prevent performance issues
    });

    const propertiesData: PropertyMatchData[] = [];

    for (const property of properties) {
      const data = await this.fetchPropertyData(property.id);
      if (data) {
        propertiesData.push(data);
      }
    }

    return propertiesData;
  }
}
