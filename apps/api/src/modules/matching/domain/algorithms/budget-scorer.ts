/**
 * Budget Scorer (Peso: 20%)
 *
 * Scores property-client match based on price/budget alignment.
 * Considers both sale and rental properties.
 */

interface PropertyPrice {
  contractType: 'sale' | 'rent';
  priceSale?: number | null;
  priceRent?: number | null;
}

interface ClientBudget {
  contractType: 'sale' | 'rent';
  budgetMin?: number | null;
  budgetMax?: number | null;
}

export class BudgetScorer {
  /**
   * Calculate budget match score (0-100)
   */
  static calculate(property: PropertyPrice, budget: ClientBudget): number {
    // Contract type must match
    if (property.contractType !== budget.contractType) {
      return 0;
    }

    const propertyPrice = this.getPropertyPrice(property);
    const budgetMin = budget.budgetMin || 0;
    const budgetMax = budget.budgetMax;

    // If no price available, cannot score
    if (propertyPrice === null || propertyPrice === 0) {
      return 50; // Neutral score when price unknown
    }

    // If no budget range specified, neutral score
    if (!budgetMax) {
      return 50;
    }

    // 1. Perfect match: within budget range (100 points)
    if (propertyPrice >= budgetMin && propertyPrice <= budgetMax) {
      // Give higher score if closer to middle of range
      const middle = (budgetMin + budgetMax) / 2;
      const deviation = Math.abs(propertyPrice - middle);
      const maxDeviation = (budgetMax - budgetMin) / 2;
      const centerScore = 1 - deviation / maxDeviation;
      return Math.round(80 + centerScore * 20); // 80-100 points
    }

    // 2. Slightly below budget min (60-79 points)
    if (propertyPrice < budgetMin) {
      const shortfall = budgetMin - propertyPrice;
      const allowedShortfall = budgetMin * 0.2; // 20% below min

      if (shortfall <= allowedShortfall) {
        const ratio = 1 - shortfall / allowedShortfall;
        return Math.round(60 + ratio * 19); // 60-79 points
      }
      return 0; // Too far below
    }

    // 3. Slightly above budget max (40-79 points)
    if (propertyPrice > budgetMax) {
      const excess = propertyPrice - budgetMax;
      const allowedExcess = budgetMax * 0.3; // 30% above max

      if (excess <= allowedExcess) {
        const ratio = 1 - excess / allowedExcess;
        return Math.round(40 + ratio * 39); // 40-79 points
      }
      return 0; // Too far above
    }

    return 50; // Fallback
  }

  /**
   * Get the relevant price based on contract type
   */
  private static getPropertyPrice(property: PropertyPrice): number | null {
    if (property.contractType === 'sale') {
      return property.priceSale || null;
    }
    return property.priceRent || null;
  }

  /**
   * Calculate budget flexibility score
   * Higher score = client has more budget flexibility
   */
  static calculateFlexibility(budget: ClientBudget): number {
    if (!budget.budgetMax || !budget.budgetMin) {
      return 100; // No constraints = maximum flexibility
    }

    const range = budget.budgetMax - budget.budgetMin;
    const average = (budget.budgetMax + budget.budgetMin) / 2;
    const flexibilityRatio = range / average;

    // 0-20% range = low flexibility (0-33 points)
    // 20-40% range = medium flexibility (34-66 points)
    // 40%+ range = high flexibility (67-100 points)

    if (flexibilityRatio >= 0.4) return 100;
    if (flexibilityRatio >= 0.2) return Math.round(34 + (flexibilityRatio - 0.2) * 165);
    return Math.round(flexibilityRatio * 165);
  }
}
