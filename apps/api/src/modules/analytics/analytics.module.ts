/**
 * Analytics Module
 *
 * Provides analytics, reports, dashboards, and KPIs.
 *
 * ✅ IMPLEMENTED (Phase 4 - Nice to Have):
 * - domain/entities/analytics-metric.entity.ts - Metric entity with time-series
 * - domain/entities/analytics-report.entity.ts - Report entity with insights
 * - application/services/analytics.service.ts - Metrics calculation & reporting
 * - presentation/controllers/analytics.controller.ts - REST API endpoints
 * - presentation/dto/analytics.dto.ts - Request/response DTOs
 *
 * Features:
 * - Overview dashboard (all key metrics)
 * - Property performance analytics
 * - Client activity tracking
 * - Agent performance metrics
 * - Matching effectiveness analysis
 * - Revenue reports
 * - Time series data (hourly/daily/weekly/monthly)
 * - Automated insights generation
 * - Trend detection (up/down/stable)
 * - KPI tracking
 * - Custom report generation
 * - Multiple export formats (JSON, PDF, Excel, CSV)
 *
 * Metrics Types:
 * - Properties: active, sold, rented, added, avg price, time on market
 * - Clients: total, active, new, converted, conversion rate
 * - Matching: generated, accepted, acceptance rate, avg score
 * - Activity: viewings scheduled/completed/cancelled, messages sent
 * - Performance: response time, agent productivity, satisfaction
 * - Revenue: total, commissions, per agent
 *
 * API Endpoints:
 * - GET /analytics/dashboard - Overview dashboard
 * - GET /analytics/kpis - Key performance indicators
 * - GET /analytics/metrics/:type - Single metric
 * - GET /analytics/metrics/:type/timeseries - Time series data
 * - POST /analytics/reports - Generate custom report
 * - GET /analytics/reports/property-performance - Property report
 * - GET /analytics/reports/agent-performance - Agent report
 *
 * TODO (Future enhancements):
 * - Real-time metrics updates via WebSocket
 * - Predictive analytics (forecasting)
 * - Anomaly detection
 * - Automated alerts for thresholds
 * - Comparison with market benchmarks
 * - Export to BI tools (Power BI, Tableau)
 * - Custom dashboards per user
 * - Scheduled report emails
 *
 * Best Practices:
 * - Cache frequently accessed metrics (Redis)
 * - Pre-calculate aggregations (materialized views)
 * - Use background jobs for heavy calculations
 * - Implement pagination for large datasets
 */

import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../shared/database/database.module';
import { AnalyticsController } from './presentation/controllers/analytics.controller';
import { AnalyticsService } from './application/services/analytics.service';

@Module({
  imports: [DatabaseModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
