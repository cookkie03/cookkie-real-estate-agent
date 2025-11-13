/**
 * Google OAuth2 - Start Authentication Flow
 * GET /api/integrations/google/auth?service=calendar|gmail
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { validateGoogleOAuthConfig, getGoogleScopes } from '@/lib/google-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const service = searchParams.get('service'); // "calendar" or "gmail"

    // Validate service parameter
    if (!service || !['calendar', 'gmail'].includes(service)) {
      return NextResponse.json(
        { error: 'Invalid service. Must be "calendar" or "gmail"' },
        { status: 400 }
      );
    }

    // Validate OAuth config
    const configValidation = validateGoogleOAuthConfig();
    if (!configValidation.valid) {
      return NextResponse.json(
        {
          error: 'Google OAuth not configured',
          missing: configValidation.missing,
          hint: 'Please set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI in your .env file'
        },
        { status: 500 }
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Determine provider type
    const provider = service === 'calendar' ? 'google_calendar' : 'gmail';

    // Get appropriate scopes
    const scopes = getGoogleScopes(provider as any);

    // Generate auth URL
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request refresh token
      scope: scopes,
      state: provider, // Pass provider type via state parameter
      prompt: 'consent', // Force consent screen to always get refresh token
      include_granted_scopes: true, // Incremental authorization
    });

    return NextResponse.json({
      success: true,
      authUrl,
      provider,
      scopes,
    });
  } catch (error: any) {
    console.error('Google auth error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate authentication URL',
        details: error.message
      },
      { status: 500 }
    );
  }
}
