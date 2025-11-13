/**
 * CRM IMMOBILIARE - Urgency Color Utilities
 *
 * Maps urgency scores (0-5) to color values for map visualization.
 *
 * Urgency Levels:
 * - 5: 🔴 URGENT (Red)
 * - 4: 🟠 WARNING (Orange)
 * - 3: 🟡 MONITOR (Yellow)
 * - 2: 🟢 OPTIMAL (Green)
 * - 1: 🔵 NEW (Cyan)
 * - 0: ⚫ SOLD (Gray)
 *
 * @module lib/map/urgency-colors
 * @since v3.2.0
 */

export interface UrgencyLevel {
  score: number;
  name: string;
  color: string;
  hex: string;
  emoji: string;
  description: string;
}

/**
 * Urgency level definitions
 */
export const URGENCY_LEVELS: Record<number, UrgencyLevel> = {
  5: {
    score: 5,
    name: 'URGENT',
    color: 'urgency-urgent',
    hex: '#ef4444', // Red 500
    emoji: '🔴',
    description: 'Richiede azione immediata'
  },
  4: {
    score: 4,
    name: 'WARNING',
    color: 'urgency-warning',
    hex: '#f97316', // Orange 500
    emoji: '🟠',
    description: 'Monitorare da vicino'
  },
  3: {
    score: 3,
    name: 'MONITOR',
    color: 'urgency-monitor',
    hex: '#eab308', // Yellow 500
    emoji: '🟡',
    description: 'Situazione sotto controllo'
  },
  2: {
    score: 2,
    name: 'OPTIMAL',
    color: 'urgency-optimal',
    hex: '#10b981', // Green 500
    emoji: '🟢',
    description: 'Tutto procede bene'
  },
  1: {
    score: 1,
    name: 'NEW',
    color: 'urgency-new',
    hex: '#06b6d4', // Cyan 500
    emoji: '🔵',
    description: 'Setup in corso'
  },
  0: {
    score: 0,
    name: 'SOLD',
    color: 'urgency-sold',
    hex: '#6b7280', // Gray 500
    emoji: '⚫',
    description: 'Concluso'
  }
};

/**
 * Get urgency level for a score
 */
export function getUrgencyLevel(score: number): UrgencyLevel {
  // Clamp score to 0-5 range
  const clampedScore = Math.max(0, Math.min(5, Math.round(score)));
  return URGENCY_LEVELS[clampedScore];
}

/**
 * Get hex color for urgency score
 */
export function getUrgencyColor(score: number): string {
  return getUrgencyLevel(score).hex;
}

/**
 * Get Tailwind class for urgency score
 */
export function getUrgencyClass(score: number): string {
  return `bg-${getUrgencyLevel(score).color}`;
}

/**
 * Get emoji for urgency score
 */
export function getUrgencyEmoji(score: number): string {
  return getUrgencyLevel(score).emoji;
}

/**
 * Get name for urgency score
 */
export function getUrgencyName(score: number): string {
  return getUrgencyLevel(score).name;
}

/**
 * Get description for urgency score
 */
export function getUrgencyDescription(score: number): string {
  return getUrgencyLevel(score).description;
}

/**
 * Get all urgency levels sorted by score (descending)
 */
export function getAllUrgencyLevels(): UrgencyLevel[] {
  return [
    URGENCY_LEVELS[5],
    URGENCY_LEVELS[4],
    URGENCY_LEVELS[3],
    URGENCY_LEVELS[2],
    URGENCY_LEVELS[1],
    URGENCY_LEVELS[0]
  ];
}
