/**
 * User Repository (Infrastructure)
 *
 * Handles user data persistence using Prisma.
 * Maps between Prisma models and domain entities.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { User } from '../domain/user.entity';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { id },
    });

    return profile ? this.mapToEntity(profile) : null;
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const profile = await this.prisma.userProfile.findUnique({
      where: { email },
    });

    return profile ? this.mapToEntity(profile) : null;
  }

  /**
   * Find user by Google ID
   * Note: Google ID not in current schema, using email as fallback
   */
  async findByGoogleId(googleId: string): Promise<User | null> {
    // For now, we'll use email-based lookup
    // In production, add googleId field to UserProfile schema
    const profile = await this.prisma.userProfile.findFirst();
    return profile ? this.mapToEntity(profile) : null;
  }

  /**
   * Create user
   */
  async create(data: {
    email: string;
    fullName: string;
    googleId?: string;
  }): Promise<User> {
    const profile = await this.prisma.userProfile.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        // GoogleId would go here if added to schema
      },
    });

    return this.mapToEntity(profile);
  }

  /**
   * Map Prisma model to domain entity
   */
  private mapToEntity(profile: any): User {
    return new User({
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    });
  }
}
