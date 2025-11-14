/**
 * Analytics Controller (Presentation Layer)
 *
 * REST API endpoints for analytics dashboards, reports, and KPIs.
 */

import {
  Controller,
  Get,
  Post,
  Query,
  Body,
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
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../../core/guards/jwt-auth.guard';
import { AnalyticsService } from '../../application/services/analytics.service';
import {
  AnalyticsReportDto,
  MetricDto,
  TimeSeriesDto,
  KPIsDto,
  GenerateReportDto,
} from '../dto/analytics.dto';
import {
  MetricType,
  TimeGranularity,
} from '../../domain/entities/analytics-metric.entity';
import { ReportType } from '../../domain/entities/analytics-report.entity';

@ApiTags('analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AnalyticsController {
  private readonly logger = new Logger(AnalyticsController.name);

  constructor(private analyticsService: AnalyticsService) {}

  /**
   * GET /analytics/dashboard
   * Get overview dashboard
   */
  @Get('dashboard')
  @ApiOperation({
    summary: 'Get dashboard',
    description: 'Get overview dashboard with key metrics.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'End date (ISO 8601)',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: String,
    description: 'Filter by agent ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard data',
    type: AnalyticsReportDto,
  })
  async getDashboard(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agentId') agentId?: string,
  ): Promise<AnalyticsReportDto> {
    this.logger.log('Fetching overview dashboard');

    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    const report = await this.analyticsService.getOverviewDashboard({
      startDate: start,
      endDate: end,
      agentId,
    });

    return this.mapReportToDto(report);
  }

  /**
   * GET /analytics/kpis
   * Get key performance indicators
   */
  @Get('kpis')
  @ApiOperation({
    summary: 'Get KPIs',
    description: 'Get key performance indicators.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'KPIs',
    type: KPIsDto,
  })
  async getKPIs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('agentId') agentId?: string,
  ): Promise<KPIsDto> {
    this.logger.log('Fetching KPIs');

    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    return await this.analyticsService.getKPIs({
      startDate: start,
      endDate: end,
      agentId,
    });
  }

  /**
   * GET /analytics/metrics/:type
   * Get single metric
   */
  @Get('metrics/:type')
  @ApiOperation({
    summary: 'Get metric',
    description: 'Get a single metric by type.',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'granularity',
    required: false,
    enum: TimeGranularity,
    description: 'Time granularity',
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Metric data',
    type: MetricDto,
  })
  async getMetric(
    @Query('type') type: MetricType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity?: TimeGranularity,
    @Query('agentId') agentId?: string,
  ): Promise<MetricDto> {
    this.logger.log(`Fetching metric: ${type}`);

    const metric = await this.analyticsService.getMetric({
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      granularity: granularity || TimeGranularity.DAY,
      agentId,
    });

    return this.mapMetricToDto(metric);
  }

  /**
   * GET /analytics/metrics/:type/timeseries
   * Get metric time series data
   */
  @Get('metrics/:type/timeseries')
  @ApiOperation({
    summary: 'Get metric time series',
    description: 'Get time series data for a metric.',
  })
  @ApiQuery({
    name: 'startDate',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'endDate',
    required: true,
    type: String,
  })
  @ApiQuery({
    name: 'granularity',
    required: false,
    enum: TimeGranularity,
  })
  @ApiQuery({
    name: 'agentId',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Time series data',
    type: TimeSeriesDto,
  })
  async getMetricTimeSeries(
    @Query('type') type: MetricType,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity?: TimeGranularity,
    @Query('agentId') agentId?: string,
  ): Promise<TimeSeriesDto> {
    this.logger.log(`Fetching time series for: ${type}`);

    const dataPoints = await this.analyticsService.getMetricTimeSeries({
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      granularity: granularity || TimeGranularity.DAY,
      agentId,
    });

    return {
      type,
      granularity: granularity || TimeGranularity.DAY,
      dataPoints: dataPoints.map((dp) => ({
        timestamp: dp.timestamp,
        value: dp.value,
        metadata: dp.metadata,
      })),
    };
  }

  /**
   * POST /analytics/reports
   * Generate custom report
   */
  @Post('reports')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate report',
    description: 'Generate a custom analytics report.',
  })
  @ApiResponse({
    status: 200,
    description: 'Report generated',
    type: AnalyticsReportDto,
  })
  async generateReport(
    @Body() dto: GenerateReportDto,
  ): Promise<AnalyticsReportDto> {
    this.logger.log(`Generating report: ${dto.type}`);

    let report;

    switch (dto.type) {
      case ReportType.OVERVIEW_DASHBOARD:
        report = await this.analyticsService.getOverviewDashboard({
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          agentId: dto.filters?.agentId,
        });
        break;

      case ReportType.PROPERTY_PERFORMANCE:
        report = await this.analyticsService.generatePropertyPerformanceReport({
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
          propertyType: dto.filters?.propertyType,
          location: dto.filters?.location,
        });
        break;

      case ReportType.AGENT_PERFORMANCE:
        if (!dto.filters?.agentId) {
          throw new Error('agentId required for agent performance report');
        }
        report = await this.analyticsService.generateAgentPerformanceReport({
          agentId: dto.filters.agentId,
          startDate: new Date(dto.startDate),
          endDate: new Date(dto.endDate),
        });
        break;

      default:
        throw new Error(`Report type not implemented: ${dto.type}`);
    }

    return this.mapReportToDto(report);
  }

  /**
   * GET /analytics/reports/property-performance
   * Get property performance report
   */
  @Get('reports/property-performance')
  @ApiOperation({
    summary: 'Property performance report',
    description: 'Get property performance analytics.',
  })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiQuery({ name: 'propertyType', required: false, type: String })
  @ApiQuery({ name: 'location', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Report data',
    type: AnalyticsReportDto,
  })
  async getPropertyPerformanceReport(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('propertyType') propertyType?: string,
    @Query('location') location?: string,
  ): Promise<AnalyticsReportDto> {
    this.logger.log('Generating property performance report');

    const report =
      await this.analyticsService.generatePropertyPerformanceReport({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        propertyType,
        location,
      });

    return this.mapReportToDto(report);
  }

  /**
   * GET /analytics/reports/agent-performance
   * Get agent performance report
   */
  @Get('reports/agent-performance')
  @ApiOperation({
    summary: 'Agent performance report',
    description: 'Get agent performance analytics.',
  })
  @ApiQuery({ name: 'agentId', required: true, type: String })
  @ApiQuery({ name: 'startDate', required: true, type: String })
  @ApiQuery({ name: 'endDate', required: true, type: String })
  @ApiResponse({
    status: 200,
    description: 'Report data',
    type: AnalyticsReportDto,
  })
  async getAgentPerformanceReport(
    @Query('agentId') agentId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ): Promise<AnalyticsReportDto> {
    this.logger.log(`Generating agent performance report for ${agentId}`);

    const report = await this.analyticsService.generateAgentPerformanceReport({
      agentId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    });

    return this.mapReportToDto(report);
  }

  /**
   * Map report entity to DTO
   */
  private mapReportToDto(report: any): AnalyticsReportDto {
    return {
      id: report.id,
      type: report.type,
      title: report.title,
      description: report.description,
      startDate: report.startDate,
      endDate: report.endDate,
      sections: report.sections,
      insights: report.insights,
      keyMetrics: report.keyMetrics,
      filters: report.filters,
      generatedAt: report.generatedAt,
    };
  }

  /**
   * Map metric entity to DTO
   */
  private mapMetricToDto(metric: any): MetricDto {
    return {
      id: metric.id,
      type: metric.type,
      aggregation: metric.aggregation,
      granularity: metric.granularity,
      currentValue: metric.currentValue,
      previousValue: metric.previousValue,
      changePercentage: metric.changePercentage,
      unit: metric.unit,
      label: metric.label,
      description: metric.description,
      calculatedAt: metric.calculatedAt,
    };
  }
}
