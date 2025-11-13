/**
 * Auth Service (Application Layer)
 *
 * Orchestrates authentication logic.
 */

import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../infrastructure/user.repository';
import { User } from '../domain/user.entity';

export interface JwtPayload {
  sub: string; // user ID
  email: string;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private jwtService: JwtService,
    private userRepository: UserRepository
  ) {}

  /**
   * Validate user by JWT payload
   */
  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.userRepository.findById(payload.sub);
    return user;
  }

  /**
   * Login or register user via Google OAuth
   */
  async googleLogin(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    googleId: string;
  }): Promise<LoginResponse> {
    let user = await this.userRepository.findByGoogleId(googleUser.googleId);

    if (!user) {
      // Create new user
      user = await this.userRepository.create({
        email: googleUser.email,
        fullName: `${googleUser.firstName} ${googleUser.lastName}`,
        googleId: googleUser.googleId,
      });

      this.logger.log(`New user created via Google OAuth: ${user.email}`);
    }

    return this.generateLoginResponse(user);
  }

  /**
   * Generate access token
   */
  private generateLoginResponse(user: User): LoginResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
    };
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
