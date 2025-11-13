/**
 * Match Result Entity (Domain Layer)
 *
 * Represents the result of matching a property with a client.
 * Contains individual scores from each scorer component.
 */

export interface ScoreBreakdown {
  zone: number; // 0-100, peso: 25%
  budget: number; // 0-100, peso: 20%
  type: number; // 0-100, peso: 15%
  surface: number; // 0-100, peso: 15%
  availability: number; // 0-100, peso: 10%
  priority: number; // 0-100, peso: 10%
  affinity: number; // 0-100, peso: 5%
}

export class MatchResult {
  readonly propertyId: string;
  readonly clientId: string;
  readonly totalScore: number; // 0-100 (weighted average)
  readonly scoreBreakdown: ScoreBreakdown;
  readonly matchedAt: Date;

  constructor(data: {
    propertyId: string;
    clientId: string;
    scoreBreakdown: ScoreBreakdown;
  }) {
    this.propertyId = data.propertyId;
    this.clientId = data.clientId;
    this.scoreBreakdown = data.scoreBreakdown;
    this.totalScore = this.calculateTotalScore();
    this.matchedAt = new Date();
  }

  /**
   * Calculate weighted total score based on component weights
   */
  private calculateTotalScore(): number {
    const weights = {
      zone: 0.25,
      budget: 0.20,
      type: 0.15,
      surface: 0.15,
      availability: 0.10,
      priority: 0.10,
      affinity: 0.05,
    };

    const total =
      this.scoreBreakdown.zone * weights.zone +
      this.scoreBreakdown.budget * weights.budget +
      this.scoreBreakdown.type * weights.type +
      this.scoreBreakdown.surface * weights.surface +
      this.scoreBreakdown.availability * weights.availability +
      this.scoreBreakdown.priority * weights.priority +
      this.scoreBreakdown.affinity * weights.affinity;

    return Math.round(total * 100) / 100; // Round to 2 decimals
  }

  /**
   * Check if this match meets minimum quality threshold
   */
  isQualityMatch(threshold: number = 60): boolean {
    return this.totalScore >= threshold;
  }

  /**
   * Get match quality category
   */
  getQualityCategory(): 'excellent' | 'good' | 'fair' | 'poor' {
    if (this.totalScore >= 80) return 'excellent';
    if (this.totalScore >= 60) return 'good';
    if (this.totalScore >= 40) return 'fair';
    return 'poor';
  }

  /**
   * Get the weakest scoring component
   */
  getWeakestComponent(): keyof ScoreBreakdown {
    const entries = Object.entries(this.scoreBreakdown) as [
      keyof ScoreBreakdown,
      number,
    ][];
    return entries.reduce((min, curr) => (curr[1] < min[1] ? curr : min))[0];
  }

  /**
   * Get the strongest scoring component
   */
  getStrongestComponent(): keyof ScoreBreakdown {
    const entries = Object.entries(this.scoreBreakdown) as [
      keyof ScoreBreakdown,
      number,
    ][];
    return entries.reduce((max, curr) => (curr[1] > max[1] ? curr : max))[0];
  }
}
