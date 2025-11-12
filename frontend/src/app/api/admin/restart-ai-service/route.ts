/**
 * API Route: Restart AI Service
 * POST /api/admin/restart-ai-service
 *
 * Riavvia il servizio ai-tools per applicare nuove configurazioni (es. API key).
 * In Docker: docker-compose restart ai-tools
 * In Dev: notifica che serve riavvio manuale
 */

import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Check if running in Docker (environment variable set in docker-compose)
    const isDocker = process.env.DOCKER_ENV === 'true';
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (isDocker) {
      // Docker environment - restart ai-tools container
      try {
        const { stdout, stderr } = await execAsync('docker-compose restart ai-tools', {
          cwd: process.cwd(), // Should be /app in container
          timeout: 30000, // 30s timeout
        });

        return NextResponse.json({
          success: true,
          message: 'AI service restarted successfully',
          details: 'Container ai-tools restarted via docker-compose',
          output: stdout,
        });
      } catch (dockerError: any) {
        // Fallback: Try docker restart command directly
        try {
          const { stdout } = await execAsync('docker restart cookkie-real-estate-agent-ai-tools-1', {
            timeout: 30000,
          });

          return NextResponse.json({
            success: true,
            message: 'AI service restarted successfully',
            details: 'Container restarted via docker command',
            output: stdout,
          });
        } catch (fallbackError: any) {
          return NextResponse.json({
            success: false,
            message: 'Failed to restart AI service',
            error: dockerError.message,
            fallbackError: fallbackError.message,
            suggestion: 'Please restart manually: docker-compose restart ai-tools',
          }, { status: 500 });
        }
      }
    } else if (isDevelopment) {
      // Development environment - cannot auto-restart
      return NextResponse.json({
        success: false,
        message: 'Manual restart required in development',
        details: 'Please restart the AI service manually to apply changes',
        instructions: [
          '1. Stop the AI service (Ctrl+C in terminal)',
          '2. Start it again: cd ai_tools && python main.py',
          'OR restart the entire dev server: npm run dev',
        ],
      }, { status: 200 }); // 200 because this is expected behavior
    } else {
      // Production non-Docker (should not happen)
      return NextResponse.json({
        success: false,
        message: 'Restart not supported in this environment',
        details: 'Cannot automatically restart AI service. Please restart manually.',
      }, { status: 501 });
    }
  } catch (error: any) {
    console.error('[API Restart AI Service] Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Error restarting AI service',
    }, { status: 500 });
  }
}

/**
 * GET - Check restart capability and service status
 */
export async function GET() {
  const isDocker = process.env.DOCKER_ENV === 'true';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return NextResponse.json({
    success: true,
    data: {
      canAutoRestart: isDocker,
      environment: isDocker ? 'docker' : (isDevelopment ? 'development' : 'production'),
      restartMethod: isDocker ? 'docker-compose' : 'manual',
    },
  });
}
