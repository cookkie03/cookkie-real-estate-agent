/**
 * CRM IMMOBILIARE - Centralized Configuration Management
 *
 * Gestisce la configurazione dell'applicazione con precedenza:
 * 1. Database (UserProfile.settings) - Configurato via GUI
 * 2. Environment Variables (.env) - Fallback server-side
 * 3. Default Values - Built-in defaults
 *
 * Questo modulo fornisce accesso type-safe alla configurazione
 * e gestisce la sincronizzazione tra database e environment.
 */

import { prisma } from '@/lib/db';

// ============================================================================
// TYPES
// ============================================================================

export interface AppConfig {
  // API Keys
  googleApiKey: string | null;
  openRouterApiKey: string | null;
  mapboxApiKey: string | null;

  // AI Configuration
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
  aiTimeout: number;

  // Application Settings
  commissionPercent: number;
  defaultCurrency: string;
  timezone: string;

  // Feature Flags
  features: {
    aiAssistant: boolean;
    propertyMatching: boolean;
    dailyBriefing: boolean;
    scraping: boolean;
    advancedMaps: boolean;
  };
}

export interface UserSettings {
  commissionPercent?: number;
  googleApiKey?: string;
  openRouterApiKey?: string;
  mapboxApiKey?: string;
  aiModel?: string;
  aiTemperature?: number;
  aiMaxTokens?: number;
  [key: string]: any;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: AppConfig = {
  // API Keys (from environment or null)
  googleApiKey: process.env.GOOGLE_API_KEY || null,
  openRouterApiKey: process.env.OPENROUTER_API_KEY || null,
  mapboxApiKey: process.env.MAPBOX_API_KEY || null,

  // AI Configuration (from environment with defaults)
  aiModel: process.env.GOOGLE_MODEL || 'gemini-1.5-pro',
  aiTemperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  aiMaxTokens: parseInt(process.env.AI_MAX_TOKENS || '2048', 10),
  aiTimeout: parseInt(process.env.AI_TIMEOUT || '60', 10),

  // Application Settings
  commissionPercent: 3.0,
  defaultCurrency: 'EUR',
  timezone: 'Europe/Rome',

  // Feature Flags (auto-enable based on API keys)
  features: {
    aiAssistant: !!process.env.GOOGLE_API_KEY,
    propertyMatching: !!process.env.GOOGLE_API_KEY,
    dailyBriefing: !!process.env.GOOGLE_API_KEY,
    scraping: false, // Future feature
    advancedMaps: !!process.env.MAPBOX_API_KEY,
  },
};

// ============================================================================
// CONFIGURATION LOADER
// ============================================================================

/**
 * Carica la configurazione con precedenza Database > Env > Defaults
 * @param useCache - Se true, usa la cache in-memory (default: true)
 */
export async function loadConfig(useCache: boolean = true): Promise<AppConfig> {
  try {
    // Cerca il primo UserProfile nel database
    const userProfile = await prisma.userProfile.findFirst({
      select: { settings: true },
    });

    // Se non esiste UserProfile, setup non completato -> usa solo env/defaults
    if (!userProfile) {
      return DEFAULT_CONFIG;
    }

    // Parse settings dal database (stored as JSON)
    const dbSettings = (userProfile.settings as UserSettings) || {};

    // Merge con precedenza: DB > ENV > DEFAULT
    const config: AppConfig = {
      // API Keys: DB first, then ENV
      googleApiKey: dbSettings.googleApiKey || DEFAULT_CONFIG.googleApiKey,
      openRouterApiKey: dbSettings.openRouterApiKey || DEFAULT_CONFIG.openRouterApiKey,
      mapboxApiKey: dbSettings.mapboxApiKey || DEFAULT_CONFIG.mapboxApiKey,

      // AI Config: DB first, then ENV, then defaults
      aiModel: dbSettings.aiModel || DEFAULT_CONFIG.aiModel,
      aiTemperature: dbSettings.aiTemperature ?? DEFAULT_CONFIG.aiTemperature,
      aiMaxTokens: dbSettings.aiMaxTokens ?? DEFAULT_CONFIG.aiMaxTokens,
      aiTimeout: DEFAULT_CONFIG.aiTimeout,

      // App Settings: DB first, then defaults
      commissionPercent: dbSettings.commissionPercent ?? DEFAULT_CONFIG.commissionPercent,
      defaultCurrency: DEFAULT_CONFIG.defaultCurrency,
      timezone: DEFAULT_CONFIG.timezone,

      // Feature Flags: auto-determine based on API keys
      features: {
        aiAssistant: !!(dbSettings.googleApiKey || DEFAULT_CONFIG.googleApiKey),
        propertyMatching: !!(dbSettings.googleApiKey || DEFAULT_CONFIG.googleApiKey),
        dailyBriefing: !!(dbSettings.googleApiKey || DEFAULT_CONFIG.googleApiKey),
        scraping: false,
        advancedMaps: !!(dbSettings.mapboxApiKey || DEFAULT_CONFIG.mapboxApiKey),
      },
    };

    return config;
  } catch (error) {
    console.error('[Config] Error loading config from database:', error);
    // Fallback to environment/defaults on error
    return DEFAULT_CONFIG;
  }
}

/**
 * Salva le impostazioni utente nel database
 * @param settings - Partial settings to save
 */
export async function saveConfig(settings: Partial<UserSettings>): Promise<void> {
  try {
    // Trova o crea UserProfile
    let userProfile = await prisma.userProfile.findFirst();

    if (!userProfile) {
      throw new Error('UserProfile not found. Complete setup first.');
    }

    // Merge existing settings with new ones
    const currentSettings = (userProfile.settings as UserSettings) || {};
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    };

    // Update database
    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { settings: updatedSettings },
    });

    console.log('[Config] Settings saved successfully');
  } catch (error) {
    console.error('[Config] Error saving config:', error);
    throw error;
  }
}

/**
 * Verifica se il setup iniziale è stato completato
 * @returns true se esiste un UserProfile, false altrimenti
 */
export async function isSetupCompleted(): Promise<boolean> {
  try {
    const userProfile = await prisma.userProfile.findFirst();
    return !!userProfile;
  } catch (error) {
    console.error('[Config] Error checking setup status:', error);
    return false;
  }
}

/**
 * Ottiene solo le API keys (utile per endpoints API)
 */
export async function getApiKeys(): Promise<{
  googleApiKey: string | null;
  openRouterApiKey: string | null;
  mapboxApiKey: string | null;
}> {
  const config = await loadConfig();
  return {
    googleApiKey: config.googleApiKey,
    openRouterApiKey: config.openRouterApiKey,
    mapboxApiKey: config.mapboxApiKey,
  };
}

/**
 * Testa la connessione a Google AI API
 * @param apiKey - API key to test (optional, uses config if not provided)
 */
export async function testGoogleAIConnection(apiKey?: string): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    const key = apiKey || (await loadConfig()).googleApiKey;

    if (!key) {
      return {
        success: false,
        message: 'API key non configurata',
      };
    }

    // Test connection usando Google Generative AI SDK
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    // Simple test: list models or generate content
    const result = await model.generateContent('Test connection');
    const response = await result.response;

    if (response.text()) {
      return {
        success: true,
        message: 'Connessione a Google AI riuscita',
      };
    }

    return {
      success: false,
      message: 'Risposta non valida da Google AI',
    };
  } catch (error: any) {
    console.error('[Config] Google AI connection test failed:', error);

    // Parse error message
    let message = 'Errore di connessione';
    if (error.message?.includes('API key')) {
      message = 'API key non valida';
    } else if (error.message?.includes('quota')) {
      message = 'Quota API superata';
    } else if (error.message?.includes('network')) {
      message = 'Errore di rete';
    }

    return {
      success: false,
      message,
    };
  }
}

// ============================================================================
// EXPORT DEFAULT CONFIG FOR CLIENT-SIDE
// ============================================================================

/**
 * Client-side config (only non-sensitive data)
 * Use this in client components for feature flags and public settings
 */
export const CLIENT_CONFIG = {
  defaultCurrency: DEFAULT_CONFIG.defaultCurrency,
  timezone: DEFAULT_CONFIG.timezone,
  aiModel: DEFAULT_CONFIG.aiModel,
  // Features will be determined at runtime based on API keys
};
