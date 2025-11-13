/**
 * Auth Module
 *
 * Handles authentication and authorization.
 * Supports JWT tokens and Google OAuth.
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Application layer
import { AuthService } from './application/auth.service';
import { JwtStrategy } from './application/strategies/jwt.strategy';
import { GoogleStrategy } from './application/strategies/google.strategy';

// Presentation layer
import { AuthController } from './presentation/controllers/auth.controller';

// Infrastructure
import { UserRepository } from './infrastructure/user.repository';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRATION', '7d'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, UserRepository],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}
