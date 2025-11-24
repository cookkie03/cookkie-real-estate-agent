/**
 * API Route: Manage Google AI API Key
 * GET/POST /api/settings/api-key
 *
 * Gestisce la Google AI API key nel database (UserProfile.settings)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { testGoogleAIConnection } from '@/lib/config';

/**
 * GET - Retrieve current API key status (masked)
 */
export async function GET() {
  try {
    const userProfile = await prisma.userProfile.findFirst({
      select: { settings: true },
    });

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        message: 'UserProfile not found. Complete setup first.',
      }, { status: 404 });
    }

    const settings = userProfile.settings as any || {};
    const apiKey = settings.googleAiApiKey || '';

    // Return masked API key for security
    const masked = apiKey
      ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`
      : '';

    return NextResponse.json({
      success: true,
      data: {
        hasApiKey: !!apiKey,
        maskedKey: masked,
      },
    });
  } catch (error: any) {
    console.error('[API Get API Key] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error retrieving API key',
    }, { status: 500 });
  }
}

/**
 * POST - Update API key and optionally test it
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { apiKey, testConnection = true } = body;

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'API key is required and must be a string',
      }, { status: 400 });
    }

    // Validate API key format (basic)
    if (apiKey.length < 20) {
      return NextResponse.json({
        success: false,
        message: 'API key seems invalid (too short)',
      }, { status: 400 });
    }

    // Test connection if requested
    if (testConnection) {
      const testResult = await testGoogleAIConnection(apiKey);
      if (!testResult.success) {
        return NextResponse.json({
          success: false,
          message: testResult.message || 'API key test failed',
          testResult,
        }, { status: 400 });
      }
    }

    // Update UserProfile settings
    const userProfile = await prisma.userProfile.findFirst();

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        message: 'UserProfile not found. Complete setup first.',
      }, { status: 404 });
    }

    const currentSettings = (userProfile.settings as any) || {};
    const updatedSettings = {
      ...currentSettings,
      googleAiApiKey: apiKey,
    };

    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { settings: updatedSettings },
    });

    return NextResponse.json({
      success: true,
      message: 'API key saved successfully',
      data: {
        maskedKey: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
        needsRestart: true,
      },
    });
  } catch (error: any) {
    console.error('[API Update API Key] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating API key',
    }, { status: 500 });
  }
}

/**
 * DELETE - Remove API key from database
 */
export async function DELETE() {
  try {
    const userProfile = await prisma.userProfile.findFirst();

    if (!userProfile) {
      return NextResponse.json({
        success: false,
        message: 'UserProfile not found',
      }, { status: 404 });
    }

    const currentSettings = (userProfile.settings as any) || {};
    const { googleAiApiKey, ...restSettings } = currentSettings;

    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { settings: restSettings },
    });

    return NextResponse.json({
      success: true,
      message: 'API key removed successfully',
    });
  } catch (error: any) {
    console.error('[API Delete API Key] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error removing API key',
    }, { status: 500 });
  }
}
