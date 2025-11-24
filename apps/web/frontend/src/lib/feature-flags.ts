/**
 * Feature Flags Configuration
 *
 * Controls which features are enabled/disabled in the application.
 * Set to false to hide UI elements and prevent API calls.
 */

export const FEATURE_FLAGS = {
  // Email features
  EMAIL_SEND: false, // Disable sending emails (read-only email viewing is OK)
  EMAIL_READ: true,  // Allow reading/viewing emails

  // WhatsApp features
  WHATSAPP_SEND: false, // Disable sending WhatsApp messages (bulk messaging disabled)
  WHATSAPP_READ: true,  // Allow reading incoming WhatsApp messages

  // Calendar features
  CALENDAR_READ: true,   // Allow reading Google Calendar events
  CALENDAR_WRITE: false, // Disable creating/modifying calendar events (read-only)

  // AI features
  AI_CHAT: false,        // Disable AI chat assistant
  AI_SCORING: false,     // Disable AI-powered scoring (use deterministic algorithm)
  AI_BRIEFING: false,    // Disable AI briefings

  // Matching algorithm
  USE_DETERMINISTIC_MATCHING: true, // Use deterministic algorithm instead of AI

  // Scraping features
  SCRAPING_ENABLED: true, // Enable scraping functionality
  SCRAPING_BROWSER_STREAM: true, // Enable browser streaming visualization
} as const;

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature];
}

/**
 * Feature descriptions for documentation
 */
export const FEATURE_DESCRIPTIONS = {
  EMAIL_SEND: 'Send emails to clients - DISABLED per user requirements',
  EMAIL_READ: 'View incoming emails',
  WHATSAPP_SEND: 'Send WhatsApp messages - DISABLED (no bulk messaging)',
  WHATSAPP_READ: 'Receive and view WhatsApp messages',
  CALENDAR_READ: 'View Google Calendar events (read-only)',
  CALENDAR_WRITE: 'Create/modify calendar events - DISABLED (read-only mode)',
  AI_CHAT: 'AI chat assistant - DISABLED',
  AI_SCORING: 'AI property scoring - DISABLED (use deterministic)',
  AI_BRIEFING: 'AI daily briefings - DISABLED',
  USE_DETERMINISTIC_MATCHING: 'Deterministic matching algorithm (enabled)',
  SCRAPING_ENABLED: 'Web scraping functionality',
  SCRAPING_BROWSER_STREAM: 'Real-time browser visualization during scraping',
} as const;
