/**
 * Analytics Report Entity (Domain Layer)
 *
 * Represents a comprehensive analytics report or dashboard.
 */

import { AnalyticsMetric, MetricType } from './analytics-metric.entity';

export enum ReportType {
  OVERVIEW_DASHBOARD = 'overview_dashboard',
  PROPERTY_PERFORMANCE = 'property_performance',
  CLIENT_ACTIVITY = 'client_activity',
  AGENT_PERFORMANCE = 'agent_performance',
  MATCHING_EFFECTIVENESS = 'matching_effectiveness',
  REVENUE_REPORT = 'revenue_report',
  MONTHLY_SUMMARY = 'monthly_summary',
  QUARTERLY_REVIEW = 'quarterly_review',
  CUSTOM = 'custom',
}

export enum ReportFormat {
  JSON = 'json',
  PDF = 'pdf',
  EXCEL = 'excel',
  CSV = 'csv',
}

export interface ReportSection {
  title: string;
  description?: string;
  metrics: AnalyticsMetric[];
  charts?: ReportChart[];
}

export interface ReportChart {
  type: 'line' | 'bar' | 'pie' | 'area' | 'donut';
  title: string;
  metricType: MetricType;
  data: Array<{ label: string; value: number; color?: string }>;
}

export interface ReportInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  metric?: MetricType;
  recommendation?: string;
}

export class AnalyticsReport {
  id: string;
  type: ReportType;
  title: string;
  description?: string;

  // Time range
  startDate: Date;
  endDate: Date;

  // Sections
  sections: ReportSection[];

  // Insights
  insights: ReportInsight[];

  // Summary metrics
  keyMetrics: {
    totalProperties: number;
    activeClients: number;
    matchesGenerated: number;
    conversionRate: number;
    totalRevenue: number;
  };

  // Filters
  filters?: {
    agentId?: string;
    propertyType?: string;
    location?: string;
  };

  // Export options
  format: ReportFormat;
  includeCharts: boolean;
  includeRawData: boolean;

  // Metadata
  generatedAt: Date;
  generatedBy?: string; // User ID
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';

  constructor(data: Partial<AnalyticsReport>) {
    Object.assign(this, data);
    this.id = data.id || this.generateId();
    this.sections = data.sections || [];
    this.insights = data.insights || [];
    this.format = data.format || ReportFormat.JSON;
    this.includeCharts = data.includeCharts ?? true;
    this.includeRawData = data.includeRawData ?? false;
    this.generatedAt = data.generatedAt || new Date();
    this.isScheduled = data.isScheduled || false;
  }

  /**
   * Add section to report
   */
  addSection(section: ReportSection): void {
    this.sections.push(section);
  }

  /**
   * Add insight to report
   */
  addInsight(insight: ReportInsight): void {
    this.insights.push(insight);
  }

  /**
   * Get all metrics from all sections
   */
  getAllMetrics(): AnalyticsMetric[] {
    return this.sections.flatMap((section) => section.metrics);
  }

  /**
   * Get metric by type
   */
  getMetricByType(type: MetricType): AnalyticsMetric | undefined {
    return this.getAllMetrics().find((m) => m.type === type);
  }

  /**
   * Get positive insights
   */
  getPositiveInsights(): ReportInsight[] {
    return this.insights.filter((i) => i.type === 'positive');
  }

  /**
   * Get negative insights
   */
  getNegativeInsights(): ReportInsight[] {
    return this.insights.filter((i) => i.type === 'negative');
  }

  /**
   * Get warnings
   */
  getWarnings(): ReportInsight[] {
    return this.insights.filter((i) => i.type === 'warning');
  }

  /**
   * Check if report has any warnings
   */
  hasWarnings(): boolean {
    return this.getWarnings().length > 0;
  }

  /**
   * Get report duration in days
   */
  getDurationDays(): number {
    const diffMs = this.endDate.getTime() - this.startDate.getTime();
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if report is for current period
   */
  isCurrentPeriod(): boolean {
    const now = new Date();
    return this.startDate <= now && this.endDate >= now;
  }

  /**
   * Get formatted date range
   */
  getFormattedDateRange(): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    const start = this.startDate.toLocaleDateString('it-IT', options);
    const end = this.endDate.toLocaleDateString('it-IT', options);
    return `${start} - ${end}`;
  }

  /**
   * Generate executive summary
   */
  generateExecutiveSummary(): string {
    const lines: string[] = [];
    lines.push(`Report: ${this.title}`);
    lines.push(`Period: ${this.getFormattedDateRange()}`);
    lines.push('');
    lines.push('Key Metrics:');
    lines.push(
      `- Total Properties: ${this.keyMetrics.totalProperties.toLocaleString('it-IT')}`,
    );
    lines.push(
      `- Active Clients: ${this.keyMetrics.activeClients.toLocaleString('it-IT')}`,
    );
    lines.push(
      `- Matches Generated: ${this.keyMetrics.matchesGenerated.toLocaleString('it-IT')}`,
    );
    lines.push(`- Conversion Rate: ${this.keyMetrics.conversionRate.toFixed(1)}%`);
    lines.push(
      `- Total Revenue: €${this.keyMetrics.totalRevenue.toLocaleString('it-IT')}`,
    );

    if (this.insights.length > 0) {
      lines.push('');
      lines.push('Top Insights:');
      this.insights.slice(0, 5).forEach((insight, i) => {
        lines.push(`${i + 1}. ${insight.title}: ${insight.description}`);
      });
    }

    return lines.join('\n');
  }

  /**
   * Export to JSON
   */
  toJSON(): any {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      sections: this.sections,
      insights: this.insights,
      keyMetrics: this.keyMetrics,
      filters: this.filters,
      generatedAt: this.generatedAt,
      generatedBy: this.generatedBy,
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `report_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Convert to database format
   */
  toDatabaseFormat(): any {
    return {
      type: this.type,
      title: this.title,
      description: this.description,
      startDate: this.startDate,
      endDate: this.endDate,
      sections: JSON.stringify(this.sections),
      insights: JSON.stringify(this.insights),
      keyMetrics: JSON.stringify(this.keyMetrics),
      filters: this.filters ? JSON.stringify(this.filters) : null,
      format: this.format,
      includeCharts: this.includeCharts,
      includeRawData: this.includeRawData,
      generatedAt: this.generatedAt,
      generatedBy: this.generatedBy,
      isScheduled: this.isScheduled,
      scheduleFrequency: this.scheduleFrequency,
    };
  }
}
