/**
 * API Route: Manage Google AI Model Selection
 * GET/POST /api/settings/ai-model
 *
 * Gestisce la selezione del modello Google AI nel database (UserProfile.settings)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Available Google Gemini models
export const AVAILABLE_MODELS = [
  {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    description: 'Latest experimental model - Fast, optimized for tool calling',
    recommended: true,
  },
  {
    id: 'gemini-2.0-flash-thinking-exp-1219',
    name: 'Gemini 2.0 Flash Thinking',
    description: 'With internal reasoning - Better for complex tasks',
    recommended: false,
  },
  {
    id: 'gemini-1.5-flash-latest',
    name: 'Gemini 1.5 Flash (Stable)',
    description: 'Production-ready, stable version',
    recommended: false,
  },
  {
    id: 'gemini-1.5-flash-8b-latest',
    name: 'Gemini 1.5 Flash 8B',
    description: 'Ultra-fast, economical - For simple tasks',
    recommended: false,
  },
  {
    id: 'gemini-1.5-pro-latest',
    name: 'Gemini 1.5 Pro',
    description: 'Most capable, slower and more expensive',
    recommended: false,
  },
];

/**
 * GET - Retrieve current model selection
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
    const currentModel = settings.googleAiModel || 'gemini-2.0-flash-exp';

    return NextResponse.json({
      success: true,
      data: {
        currentModel,
        availableModels: AVAILABLE_MODELS,
      },
    });
  } catch (error: any) {
    console.error('[API Get AI Model] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error retrieving AI model',
    }, { status: 500 });
  }
}

/**
 * POST - Update AI model selection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model } = body;

    if (!model || typeof model !== 'string') {
      return NextResponse.json({
        success: false,
        message: 'Model name is required and must be a string',
      }, { status: 400 });
    }

    // Validate model is in available list (or allow custom)
    const isValidModel = AVAILABLE_MODELS.some(m => m.id === model) || model.startsWith('gemini-');
    if (!isValidModel) {
      return NextResponse.json({
        success: false,
        message: 'Invalid model name. Must be a valid Gemini model.',
      }, { status: 400 });
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
      googleAiModel: model,
    };

    await prisma.userProfile.update({
      where: { id: userProfile.id },
      data: { settings: updatedSettings },
    });

    return NextResponse.json({
      success: true,
      message: 'AI model updated successfully',
      data: {
        model,
        needsRestart: true,
      },
    });
  } catch (error: any) {
    console.error('[API Update AI Model] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error updating AI model',
    }, { status: 500 });
  }
}
