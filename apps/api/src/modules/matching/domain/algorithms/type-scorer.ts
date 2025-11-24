/**
 * Type Scorer (Peso: 15%)
 *
 * Scores property-client match based on property type preferences.
 * Considers primary type, secondary types, and type categories.
 */

interface PropertyType {
  propertyType: string; // e.g., "Appartamento", "Villa", "Attico"
  subtype?: string; // e.g., "Bilocale", "Trilocale"
  features?: string[]; // e.g., ["garage", "giardino", "terrazzo"]
}

interface ClientTypePreferences {
  preferredTypes?: string[]; // Primary property types
  acceptableTypes?: string[]; // Secondary acceptable types
  requiredFeatures?: string[]; // Must-have features
  desiredFeatures?: string[]; // Nice-to-have features
}

export class TypeScorer {
  private static readonly TYPE_GROUPS: Record<string, string[]> = {
    apartment: ['appartamento', 'attico', 'loft', 'monolocale', 'bilocale', 'trilocale'],
    house: ['villa', 'villetta', 'casa indipendente', 'casa a schiera'],
    commercial: ['negozio', 'ufficio', 'capannone', 'laboratorio'],
    luxury: ['attico', 'villa', 'loft', 'penthouse'],
  };

  /**
   * Calculate type match score (0-100)
   */
  static calculate(
    property: PropertyType,
    preferences: ClientTypePreferences,
  ): number {
    let score = 0;

    // 1. Exact type match (50 points)
    if (this.hasExactTypeMatch(property, preferences)) {
      score += 50;
    }
    // 2. Acceptable type match (30 points)
    else if (this.hasAcceptableTypeMatch(property, preferences)) {
      score += 30;
    }
    // 3. Category match (20 points)
    else if (this.hasCategoryMatch(property, preferences)) {
      score += 20;
    }

    // 4. Required features match (30 points - must have all)
    if (this.hasAllRequiredFeatures(property, preferences)) {
      score += 30;
    } else if (preferences.requiredFeatures && preferences.requiredFeatures.length > 0) {
      // If required features specified but not all met, penalize
      return Math.min(score, 40); // Cap at 40 if required features missing
    }

    // 5. Desired features bonus (20 points max)
    const desiredFeaturesScore = this.calculateDesiredFeaturesScore(
      property,
      preferences,
    );
    score += desiredFeaturesScore;

    return Math.min(100, score);
  }

  /**
   * Check if property type exactly matches client's preferred types
   */
  private static hasExactTypeMatch(
    property: PropertyType,
    preferences: ClientTypePreferences,
  ): boolean {
    if (!preferences.preferredTypes || preferences.preferredTypes.length === 0) {
      return false;
    }

    const normalizedPropertyType = property.propertyType.toLowerCase().trim();
    return preferences.preferredTypes.some(
      (type) => type.toLowerCase().trim() === normalizedPropertyType,
    );
  }

  /**
   * Check if property type matches client's acceptable types
   */
  private static hasAcceptableTypeMatch(
    property: PropertyType,
    preferences: ClientTypePreferences,
  ): boolean {
    if (!preferences.acceptableTypes || preferences.acceptableTypes.length === 0) {
      return false;
    }

    const normalizedPropertyType = property.propertyType.toLowerCase().trim();
    return preferences.acceptableTypes.some(
      (type) => type.toLowerCase().trim() === normalizedPropertyType,
    );
  }

  /**
   * Check if property belongs to same category as preferred types
   */
  private static hasCategoryMatch(
    property: PropertyType,
    preferences: ClientTypePreferences,
  ): boolean {
    const propertyCategories = this.getTypeCategories(property.propertyType);

    const preferredCategories = new Set<string>();
    preferences.preferredTypes?.forEach((type) => {
      this.getTypeCategories(type).forEach((cat) => preferredCategories.add(cat));
    });

    return propertyCategories.some((cat) => preferredCategories.has(cat));
  }

  /**
   * Get categories that a property type belongs to
   */
  private static getTypeCategories(propertyType: string): string[] {
    const normalized = propertyType.toLowerCase().trim();
    const categories: string[] = [];

    for (const [category, types] of Object.entries(this.TYPE_GROUPS)) {
      if (types.some((type) => normalized.includes(type))) {
        categories.push(category);
      }
    }

    return categories;
  }

  /**
   * Check if property has all required features
   */
  private static hasAllRequiredFeatures(
    property: PropertyType,
    preferences: ClientTypePreferences,
  ): boolean {
    if (!preferences.requiredFeatures || preferences.requiredFeatures.length === 0) {
      return true; // No requirements = pass
    }

    if (!property.features || property.features.length === 0) {
      return false;
    }

    const normalizedPropertyFeatures = property.features.map((f) =>
      f.toLowerCase().trim(),
    );

    return preferences.requiredFeatures.every((required) => {
      const normalized = required.toLowerCase().trim();
      return normalizedPropertyFeatures.some((f) => f.includes(normalized));
    });
  }

  /**
   * Calculate score based on desired features match (0-20 points)
   */
  private static calculateDesiredFeaturesScore(
    property: PropertyType,
    preferences: ClientTypePreferences,
  ): number {
    if (!preferences.desiredFeatures || preferences.desiredFeatures.length === 0) {
      return 10; // Neutral score when no desired features specified
    }

    if (!property.features || property.features.length === 0) {
      return 0;
    }

    const normalizedPropertyFeatures = property.features.map((f) =>
      f.toLowerCase().trim(),
    );

    let matchedCount = 0;
    preferences.desiredFeatures.forEach((desired) => {
      const normalized = desired.toLowerCase().trim();
      if (normalizedPropertyFeatures.some((f) => f.includes(normalized))) {
        matchedCount++;
      }
    });

    const ratio = matchedCount / preferences.desiredFeatures.length;
    return Math.round(ratio * 20);
  }
}
