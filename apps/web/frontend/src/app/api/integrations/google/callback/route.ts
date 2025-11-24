/**
 * Google OAuth2 - Callback Handler
 * GET /api/integrations/google/callback?code=...&state=...
 *
 * This endpoint is called by Google after user grants permission
 */

import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // "google_calendar" or "gmail"
    const error = searchParams.get('error');

    // Handle user denial
    if (error) {
      console.error('OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/settings/integrations?error=access_denied&details=${error}`, request.url)
      );
    }

    // Validate parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=missing_parameters', request.url)
      );
    }

    // Validate state (provider type)
    if (!['google_calendar', 'gmail'].includes(state)) {
      return NextResponse.redirect(
        new URL('/settings/integrations?error=invalid_provider', request.url)
      );
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user info from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();

    if (!userInfo.email) {
      throw new Error('Failed to get user email from Google');
    }

    // Calculate token expiration
    const expiresAt = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3600 * 1000); // Default 1 hour

    // Save or update integration in database
    const integration = await prisma.integrationAuth.upsert({
      where: {
        provider_email: {
          provider: state,
          email: userInfo.email,
        },
      },
      update: {
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || undefined,
        tokenType: tokens.token_type || 'Bearer',
        expiresAt,
        scope: tokens.scope,
        isActive: true,
        accountId: userInfo.id || undefined,
        accountName: userInfo.name || undefined,
        lastError: null,
        errorCount: 0,
        updatedAt: new Date(),
      },
      create: {
        provider: state,
        email: userInfo.email,
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || undefined,
        tokenType: tokens.token_type || 'Bearer',
        expiresAt,
        scope: tokens.scope,
        isActive: true,
        accountId: userInfo.id || undefined,
        accountName: userInfo.name || undefined,
        syncEnabled: true,
        syncInterval: 300, // 5 minutes
      },
    });

    console.log(`Successfully connected ${state} for ${userInfo.email}`);

    // If Gmail, schedule initial fetch
    if (state === 'gmail') {
      // Trigger initial email fetch in background (non-blocking)
      fetch(`${request.nextUrl.origin}/api/integrations/gmail/fetch`, {
        method: 'POST',
      }).catch(err => console.error('Background fetch failed:', err));
    }

    // If Calendar, schedule initial sync
    if (state === 'google_calendar') {
      // Trigger initial calendar sync in background (non-blocking)
      fetch(`${request.nextUrl.origin}/api/integrations/google-calendar/sync`, {
        method: 'POST',
      }).catch(err => console.error('Background sync failed:', err));
    }

    // Redirect to settings with success message
    const redirectUrl = new URL('/settings/integrations', request.url);
    redirectUrl.searchParams.set('success', state);
    redirectUrl.searchParams.set('email', userInfo.email);

    return NextResponse.redirect(redirectUrl);
  } catch (error: any) {
    console.error('Google OAuth callback error:', error);

    // Redirect to settings with error
    return NextResponse.redirect(
      new URL(`/settings/integrations?error=auth_failed&details=${encodeURIComponent(error.message)}`, request.url)
    );
  }
}
