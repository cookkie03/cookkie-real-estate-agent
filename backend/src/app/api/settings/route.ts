/**
 * Settings API - GET/PUT /api/settings
 * Manage environment variables and configuration
 */

import { NextRequest } from 'next/server';
import { apiResponse, apiError } from '@/lib/utils';
import { updateSettingsSchema } from '@/lib/validation';
import { writeFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // Return current settings (masked for security)
    const settings = {
      googleApiKey: process.env.GOOGLE_API_KEY ? '***' + process.env.GOOGLE_API_KEY?.slice(-4) : null,
      openaiApiKey: process.env.OPENAI_API_KEY ? '***' + process.env.OPENAI_API_KEY?.slice(-4) : null,
      databaseUrl: process.env.DATABASE_URL ? 'postgresql://***' : null,
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || '3001',
      corsOrigins: process.env.CORS_ORIGINS || '*',
    };

    return apiResponse({ settings });
  } catch (error) {
    return apiError(error as Error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const data = updateSettingsSchema.parse(body);

    // In production on Railway, settings are managed via Railway dashboard
    // This endpoint is for development/testing only
    if (process.env.NODE_ENV === 'production') {
      return apiError('Settings cannot be updated in production. Use Railway dashboard.', 403);
    }

    // Update .env file (development only)
    const envPath = join(process.cwd(), '.env');
    let envContent = '';

    if (data.googleApiKey) envContent += `GOOGLE_API_KEY=${data.googleApiKey}\n`;
    if (data.openaiApiKey) envContent += `OPENAI_API_KEY=${data.openaiApiKey}\n`;
    if (data.smtpHost) envContent += `SMTP_HOST=${data.smtpHost}\n`;
    if (data.smtpPort) envContent += `SMTP_PORT=${data.smtpPort}\n`;
    if (data.corsOrigins) envContent += `CORS_ORIGINS=${data.corsOrigins}\n`;

    await writeFile(envPath, envContent);

    return apiResponse({ updated: true, message: 'Settings updated. Restart server to apply changes.' });
  } catch (error) {
    return apiError(error as Error, 400);
  }
}
