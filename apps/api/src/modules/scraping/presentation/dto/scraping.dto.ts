/**
 * Scraping DTOs (Presentation Layer)
 *
 * Data Transfer Objects for scraping endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUrl,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ScrapingPortal, ScrapingStatus } from '../../domain/entities/scraping-job.entity';

/**
 * Create scraping job DTO
 */
export class CreateScrapingJobDto {
  @ApiProperty({
    description: 'Real estate portal to scrape',
    enum: ScrapingPortal,
    example: ScrapingPortal.IMMOBILIARE_IT,
  })
  @IsEnum(ScrapingPortal)
  portal: ScrapingPortal;

  @ApiPropertyOptional({
    description: 'Direct search URL to scrape (optional)',
    example: 'https://www.immobiliare.it/vendita-case/milano/',
  })
  @IsOptional()
  @IsUrl()
  searchUrl?: string;

  @ApiPropertyOptional({
    description: 'Contract type filter',
    enum: ['sale', 'rent'],
    example: 'sale',
  })
  @IsOptional()
  @IsEnum(['sale', 'rent'])
  contractType?: 'sale' | 'rent';

  @ApiPropertyOptional({
    description: 'Property type filter',
    example: 'appartamento',
  })
  @IsOptional()
  @IsString()
  propertyType?: string;

  @ApiPropertyOptional({
    description: 'City filter',
    example: 'Milano',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Minimum price filter',
    example: 300000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum price filter',
    example: 500000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  priceMax?: number;

  @ApiPropertyOptional({
    description: 'Minimum surface filter (m²)',
    example: 80,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  surfaceMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum surface filter (m²)',
    example: 150,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  surfaceMax?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of pages to scrape',
    default: 10,
    minimum: 1,
    maximum: 50,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(50)
  @Type(() => Number)
  maxPages?: number;

  @ApiPropertyOptional({
    description: 'Maximum number of properties to scrape',
    default: 100,
    minimum: 1,
    maximum: 1000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(1000)
  @Type(() => Number)
  maxProperties?: number;

  @ApiPropertyOptional({
    description: 'Enable deduplication (skip existing properties)',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  deduplication?: boolean;

  @ApiPropertyOptional({
    description: 'Automatically import properties to database',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  importToDatabase?: boolean;
}

/**
 * Test scrape DTO
 */
export class TestScrapeDto {
  @ApiProperty({
    description: 'Portal to test',
    enum: ScrapingPortal,
    example: ScrapingPortal.IMMOBILIARE_IT,
  })
  @IsEnum(ScrapingPortal)
  portal: ScrapingPortal;

  @ApiProperty({
    description: 'URL to scrape',
    example: 'https://www.immobiliare.it/vendita-case/milano/',
  })
  @IsUrl()
  url: string;
}

/**
 * Build search URL DTO
 */
export class BuildSearchUrlDto {
  @ApiProperty({
    description: 'Portal',
    enum: ScrapingPortal,
    example: ScrapingPortal.IMMOBILIARE_IT,
  })
  @IsEnum(ScrapingPortal)
  portal: ScrapingPortal;

  @ApiPropertyOptional({
    description: 'Contract type',
    enum: ['sale', 'rent'],
  })
  @IsOptional()
  @IsEnum(['sale', 'rent'])
  contractType?: 'sale' | 'rent';

  @ApiPropertyOptional({
    description: 'Property type',
  })
  @IsOptional()
  @IsString()
  propertyType?: string;

  @ApiPropertyOptional({
    description: 'City',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    description: 'Minimum price',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceMin?: number;

  @ApiPropertyOptional({
    description: 'Maximum price',
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  priceMax?: number;
}

/**
 * Scraping job response DTO
 */
export class ScrapingJobDto {
  @ApiProperty({ description: 'Job ID', example: 'scrape_1234567890_abc123' })
  id: string;

  @ApiProperty({
    description: 'Job status',
    enum: ScrapingStatus,
    example: ScrapingStatus.IN_PROGRESS,
  })
  status: ScrapingStatus;

  @ApiProperty({ description: 'Portal being scraped', enum: ScrapingPortal })
  portal: ScrapingPortal;

  @ApiProperty({ description: 'Search URL', example: 'https://www.immobiliare.it/vendita-case/milano/' })
  searchUrl: string;

  @ApiProperty({ description: 'Job progress (0-100)', example: 45 })
  progress: number;

  @ApiPropertyOptional({ description: 'Current page being scraped', example: 5 })
  currentPage?: number;

  @ApiPropertyOptional({ description: 'Error message if failed' })
  error?: string;

  @ApiPropertyOptional({
    description: 'Job result statistics',
    example: {
      propertiesFound: 125,
      propertiesImported: 98,
      propertiesDuplicated: 22,
      propertiesSkipped: 5,
      pagesScraped: 5,
      errors: [],
      duration: 45000,
    },
  })
  result?: any;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Start timestamp' })
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  completedAt?: Date;
}

/**
 * Scraped property response DTO
 */
export class ScrapedPropertyDto {
  @ApiProperty({ description: 'Portal', enum: ScrapingPortal })
  portal: ScrapingPortal;

  @ApiProperty({ description: 'External property ID', example: '123456789' })
  externalId: string;

  @ApiProperty({ description: 'External URL', example: 'https://www.immobiliare.it/annunci/123456789/' })
  externalUrl: string;

  @ApiProperty({ description: 'Property title', example: 'Appartamento in vendita a Milano' })
  title: string;

  @ApiPropertyOptional({ description: 'Description' })
  description?: string;

  @ApiProperty({ description: 'City', example: 'Milano' })
  city: string;

  @ApiPropertyOptional({ description: 'Zone', example: 'Centro' })
  zone?: string;

  @ApiProperty({ description: 'Contract type', enum: ['sale', 'rent'] })
  contractType: 'sale' | 'rent';

  @ApiProperty({ description: 'Property type', example: 'Appartamento' })
  propertyType: string;

  @ApiPropertyOptional({ description: 'Sale price', example: 350000 })
  priceSale?: number;

  @ApiPropertyOptional({ description: 'Rent price', example: 1500 })
  priceRent?: number;

  @ApiPropertyOptional({ description: 'Internal surface (m²)', example: 95 })
  surfaceInternal?: number;

  @ApiPropertyOptional({ description: 'Number of rooms', example: 3 })
  rooms?: number;

  @ApiPropertyOptional({ description: 'Number of bedrooms', example: 2 })
  bedrooms?: number;

  @ApiPropertyOptional({ description: 'Number of bathrooms', example: 1 })
  bathrooms?: number;

  @ApiProperty({ description: 'Scraped at timestamp' })
  scrapedAt: Date;
}
