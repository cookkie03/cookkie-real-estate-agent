/**
 * Auth Controller (Presentation Layer)
 *
 * Handles HTTP endpoints for authentication.
 */

import {
  Controller,
  Get,
  Post,
  UseGuards,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from '../../application/auth.service';
import { Public } from '@core/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Initiate Google OAuth flow
   */
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Initiate Google OAuth login' })
  async googleAuth() {
    // Guard redirects to Google
  }

  /**
   * Google OAuth callback
   */
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({ summary: 'Google OAuth callback' })
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    const googleUser = req.user as any;

    const loginResponse = await this.authService.googleLogin(googleUser);

    // Redirect to frontend with token
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/auth/callback?token=${loginResponse.accessToken}`
    );
  }

  /**
   * Get current user profile
   */
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: Request) {
    return req.user;
  }

  /**
   * Logout (client-side token deletion)
   */
  @Post('logout')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout (client-side)' })
  async logout() {
    return {
      message: 'Logged out successfully',
    };
  }
}
