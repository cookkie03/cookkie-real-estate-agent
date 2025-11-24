/**
 * Analytics Service (Application Layer)
 *
 * Calculates metrics, generates reports, and provides dashboard data.
 */

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../shared/database/prisma.service';
import {
  AnalyticsMetric,
  MetricType,
  AggregationType,
  TimeGranularity,
  MetricDataPoint,
} from '../../domain/entities/analytics-metric.entity';
import {
  AnalyticsReport,
  ReportType,
  ReportSection,
  ReportInsight,
} from '../../domain/entities/analytics-report.entity';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Get overview dashboard
   */
  async getOverviewDashboard(params: {
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }): Promise<AnalyticsReport> {
    this.logger.log('Generating overview dashboard');

    const report = new AnalyticsReport({
      type: ReportType.OVERVIEW_DASHBOARD,
      title: 'CRM Immobiliare - Overview Dashboard',
      description: 'Comprehensive overview of CRM performance',
      startDate: params.startDate,
      endDate: params.endDate,
      filters: params.agentId ? { agentId: params.agentId } : undefined,
    });

    // Calculate key metrics
    const [
      totalProperties,
      activeClients,
      matchesGenerated,
      conversionRate,
      totalRevenue,
    ] = await Promise.all([
      this.calculatePropertiesActive(params),
      this.calculateClientsActive(params),
      this.calculateMatchesGenerated(params),
      this.calculateConversionRate(params),
      this.calculateTotalRevenue(params),
    ]);

    report.keyMetrics = {
      totalProperties: totalProperties.currentValue,
      activeClients: activeClients.currentValue,
      matchesGenerated: matchesGenerated.currentValue,
      conversionRate: conversionRate.currentValue,
      totalRevenue: totalRevenue.currentValue,
    };

    // Add sections
    report.addSection({
      title: 'Property Metrics',
      metrics: [totalProperties],
    });

    report.addSection({
      title: 'Client Metrics',
      metrics: [activeClients, conversionRate],
    });

    report.addSection({
      title: 'Matching Performance',
      metrics: [matchesGenerated],
    });

    report.addSection({
      title: 'Revenue',
      metrics: [totalRevenue],
    });

    // Generate insights
    const insights = await this.generateInsights(report);
    insights.forEach((insight) => report.addInsight(insight));

    this.logger.log('✅ Dashboard generated successfully');
    return report;
  }

  /**
   * Calculate properties active metric
   */
  async calculatePropertiesActive(params: {
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }): Promise<AnalyticsMetric> {
    // TODO: Query database for actual data
    // For now, return mock data
    const currentValue = 245;
    const previousValue = 230;

    const metric = new AnalyticsMetric({
      type: MetricType.PROPERTIES_ACTIVE,
      aggregation: AggregationType.COUNT,
      granularity: TimeGranularity.DAY,
      startDate: params.startDate,
      endDate: params.endDate,
      currentValue,
      previousValue,
      unit: 'count',
      label: 'Immobili Attivi',
      description: 'Numero di immobili attualmente sul mercato',
    });

    metric.calculateChangePercentage();

    return metric;
  }

  /**
   * Calculate clients active metric
   */
  async calculateClientsActive(params: {
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }): Promise<AnalyticsMetric> {
    // TODO: Query database
    const currentValue = 189;
    const previousValue = 172;

    const metric = new AnalyticsMetric({
      type: MetricType.CLIENTS_ACTIVE,
      aggregation: AggregationType.COUNT,
      granularity: TimeGranularity.DAY,
      startDate: params.startDate,
      endDate: params.endDate,
      currentValue,
      previousValue,
      unit: 'count',
      label: 'Clienti Attivi',
      description: 'Numero di clienti attualmente in cerca di immobile',
    });

    metric.calculateChangePercentage();

    return metric;
  }

  /**
   * Calculate matches generated metric
   */
  async calculateMatchesGenerated(params: {
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }): Promise<AnalyticsMetric> {
    // TODO: Query database
    const currentValue = 1234;
    const previousValue = 1105;

    const metric = new AnalyticsMetric({
      type: MetricType.MATCHES_GENERATED,
      aggregation: AggregationType.SUM,
      granularity: TimeGranularity.DAY,
      startDate: params.startDate,
      endDate: params.endDate,
      currentValue,
      previousValue,
      unit: 'count',
      label: 'Match Generati',
      description: 'Numero totale di match proprietà-cliente generati',
    });

    metric.calculateChangePercentage();

    return metric;
  }

  /**
   * Calculate conversion rate metric
   */
  async calculateConversionRate(params: {
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }): Promise<AnalyticsMetric> {
    // TODO: Query database
    const currentValue = 18.5;
    const previousValue = 16.2;

    const metric = new AnalyticsMetric({
      type: MetricType.CONVERSION_RATE,
      aggregation: AggregationType.AVERAGE,
      granularity: TimeGranularity.DAY,
      startDate: params.startDate,
      endDate: params.endDate,
      currentValue,
      previousValue,
      unit: 'percentage',
      label: 'Tasso di Conversione',
      description: 'Percentuale di clienti che hanno concluso un contratto',
    });

    metric.calculateChangePercentage();

    return metric;
  }

  /**
   * Calculate total revenue metric
   */
  async calculateTotalRevenue(params: {
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }): Promise<AnalyticsMetric> {
    // TODO: Query database
    const currentValue = 125000;
    const previousValue = 98000;

    const metric = new AnalyticsMetric({
      type: MetricType.REVENUE_TOTAL,
      aggregation: AggregationType.SUM,
      granularity: TimeGranularity.MONTH,
      startDate: params.startDate,
      endDate: params.endDate,
      currentValue,
      previousValue,
      unit: 'euro',
      label: 'Fatturato Totale',
      description: 'Fatturato totale generato nel periodo',
    });

    metric.calculateChangePercentage();

    return metric;
  }

  /**
   * Get metric by type
   */
  async getMetric(params: {
    type: MetricType;
    startDate: Date;
    endDate: Date;
    granularity: TimeGranularity;
    agentId?: string;
  }): Promise<AnalyticsMetric> {
    this.logger.log(`Calculating metric: ${params.type}`);

    switch (params.type) {
      case MetricType.PROPERTIES_ACTIVE:
        return this.calculatePropertiesActive(params);
      case MetricType.CLIENTS_ACTIVE:
        return this.calculateClientsActive(params);
      case MetricType.MATCHES_GENERATED:
        return this.calculateMatchesGenerated(params);
      case MetricType.CONVERSION_RATE:
        return this.calculateConversionRate(params);
      case MetricType.REVENUE_TOTAL:
        return this.calculateTotalRevenue(params);
      default:
        throw new Error(`Metric type not implemented: ${params.type}`);
    }
  }

  /**
   * Get time series data for metric
   */
  async getMetricTimeSeries(params: {
    type: MetricType;
    startDate: Date;
    endDate: Date;
    granularity: TimeGranularity;
    agentId?: string;
  }): Promise<MetricDataPoint[]> {
    this.logger.log(`Fetching time series for: ${params.type}`);

    // TODO: Query database and aggregate by granularity
    // For now, return mock data
    const dataPoints: MetricDataPoint[] = [];
    const daysDiff = Math.floor(
      (params.endDate.getTime() - params.startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    for (let i = 0; i <= daysDiff; i++) {
      const date = new Date(params.startDate);
      date.setDate(date.getDate() + i);
      dataPoints.push({
        timestamp: date,
        value: Math.floor(Math.random() * 100) + 100,
      });
    }

    return dataPoints;
  }

  /**
   * Generate property performance report
   */
  async generatePropertyPerformanceReport(params: {
    startDate: Date;
    endDate: Date;
    propertyType?: string;
    location?: string;
  }): Promise<AnalyticsReport> {
    this.logger.log('Generating property performance report');

    const report = new AnalyticsReport({
      type: ReportType.PROPERTY_PERFORMANCE,
      title: 'Property Performance Report',
      startDate: params.startDate,
      endDate: params.endDate,
      filters: {
        propertyType: params.propertyType,
        location: params.location,
      },
    });

    // TODO: Calculate actual metrics
    report.keyMetrics = {
      totalProperties: 245,
      activeClients: 189,
      matchesGenerated: 1234,
      conversionRate: 18.5,
      totalRevenue: 125000,
    };

    return report;
  }

  /**
   * Generate agent performance report
   */
  async generateAgentPerformanceReport(params: {
    agentId: string;
    startDate: Date;
    endDate: Date;
  }): Promise<AnalyticsReport> {
    this.logger.log(`Generating agent performance report for ${params.agentId}`);

    const report = new AnalyticsReport({
      type: ReportType.AGENT_PERFORMANCE,
      title: `Agent Performance Report`,
      startDate: params.startDate,
      endDate: params.endDate,
      filters: { agentId: params.agentId },
    });

    // TODO: Calculate agent-specific metrics
    report.keyMetrics = {
      totalProperties: 45,
      activeClients: 32,
      matchesGenerated: 234,
      conversionRate: 22.5,
      totalRevenue: 35000,
    };

    return report;
  }

  /**
   * Generate insights from report data
   */
  private async generateInsights(
    report: AnalyticsReport,
  ): Promise<ReportInsight[]> {
    const insights: ReportInsight[] = [];

    const metrics = report.getAllMetrics();

    // Check for positive trends
    metrics.forEach((metric) => {
      if (metric.isTrendingUp() && (metric.changePercentage || 0) > 10) {
        insights.push({
          type: 'positive',
          title: `${metric.label} in crescita`,
          description: `${metric.label} è aumentato del ${metric.changePercentage?.toFixed(1)}% rispetto al periodo precedente.`,
          metric: metric.type,
        });
      }
    });

    // Check for negative trends
    metrics.forEach((metric) => {
      if (metric.isTrendingDown() && (metric.changePercentage || 0) < -10) {
        insights.push({
          type: 'negative',
          title: `${metric.label} in calo`,
          description: `${metric.label} è diminuito del ${Math.abs(metric.changePercentage || 0).toFixed(1)}% rispetto al periodo precedente.`,
          metric: metric.type,
          recommendation:
            'Analizza le cause del calo e implementa strategie correttive.',
        });
      }
    });

    // Check for warnings
    const conversionMetric = metrics.find(
      (m) => m.type === MetricType.CONVERSION_RATE,
    );
    if (conversionMetric && conversionMetric.currentValue < 15) {
      insights.push({
        type: 'warning',
        title: 'Tasso di conversione basso',
        description: `Il tasso di conversione è al ${conversionMetric.currentValue.toFixed(1)}%, sotto la soglia ottimale del 20%.`,
        metric: MetricType.CONVERSION_RATE,
        recommendation:
          'Migliora la qualità dei match e aumenta il follow-up con i clienti.',
      });
    }

    return insights;
  }

  /**
   * Get KPIs (Key Performance Indicators)
   */
  async getKPIs(params: {
    startDate: Date;
    endDate: Date;
    agentId?: string;
  }): Promise<{
    properties: { active: number; sold: number; averageTimeOnMarket: number };
    clients: { active: number; new: number; conversionRate: number };
    matches: { generated: number; acceptanceRate: number };
    revenue: { total: number; commissions: number };
  }> {
    // TODO: Query database
    return {
      properties: {
        active: 245,
        sold: 12,
        averageTimeOnMarket: 45,
      },
      clients: {
        active: 189,
        new: 23,
        conversionRate: 18.5,
      },
      matches: {
        generated: 1234,
        acceptanceRate: 67.5,
      },
      revenue: {
        total: 125000,
        commissions: 18750,
      },
    };
  }
}
