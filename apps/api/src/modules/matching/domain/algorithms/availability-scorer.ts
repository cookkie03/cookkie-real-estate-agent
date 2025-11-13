/**
 * Availability Scorer (Peso: 10%)
 *
 * Scores property-client match based on timing and availability alignment.
 * Considers property availability date and client's desired move-in date.
 */

interface PropertyAvailability {
  status: 'draft' | 'available' | 'option' | 'sold' | 'rented' | 'suspended' | 'archived';
  availableFrom?: Date | null;
  estimatedDelivery?: Date | null; // For properties under construction
  isImmediate?: boolean;
}

interface ClientTiming {
  desiredMoveInDate?: Date | null;
  flexibilityDays?: number; // How many days of flexibility (±)
  urgency?: 'low' | 'medium' | 'high'; // How urgent is the need
  canWait?: boolean; // Can wait for property under construction
}

export class AvailabilityScorer {
  private static readonly MS_PER_DAY = 24 * 60 * 60 * 1000;

  /**
   * Calculate availability match score (0-100)
   */
  static calculate(
    property: PropertyAvailability,
    timing: ClientTiming,
  ): number {
    // 1. Check property status (40 points)
    const statusScore = this.calculateStatusScore(property);
    if (statusScore === 0) {
      return 0; // Property not available at all
    }

    // 2. Check timing alignment (60 points)
    const timingScore = this.calculateTimingScore(property, timing);

    return Math.round(statusScore * 0.4 + timingScore * 0.6);
  }

  /**
   * Calculate score based on property status (0-100)
   */
  private static calculateStatusScore(property: PropertyAvailability): number {
    switch (property.status) {
      case 'available':
        return 100; // Perfect - immediately available

      case 'option':
        return 30; // Under option - might become available

      case 'draft':
        return 60; // Being prepared - likely available soon

      case 'suspended':
        return 20; // Temporarily unavailable

      case 'sold':
      case 'rented':
      case 'archived':
        return 0; // Not available

      default:
        return 50; // Unknown status
    }
  }

  /**
   * Calculate score based on timing alignment (0-100)
   */
  private static calculateTimingScore(
    property: PropertyAvailability,
    timing: ClientTiming,
  ): number {
    // If property is immediately available
    if (property.isImmediate) {
      return this.scoreImmediateAvailability(timing);
    }

    // If no specific dates provided
    if (!timing.desiredMoveInDate) {
      return 50; // Neutral score
    }

    // Calculate based on date alignment
    const propertyDate = property.availableFrom || property.estimatedDelivery;
    if (!propertyDate) {
      // No specific availability date - assume immediate
      return this.scoreImmediateAvailability(timing);
    }

    return this.scoreDateAlignment(
      new Date(propertyDate),
      new Date(timing.desiredMoveInDate),
      timing,
    );
  }

  /**
   * Score immediate availability against client timing
   */
  private static scoreImmediateAvailability(timing: ClientTiming): number {
    if (!timing.desiredMoveInDate) {
      return 100; // Perfect - no constraints
    }

    const today = new Date();
    const desiredDate = new Date(timing.desiredMoveInDate);
    const daysUntilDesired = this.daysBetween(today, desiredDate);

    // If desired date is in the past or very soon
    if (daysUntilDesired <= 7) {
      return 100; // Perfect - immediate availability matches urgent need
    }

    // If desired date is in the future
    if (daysUntilDesired <= 30) {
      return 90; // Excellent - available when needed
    }

    if (daysUntilDesired <= 90) {
      return 70; // Good - available early (client can wait)
    }

    return 50; // Available much earlier than needed
  }

  /**
   * Score alignment between property availability and client desired date
   */
  private static scoreDateAlignment(
    availableDate: Date,
    desiredDate: Date,
    timing: ClientTiming,
  ): number {
    const daysDifference = this.daysBetween(availableDate, desiredDate);
    const flexibilityDays = timing.flexibilityDays || 30; // Default 30 days flexibility

    // Perfect match: available exactly when desired (±7 days)
    if (Math.abs(daysDifference) <= 7) {
      return 100;
    }

    // Within flexibility window
    if (Math.abs(daysDifference) <= flexibilityDays) {
      const ratio = 1 - Math.abs(daysDifference) / flexibilityDays;
      return Math.round(70 + ratio * 30); // 70-100 points
    }

    // Available before desired date (early)
    if (daysDifference < 0) {
      const daysEarly = Math.abs(daysDifference);

      // Can wait if needed
      if (timing.canWait) {
        if (daysEarly <= 60) return 60; // Acceptable early
        if (daysEarly <= 120) return 40; // Quite early
        return 20; // Much too early
      }

      // Cannot wait - early is a problem
      return 30;
    }

    // Available after desired date (late)
    const daysLate = daysDifference;

    // Check urgency
    if (timing.urgency === 'high') {
      if (daysLate <= 14) return 50; // Barely acceptable
      return 0; // Too late for urgent need
    }

    if (timing.urgency === 'medium') {
      if (daysLate <= 30) return 60; // Acceptable
      if (daysLate <= 60) return 40; // Quite late
      return 20; // Too late
    }

    // Low urgency - more flexible
    if (daysLate <= 60) return 70; // Acceptable
    if (daysLate <= 120) return 50; // Quite late but ok
    return 30; // Very late
  }

  /**
   * Calculate days between two dates (date2 - date1)
   * Positive means date2 is after date1
   */
  private static daysBetween(date1: Date, date2: Date): number {
    const diffMs = date2.getTime() - date1.getTime();
    return Math.round(diffMs / this.MS_PER_DAY);
  }

  /**
   * Get urgency multiplier for scoring
   */
  static getUrgencyMultiplier(urgency?: 'low' | 'medium' | 'high'): number {
    switch (urgency) {
      case 'high':
        return 1.5;
      case 'medium':
        return 1.0;
      case 'low':
        return 0.7;
      default:
        return 1.0;
    }
  }
}
