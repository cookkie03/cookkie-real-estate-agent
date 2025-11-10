/**
 * Google OAuth2 Authentication Utility
 * Manages OAuth2 clients and token refresh for Google services
 */

import { google } from 'googleapis';
import { prisma } from './db';

export type GoogleProvider = 'google_calendar' | 'gmail';

/**
 * Get authenticated Google OAuth2 client for a specific provider
 * Automatically handles token refresh
 */
export async function getGoogleAuthClient(provider: GoogleProvider) {
  // Find active integration
  const auth = await prisma.integrationAuth.findFirst({
    where: {
      provider,
      isActive: true
    },
  });

  if (!auth) {
    throw new Error(`No active ${provider} integration found. Please connect your account first.`);
  }

  // Check if token is expired
  const now = new Date();
  if (auth.expiresAt && auth.expiresAt < now) {
    console.log(`Token expired for ${provider}, needs refresh`);
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  // Set credentials
  oauth2Client.setCredentials({
    access_token: auth.accessToken,
    refresh_token: auth.refreshToken || undefined,
    expiry_date: auth.expiresAt?.getTime(),
    token_type: auth.tokenType || 'Bearer',
    scope: auth.scope || undefined,
  });

  // Auto-refresh token handler
  oauth2Client.on('tokens', async (tokens) => {
    console.log(`Token refreshed for ${provider}`);

    try {
      const updateData: any = {
        accessToken: tokens.access_token || auth.accessToken,
        updatedAt: new Date(),
      };

      // Only update refresh token if a new one was provided
      if (tokens.refresh_token) {
        updateData.refreshToken = tokens.refresh_token;
      }

      // Update expiry
      if (tokens.expiry_date) {
        updateData.expiresAt = new Date(tokens.expiry_date);
      }

      await prisma.integrationAuth.update({
        where: { id: auth.id },
        data: updateData,
      });

      console.log(`Token saved to database for ${provider}`);
    } catch (error) {
      console.error(`Failed to save refreshed token for ${provider}:`, error);
    }
  });

  return oauth2Client;
}

/**
 * Validate OAuth2 credentials for environment
 */
export function validateGoogleOAuthConfig(): {
  valid: boolean;
  missing: string[];
} {
  const required = [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'GOOGLE_REDIRECT_URI',
  ];

  const missing = required.filter(key => !process.env[key]);

  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * Get OAuth2 scopes for a provider
 */
export function getGoogleScopes(provider: GoogleProvider): string[] {
  switch (provider) {
    case 'google_calendar':
      return [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ];
    case 'gmail':
      return [
        'https://www.googleapis.com/auth/gmail.readonly',
        'https://www.googleapis.com/auth/gmail.send',
        'https://www.googleapis.com/auth/gmail.modify',
      ];
    default:
      return [];
  }
}

/**
 * Check if integration is connected and active
 */
export async function isGoogleIntegrationActive(provider: GoogleProvider): Promise<boolean> {
  const auth = await prisma.integrationAuth.findFirst({
    where: {
      provider,
      isActive: true
    },
  });

  return !!auth;
}

/**
 * Disconnect Google integration
 */
export async function disconnectGoogleIntegration(provider: GoogleProvider): Promise<void> {
  await prisma.integrationAuth.updateMany({
    where: { provider },
    data: {
      isActive: false,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get integration status for all Google services
 */
export async function getGoogleIntegrationStatus() {
  const integrations = await prisma.integrationAuth.findMany({
    where: {
      provider: {
        in: ['google_calendar', 'gmail'],
      },
    },
    select: {
      id: true,
      provider: true,
      isActive: true,
      email: true,
      accountName: true,
      lastSyncAt: true,
      nextSyncAt: true,
      errorCount: true,
      lastError: true,
      createdAt: true,
    },
  });

  return integrations;
}
