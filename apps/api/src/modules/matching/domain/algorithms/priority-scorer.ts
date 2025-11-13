/**
 * Priority Scorer (Peso: 10%)
 *
 * Scores property-client match based on client priority level and property characteristics.
 * Higher priority clients get better scores for premium properties.
 */

interface PropertyCharacteristics {
  status: 'draft' | 'available' | 'option' | 'sold' | 'rented' | 'suspended' | 'archived';
  isExclusive?: boolean; // Exclusive listing
  isPremium?: boolean; // Premium property
  viewsCount?: number; // Number of views
  daysOnMarket?: number; // Days since publication
  createdAt?: Date;
}

interface ClientPriority {
  level: 'low' | 'medium' | 'high' | 'vip'; // Client priority level
  isVerified?: boolean; // Verified client (ID, income, etc.)
  hasPreApproval?: boolean; // Has mortgage pre-approval
  responseRate?: number; // 0-100 - how responsive is the client
  pastInteractions?: number; // Number of properties viewed/contacted
}

export class PriorityScorer {
  /**
   * Calculate priority match score (0-100)
   */
  static calculate(
    property: PropertyCharacteristics,
    client: ClientPriority,
  ): number {
    let score = 0;

    // 1. Base score based on client priority level (40 points)
    score += this.getBasePriorityScore(client.level);

    // 2. Verification bonus (20 points)
    if (client.isVerified) {
      score += 20;
    }

    // 3. Property-client alignment bonus (20 points)
    score += this.calculateAlignmentBonus(property, client);

    // 4. Engagement bonus (20 points)
    score += this.calculateEngagementBonus(client);

    return Math.min(100, score);
  }

  /**
   * Get base score based on client priority level
   */
  private static getBasePriorityScore(
    level: 'low' | 'medium' | 'high' | 'vip',
  ): number {
    switch (level) {
      case 'vip':
        return 40; // VIP clients get highest priority
      case 'high':
        return 30; // High priority clients
      case 'medium':
        return 20; // Medium priority
      case 'low':
        return 10; // Low priority
      default:
        return 15; // Unknown - medium-low
    }
  }

  /**
   * Calculate alignment between property characteristics and client priority
   */
  private static calculateAlignmentBonus(
    property: PropertyCharacteristics,
    client: ClientPriority,
  ): number {
    let bonus = 0;

    // VIP and High priority clients get priority on premium/exclusive properties
    if (property.isExclusive || property.isPremium) {
      if (client.level === 'vip') {
        bonus += 20; // VIP gets max bonus for premium
      } else if (client.level === 'high') {
        bonus += 15; // High priority gets good bonus
      } else if (client.level === 'medium') {
        bonus += 10; // Medium priority gets some bonus
      } else {
        bonus += 5; // Low priority gets minimal bonus
      }
      return bonus;
    }

    // For regular properties, distribute more evenly
    if (client.level === 'vip' || client.level === 'high') {
      bonus += 15; // Still prioritize high-value clients
    } else if (client.level === 'medium') {
      bonus += 20; // Medium clients get best regular properties
    } else {
      bonus += 10; // Low priority gets standard properties
    }

    // Bonus for new listings (fresh properties for responsive clients)
    if (property.daysOnMarket !== undefined && property.daysOnMarket <= 7) {
      if (client.responseRate && client.responseRate >= 80) {
        bonus += 5; // Responsive clients get new listings
      }
    }

    return Math.min(20, bonus);
  }

  /**
   * Calculate engagement bonus based on client activity
   */
  private static calculateEngagementBonus(client: ClientPriority): number {
    let bonus = 0;

    // Pre-approval bonus (10 points)
    if (client.hasPreApproval) {
      bonus += 10;
    }

    // Response rate bonus (up to 10 points)
    if (client.responseRate !== undefined) {
      bonus += Math.round((client.responseRate / 100) * 10);
    } else {
      bonus += 5; // Neutral if unknown
    }

    return Math.min(20, bonus);
  }

  /**
   * Calculate property urgency score
   * Used to prioritize which properties to show first
   */
  static calculatePropertyUrgency(property: PropertyCharacteristics): number {
    let urgency = 50; // Base urgency

    // Status-based urgency
    if (property.status === 'available') {
      urgency += 30;
    } else if (property.status === 'draft') {
      urgency += 20;
    } else if (property.status === 'option') {
      urgency += 10;
    } else {
      urgency = 0; // Not available
    }

    // Premium properties are more urgent
    if (property.isPremium || property.isExclusive) {
      urgency += 20;
    }

    // Recent properties are more urgent
    if (property.daysOnMarket !== undefined) {
      if (property.daysOnMarket <= 3) {
        urgency += 15; // Very new
      } else if (property.daysOnMarket <= 7) {
        urgency += 10; // Recent
      } else if (property.daysOnMarket <= 30) {
        urgency += 5; // Fresh
      } else if (property.daysOnMarket > 90) {
        urgency -= 10; // Old listing
      }
    }

    return Math.min(100, Math.max(0, urgency));
  }

  /**
   * Calculate client urgency score
   * Used to prioritize which clients to contact first
   */
  static calculateClientUrgency(client: ClientPriority): number {
    let urgency = 50; // Base urgency

    // Priority level urgency
    switch (client.level) {
      case 'vip':
        urgency += 40;
        break;
      case 'high':
        urgency += 30;
        break;
      case 'medium':
        urgency += 15;
        break;
      case 'low':
        urgency += 0;
        break;
    }

    // Verified clients are more urgent
    if (client.isVerified) {
      urgency += 10;
    }

    // Pre-approved clients are ready to act
    if (client.hasPreApproval) {
      urgency += 15;
    }

    // Active clients are more urgent
    if (client.pastInteractions !== undefined) {
      if (client.pastInteractions >= 10) {
        urgency += 10; // Very active
      } else if (client.pastInteractions >= 5) {
        urgency += 5; // Active
      }
    }

    return Math.min(100, Math.max(0, urgency));
  }
}
