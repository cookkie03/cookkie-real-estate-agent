/**
 * CRM IMMOBILIARE - Analytics Tracking Utility
 *
 * Centralized analytics tracking for map interactions and events.
 * Supports Google Analytics and custom event tracking.
 *
 * @module lib/analytics
 * @since v3.2.0
 */

type EventCategory = 'Map' | 'Filter' | 'Building' | 'Property' | 'Navigation';

interface AnalyticsEvent {
  category: EventCategory;
  action: string;
  label?: string;
  value?: number;
}

/**
 * Track custom event
 */
export function trackEvent({ category, action, label, value }: AnalyticsEvent) {
  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', { category, action, label, value });
  }

  // Google Analytics (if available)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }

  // Custom analytics service (placeholder for future integration)
  // Example: PostHog, Mixpanel, Amplitude, etc.
}

/**
 * Track map view
 */
export function trackMapView(buildingsCount: number) {
  trackEvent({
    category: 'Map',
    action: 'view',
    label: 'Map Loaded',
    value: buildingsCount,
  });
}

/**
 * Track building click
 */
export function trackBuildingClick(buildingId: string, buildingCode: string) {
  trackEvent({
    category: 'Building',
    action: 'click',
    label: buildingCode,
  });
}

/**
 * Track filter usage
 */
export function trackFilterApplied(filterType: string, filterValue: string | number) {
  trackEvent({
    category: 'Filter',
    action: 'apply',
    label: `${filterType}: ${filterValue}`,
  });
}

/**
 * Track layer switch
 */
export function trackLayerSwitch(layerType: 'satellite' | 'streets') {
  trackEvent({
    category: 'Map',
    action: 'layer_switch',
    label: layerType,
  });
}

/**
 * Track urgency recalculation
 */
export function trackUrgencyRecalc(scope: 'property' | 'building' | 'global', count: number) {
  trackEvent({
    category: 'Map',
    action: 'urgency_recalc',
    label: scope,
    value: count,
  });
}

/**
 * Track zone navigation
 */
export function trackZoneNavigation(level: 'multi' | 'comune' | 'zone', zoneName: string) {
  trackEvent({
    category: 'Navigation',
    action: 'zone_drill_down',
    label: `${level}: ${zoneName}`,
  });
}

/**
 * Track error
 */
export function trackError(errorMessage: string, errorType: string) {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: errorMessage,
      fatal: false,
      error_type: errorType,
    });
  }
}
