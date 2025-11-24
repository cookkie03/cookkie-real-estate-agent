/**
 * Property Repository (Infrastructure)
 *
 * Handles property data persistence.
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { Property } from '../../domain/entities/property.entity';

@Injectable()
export class PropertyRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: any) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.contractType) where.contractType = filters.contractType;
    if (filters.city) where.city = filters.city;

    const properties = await this.prisma.property.findMany({
      where,
      take: filters.limit || 20,
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' },
    });

    return {
      data: properties.map(this.mapToEntity),
      total: await this.prisma.property.count({ where }),
    };
  }

  async findById(id: string): Promise<Property | null> {
    const property = await this.prisma.property.findUnique({ where: { id } });
    return property ? this.mapToEntity(property) : null;
  }

  async create(data: any): Promise<Property> {
    const property = await this.prisma.property.create({ data });
    return this.mapToEntity(property);
  }

  async update(id: string, data: any): Promise<Property> {
    const property = await this.prisma.property.update({ where: { id }, data });
    return this.mapToEntity(property);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.property.delete({ where: { id } });
  }

  async findInBoundingBox(bounds: any) {
    const properties = await this.prisma.property.findMany({
      where: {
        latitude: { gte: bounds.southWest.lat, lte: bounds.northEast.lat },
        longitude: { gte: bounds.southWest.lng, lte: bounds.northEast.lng },
      },
    });

    return properties.map(this.mapToEntity);
  }

  private mapToEntity(data: any): Property {
    return new Property(data);
  }
}
