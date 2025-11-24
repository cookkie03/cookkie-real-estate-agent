/**
 * Analytics DTOs (Presentation Layer)
 *
 * Data Transfer Objects for Analytics endpoints.
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDate,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  MetricType,
  AggregationType,
  TimeGranularity,
} from '../../domain/entities/analytics-metric.entity';
import {
  ReportType,
  ReportFormat,
} from '../../domain/entities/analytics-report.entity';

/**
 * Metric data point DTO
 */
export class MetricDataPointDto {
  @ApiProperty({
    description: 'Timestamp',
  })
  timestamp: Date;

  @ApiProperty({
    description: 'Value',
  })
  value: number;

  @ApiPropertyOptional({
    description: 'Metadata',
  })
  metadata?: Record<string, any>;
}

/**
 * Metric DTO
 */
export class MetricDto {
  @ApiProperty({
    description: 'Metric ID',
  })
  id: string;

  @ApiProperty({
    description: 'Metric type',
    enum: MetricType,
  })
  type: MetricType;

  @ApiProperty({
    description: 'Aggregation type',
    enum: AggregationType,
  })
  aggregation: AggregationType;

  @ApiProperty({
    description: 'Time granularity',
    enum: TimeGranularity,
  })
  granularity: TimeGranularity;

  @ApiProperty({
    description: 'Current value',
  })
  currentValue: number;

  @ApiPropertyOptional({
    description: 'Previous value',
  })
  previousValue?: number;

  @ApiPropertyOptional({
    description: 'Change percentage',
  })
  changePercentage?: number;

  @ApiPropertyOptional({
    description: 'Unit (count, euro, percentage, days)',
  })
  unit?: string;

  @ApiProperty({
    description: 'Label',
  })
  label: string;

  @ApiPropertyOptional({
    description: 'Description',
  })
  description?: string;

  @ApiProperty({
    description: 'Calculated at',
  })
  calculatedAt: Date;
}

/**
 * Time series DTO
 */
export class TimeSeriesDto {
  @ApiProperty({
    description: 'Metric type',
    enum: MetricType,
  })
  type: MetricType;

  @ApiProperty({
    description: 'Time granularity',
    enum: TimeGranularity,
  })
  granularity: TimeGranularity;

  @ApiProperty({
    description: 'Data points',
    type: [MetricDataPointDto],
  })
  dataPoints: MetricDataPointDto[];
}

/**
 * Report insight DTO
 */
export class ReportInsightDto {
  @ApiProperty({
    description: 'Insight type',
    enum: ['positive', 'negative', 'neutral', 'warning'],
  })
  type: 'positive' | 'negative' | 'neutral' | 'warning';

  @ApiProperty({
    description: 'Title',
  })
  title: string;

  @ApiProperty({
    description: 'Description',
  })
  description: string;

  @ApiPropertyOptional({
    description: 'Related metric',
    enum: MetricType,
  })
  metric?: MetricType;

  @ApiPropertyOptional({
    description: 'Recommendation',
  })
  recommendation?: string;
}

/**
 * Report chart DTO
 */
export class ReportChartDto {
  @ApiProperty({
    description: 'Chart type',
    enum: ['line', 'bar', 'pie', 'area', 'donut'],
  })
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';

  @ApiProperty({
    description: 'Title',
  })
  title: string;

  @ApiProperty({
    description: 'Metric type',
    enum: MetricType,
  })
  metricType: MetricType;

  @ApiProperty({
    description: 'Chart data',
  })
  data: Array<{ label: string; value: number; color?: string }>;
}

/**
 * Report section DTO
 */
export class ReportSectionDto {
  @ApiProperty({
    description: 'Section title',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Section description',
  })
  description?: string;

  @ApiProperty({
    description: 'Metrics',
    type: [MetricDto],
  })
  metrics: MetricDto[];

  @ApiPropertyOptional({
    description: 'Charts',
    type: [ReportChartDto],
  })
  charts?: ReportChartDto[];
}

/**
 * Key metrics DTO
 */
export class KeyMetricsDto {
  @ApiProperty({
    description: 'Total properties',
  })
  totalProperties: number;

  @ApiProperty({
    description: 'Active clients',
  })
  activeClients: number;

  @ApiProperty({
    description: 'Matches generated',
  })
  matchesGenerated: number;

  @ApiProperty({
    description: 'Conversion rate',
  })
  conversionRate: number;

  @ApiProperty({
    description: 'Total revenue',
  })
  totalRevenue: number;
}

/**
 * Analytics report DTO
 */
export class AnalyticsReportDto {
  @ApiProperty({
    description: 'Report ID',
  })
  id: string;

  @ApiProperty({
    description: 'Report type',
    enum: ReportType,
  })
  type: ReportType;

  @ApiProperty({
    description: 'Title',
  })
  title: string;

  @ApiPropertyOptional({
    description: 'Description',
  })
  description?: string;

  @ApiProperty({
    description: 'Start date',
  })
  startDate: Date;

  @ApiProperty({
    description: 'End date',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Report sections',
    type: [ReportSectionDto],
  })
  sections: ReportSectionDto[];

  @ApiProperty({
    description: 'Insights',
    type: [ReportInsightDto],
  })
  insights: ReportInsightDto[];

  @ApiProperty({
    description: 'Key metrics',
    type: KeyMetricsDto,
  })
  keyMetrics: KeyMetricsDto;

  @ApiPropertyOptional({
    description: 'Filters',
  })
  filters?: {
    agentId?: string;
    propertyType?: string;
    location?: string;
  };

  @ApiProperty({
    description: 'Generated at',
  })
  generatedAt: Date;
}

/**
 * Generate report DTO
 */
export class GenerateReportDto {
  @ApiProperty({
    description: 'Report type',
    enum: ReportType,
  })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiProperty({
    description: 'Start date (ISO 8601)',
    example: '2025-10-01T00:00:00Z',
  })
  @IsString()
  startDate: string;

  @ApiProperty({
    description: 'End date (ISO 8601)',
    example: '2025-11-01T00:00:00Z',
  })
  @IsString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Filters',
  })
  @IsOptional()
  filters?: {
    agentId?: string;
    propertyType?: string;
    location?: string;
  };

  @ApiPropertyOptional({
    description: 'Export format',
    enum: ReportFormat,
    default: ReportFormat.JSON,
  })
  @IsOptional()
  @IsEnum(ReportFormat)
  format?: ReportFormat;

  @ApiPropertyOptional({
    description: 'Include charts',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  includeCharts?: boolean;

  @ApiPropertyOptional({
    description: 'Include raw data',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  includeRawData?: boolean;
}

/**
 * KPIs DTO
 */
export class KPIsDto {
  @ApiProperty({
    description: 'Property KPIs',
  })
  properties: {
    active: number;
    sold: number;
    averageTimeOnMarket: number;
  };

  @ApiProperty({
    description: 'Client KPIs',
  })
  clients: {
    active: number;
    new: number;
    conversionRate: number;
  };

  @ApiProperty({
    description: 'Matching KPIs',
  })
  matches: {
    generated: number;
    acceptanceRate: number;
  };

  @ApiProperty({
    description: 'Revenue KPIs',
  })
  revenue: {
    total: number;
    commissions: number;
  };
}
