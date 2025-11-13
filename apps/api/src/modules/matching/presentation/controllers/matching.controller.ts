/**
 * Matching Controller (Presentation Layer)
 *
 * REST API endpoints for property-client matching.
 */

import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { MatchingService } from '../../application/services/matching.service';
import {
  MatchingOptionsDto,
  MatchResultDto,
  MatchesResponseDto,
  MatchStatisticsDto,
} from '../dto/matching.dto';
import { MatchingAlgorithm } from '../../domain/algorithms/matching.algorithm';

@ApiTags('matching')
@Controller('matching')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MatchingController {
  private readonly logger = new Logger(MatchingController.name);

  constructor(private matchingService: MatchingService) {}

  /**
   * GET /matching/properties/:propertyId/clients
   * Find best matching clients for a property
   */
  @Get('properties/:propertyId/clients')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find matching clients for a property',
    description:
      'Calculate match scores between a property and all active clients, returning the best matches sorted by score.',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID',
    example: 'cm1abc123',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching clients found successfully',
    type: MatchesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Property not found',
  })
  async findMatchingClientsForProperty(
    @Param('propertyId') propertyId: string,
    @Query() options: MatchingOptionsDto,
  ): Promise<MatchesResponseDto> {
    this.logger.log(
      `Finding matching clients for property: ${propertyId}`,
    );

    const matches = await this.matchingService.findMatchesForProperty(
      propertyId,
      options,
    );

    const matchesDto: MatchResultDto[] = matches.map((match) => ({
      propertyId: match.propertyId,
      clientId: match.clientId,
      totalScore: match.totalScore,
      quality: match.getQualityCategory(),
      scoreBreakdown: options.includeBreakdown
        ? match.scoreBreakdown
        : undefined,
      matchedAt: match.matchedAt,
      weakestComponent: options.includeBreakdown
        ? match.getWeakestComponent()
        : undefined,
      strongestComponent: options.includeBreakdown
        ? match.getStrongestComponent()
        : undefined,
    }));

    const statistics = MatchingAlgorithm.getMatchStatistics(matches);

    return {
      matches: matchesDto,
      statistics,
    };
  }

  /**
   * GET /matching/clients/:clientId/properties
   * Find best matching properties for a client
   */
  @Get('clients/:clientId/properties')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Find matching properties for a client',
    description:
      'Calculate match scores between a client and all available properties, returning the best matches sorted by score.',
  })
  @ApiParam({
    name: 'clientId',
    description: 'Client ID',
    example: 'cm1xyz789',
  })
  @ApiResponse({
    status: 200,
    description: 'Matching properties found successfully',
    type: MatchesResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async findMatchingPropertiesForClient(
    @Param('clientId') clientId: string,
    @Query() options: MatchingOptionsDto,
  ): Promise<MatchesResponseDto> {
    this.logger.log(`Finding matching properties for client: ${clientId}`);

    const matches = await this.matchingService.findMatchesForClient(
      clientId,
      options,
    );

    const matchesDto: MatchResultDto[] = matches.map((match) => ({
      propertyId: match.propertyId,
      clientId: match.clientId,
      totalScore: match.totalScore,
      quality: match.getQualityCategory(),
      scoreBreakdown: options.includeBreakdown
        ? match.scoreBreakdown
        : undefined,
      matchedAt: match.matchedAt,
      weakestComponent: options.includeBreakdown
        ? match.getWeakestComponent()
        : undefined,
      strongestComponent: options.includeBreakdown
        ? match.getStrongestComponent()
        : undefined,
    }));

    const statistics = MatchingAlgorithm.getMatchStatistics(matches);

    return {
      matches: matchesDto,
      statistics,
    };
  }

  /**
   * GET /matching/properties/:propertyId/clients/:clientId
   * Calculate specific match between property and client
   */
  @Get('properties/:propertyId/clients/:clientId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calculate match score between specific property and client',
    description:
      'Calculate detailed match score and breakdown for a specific property-client pair.',
  })
  @ApiParam({
    name: 'propertyId',
    description: 'Property ID',
    example: 'cm1abc123',
  })
  @ApiParam({
    name: 'clientId',
    description: 'Client ID',
    example: 'cm1xyz789',
  })
  @ApiResponse({
    status: 200,
    description: 'Match score calculated successfully',
    type: MatchResultDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Property or client not found',
  })
  async calculateSpecificMatch(
    @Param('propertyId') propertyId: string,
    @Param('clientId') clientId: string,
    @Query() options: MatchingOptionsDto,
  ): Promise<MatchResultDto | null> {
    this.logger.log(
      `Calculating match between property ${propertyId} and client ${clientId}`,
    );

    const match = await this.matchingService.calculateSpecificMatch(
      propertyId,
      clientId,
      options,
    );

    if (!match) {
      return null;
    }

    return {
      propertyId: match.propertyId,
      clientId: match.clientId,
      totalScore: match.totalScore,
      quality: match.getQualityCategory(),
      scoreBreakdown: options.includeBreakdown !== false
        ? match.scoreBreakdown
        : undefined,
      matchedAt: match.matchedAt,
      weakestComponent:
        options.includeBreakdown !== false
          ? match.getWeakestComponent()
          : undefined,
      strongestComponent:
        options.includeBreakdown !== false
          ? match.getStrongestComponent()
          : undefined,
    };
  }
}
