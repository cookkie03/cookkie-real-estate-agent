/**
 * Analytics Metric Entity (Domain Layer)
 *
 * Represents a single analytics metric with time-series data.
 */

export enum MetricType {
  // Property metrics
  PROPERTIES_ACTIVE = 'properties_active',
  PROPERTIES_SOLD = 'properties_sold',
  PROPERTIES_RENTED = 'properties_rented',
  PROPERTIES_ADDED = 'properties_added',
  AVERAGE_PROPERTY_PRICE = 'average_property_price',
  AVERAGE_TIME_ON_MARKET = 'average_time_on_market',

  // Client metrics
  CLIENTS_TOTAL = 'clients_total',
  CLIENTS_ACTIVE = 'clients_active',
  CLIENTS_NEW = 'clients_new',
  CLIENTS_CONVERTED = 'clients_converted',
  CONVERSION_RATE = 'conversion_rate',

  // Matching metrics
  MATCHES_GENERATED = 'matches_generated',
  MATCHES_ACCEPTED = 'matches_accepted',
  MATCH_ACCEPTANCE_RATE = 'match_acceptance_rate',
  AVERAGE_MATCH_SCORE = 'average_match_score',

  // Activity metrics
  VIEWINGS_SCHEDULED = 'viewings_scheduled',
  VIEWINGS_COMPLETED = 'viewings_completed',
  VIEWINGS_CANCELLED = 'viewings_cancelled',
  EMAILS_SENT = 'emails_sent',
  WHATSAPP_MESSAGES = 'whatsapp_messages',

  // Performance metrics
  RESPONSE_TIME_AVG = 'response_time_avg',
  AGENT_PRODUCTIVITY = 'agent_productivity',
  CUSTOMER_SATISFACTION = 'customer_satisfaction',

  // Revenue metrics
  REVENUE_TOTAL = 'revenue_total',
  REVENUE_COMMISSIONS = 'revenue_commissions',
  REVENUE_PER_AGENT = 'revenue_per_agent',
}

export enum AggregationType {
  SUM = 'sum',
  AVERAGE = 'average',
  COUNT = 'count',
  MIN = 'min',
  MAX = 'max',
  LAST = 'last',
}

export enum TimeGranularity {
  HOUR = 'hour',
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  QUARTER = 'quarter',
  YEAR = 'year',
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export class AnalyticsMetric {
  id: string;
  type: MetricType;
  aggregation: AggregationType;
  granularity: TimeGranularity;

  // Time range
  startDate: Date;
  endDate: Date;

  // Data
  dataPoints: MetricDataPoint[];
  currentValue: number;
  previousValue?: number;
  changePercentage?: number;

  // Filters
  filters?: {
    agentId?: string;
    propertyType?: string;
    location?: string;
    priceRange?: { min: number; max: number };
  };

  // Metadata
  unit?: string; // 'count', 'euro', 'percentage', 'days'
  label: string;
  description?: string;

  // Timestamps
  calculatedAt: Date;

  constructor(data: Partial<AnalyticsMetric>) {
    Object.assign(this, data);
    this.id = data.id || this.generateId();
    this.dataPoints = data.dataPoints || [];
    this.calculatedAt = data.calculatedAt || new Date();
  }

  /**
   * Get total value (sum of all data points)
   */
  getTotalValue(): number {
    return this.dataPoints.reduce((sum, dp) => sum + dp.value, 0);
  }

  /**
   * Get average value
   */
  getAverageValue(): number {
    if (this.dataPoints.length === 0) return 0;
    return this.getTotalValue() / this.dataPoints.length;
  }

  /**
   * Get min value
   */
  getMinValue(): number {
    if (this.dataPoints.length === 0) return 0;
    return Math.min(...this.dataPoints.map((dp) => dp.value));
  }

  /**
   * Get max value
   */
  getMaxValue(): number {
    if (this.dataPoints.length === 0) return 0;
    return Math.max(...this.dataPoints.map((dp) => dp.value));
  }

  /**
   * Calculate change percentage vs previous period
   */
  calculateChangePercentage(): number {
    if (!this.previousValue || this.previousValue === 0) {
      return 0;
    }

    const change = ((this.currentValue - this.previousValue) / this.previousValue) * 100;
    this.changePercentage = Math.round(change * 100) / 100;
    return this.changePercentage;
  }

  /**
   * Check if metric is trending up
   */
  isTrendingUp(): boolean {
    return (this.changePercentage || 0) > 0;
  }

  /**
   * Check if metric is trending down
   */
  isTrendingDown(): boolean {
    return (this.changePercentage || 0) < 0;
  }

  /**
   * Get trend emoji
   */
  getTrendEmoji(): string {
    if (this.isTrendingUp()) return '📈';
    if (this.isTrendingDown()) return '📉';
    return '➡️';
  }

  /**
   * Format value for display
   */
  getFormattedValue(): string {
    switch (this.unit) {
      case 'euro':
        return `€${this.currentValue.toLocaleString('it-IT')}`;
      case 'percentage':
        return `${this.currentValue.toFixed(1)}%`;
      case 'days':
        return `${this.currentValue} giorni`;
      case 'count':
      default:
        return this.currentValue.toLocaleString('it-IT');
    }
  }

  /**
   * Get data points for time range
   */
  getDataPointsForRange(startDate: Date, endDate: Date): MetricDataPoint[] {
    return this.dataPoints.filter(
      (dp) => dp.timestamp >= startDate && dp.timestamp <= endDate,
    );
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Convert to database format
   */
  toDatabaseFormat(): any {
    return {
      type: this.type,
      aggregation: this.aggregation,
      granularity: this.granularity,
      startDate: this.startDate,
      endDate: this.endDate,
      dataPoints: JSON.stringify(this.dataPoints),
      currentValue: this.currentValue,
      previousValue: this.previousValue,
      changePercentage: this.changePercentage,
      filters: this.filters ? JSON.stringify(this.filters) : null,
      unit: this.unit,
      label: this.label,
      description: this.description,
      calculatedAt: this.calculatedAt,
    };
  }
}
