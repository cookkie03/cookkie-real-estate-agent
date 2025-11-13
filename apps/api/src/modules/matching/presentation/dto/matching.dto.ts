/**
 * Matching DTOs (Presentation Layer)
 *
 * Data Transfer Objects for matching endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query parameters for matching requests
 */
export class MatchingOptionsDto {
  @ApiPropertyOptional({
    description: 'Minimum match score to include in results (0-100)',
    default: 40,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  minScore?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of results to return',
    default: 50,
    minimum: 1,
    maximum: 500,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(500)
  @Type(() => Number)
  maxResults?: number;

  @ApiPropertyOptional({
    description: 'Include detailed score breakdown for each component',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeBreakdown?: boolean;

  @ApiPropertyOptional({
    description: 'Boost score for newly listed properties',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  prioritizeNew?: boolean;

  @ApiPropertyOptional({
    description:
      'Strict mode - require all critical criteria to be met (contract type, budget, required features)',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  strictMode?: boolean;
}

/**
 * Score breakdown response
 */
export class ScoreBreakdownDto {
  @ApiProperty({
    description: 'Zone/location score (0-100, peso: 25%)',
    example: 85,
  })
  zone: number;

  @ApiProperty({
    description: 'Budget/price score (0-100, peso: 20%)',
    example: 90,
  })
  budget: number;

  @ApiProperty({
    description: 'Property type score (0-100, peso: 15%)',
    example: 75,
  })
  type: number;

  @ApiProperty({
    description: 'Surface/size score (0-100, peso: 15%)',
    example: 80,
  })
  surface: number;

  @ApiProperty({
    description: 'Availability/timing score (0-100, peso: 10%)',
    example: 70,
  })
  availability: number;

  @ApiProperty({
    description: 'Priority score (0-100, peso: 10%)',
    example: 65,
  })
  priority: number;

  @ApiProperty({
    description: 'Affinity/lifestyle score (0-100, peso: 5%)',
    example: 60,
  })
  affinity: number;
}

/**
 * Match result response
 */
export class MatchResultDto {
  @ApiProperty({
    description: 'Property ID',
    example: 'cm1abc123',
  })
  propertyId: string;

  @ApiProperty({
    description: 'Client ID',
    example: 'cm1xyz789',
  })
  clientId: string;

  @ApiProperty({
    description: 'Total weighted match score (0-100)',
    example: 78.5,
  })
  totalScore: number;

  @ApiProperty({
    description: 'Match quality category',
    enum: ['excellent', 'good', 'fair', 'poor'],
    example: 'good',
  })
  quality: 'excellent' | 'good' | 'fair' | 'poor';

  @ApiPropertyOptional({
    description: 'Detailed score breakdown by component',
    type: ScoreBreakdownDto,
  })
  scoreBreakdown?: ScoreBreakdownDto;

  @ApiProperty({
    description: 'Timestamp when match was calculated',
    example: '2024-01-15T10:30:00.000Z',
  })
  matchedAt: Date;

  @ApiPropertyOptional({
    description: 'Weakest scoring component',
    example: 'affinity',
  })
  weakestComponent?: string;

  @ApiPropertyOptional({
    description: 'Strongest scoring component',
    example: 'budget',
  })
  strongestComponent?: string;
}

/**
 * Match statistics response
 */
export class MatchStatisticsDto {
  @ApiProperty({
    description: 'Total number of matches found',
    example: 25,
  })
  totalMatches: number;

  @ApiProperty({
    description: 'Average match score',
    example: 72.3,
  })
  averageScore: number;

  @ApiProperty({
    description: 'Number of excellent matches (score >= 80)',
    example: 5,
  })
  excellentCount: number;

  @ApiProperty({
    description: 'Number of good matches (score 60-79)',
    example: 12,
  })
  goodCount: number;

  @ApiProperty({
    description: 'Number of fair matches (score 40-59)',
    example: 8,
  })
  fairCount: number;

  @ApiProperty({
    description: 'Number of poor matches (score < 40)',
    example: 0,
  })
  poorCount: number;

  @ApiProperty({
    description: 'Average score breakdown across all matches',
    type: ScoreBreakdownDto,
  })
  averageBreakdown: ScoreBreakdownDto;
}

/**
 * Matches response with optional statistics
 */
export class MatchesResponseDto {
  @ApiProperty({
    description: 'List of match results',
    type: [MatchResultDto],
  })
  matches: MatchResultDto[];

  @ApiPropertyOptional({
    description: 'Match statistics (if requested)',
    type: MatchStatisticsDto,
  })
  statistics?: MatchStatisticsDto;
}
