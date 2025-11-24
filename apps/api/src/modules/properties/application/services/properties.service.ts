/**
 * Properties Service (Application Layer)
 *
 * Orchestrates property-related business operations.
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PropertyRepository } from '../../infrastructure/repositories/property.repository';
import { Property } from '../../domain/entities/property.entity';
import { CreatePropertyDto, UpdatePropertyDto, PropertyFiltersDto } from '../../presentation/dto';

@Injectable()
export class PropertiesService {
  constructor(private propertyRepository: PropertyRepository) {}

  /**
   * Find all properties with filters
   */
  async findAll(filters: PropertyFiltersDto) {
    return this.propertyRepository.findAll(filters);
  }

  /**
   * Find property by ID
   */
  async findOne(id: string): Promise<Property> {
    const property = await this.propertyRepository.findById(id);

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    return property;
  }

  /**
   * Create new property
   */
  async create(createDto: CreatePropertyDto): Promise<Property> {
    return this.propertyRepository.create(createDto);
  }

  /**
   * Update property
   */
  async update(id: string, updateDto: UpdatePropertyDto): Promise<Property> {
    const property = await this.findOne(id);
    return this.propertyRepository.update(id, updateDto);
  }

  /**
   * Delete property
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id); // Check exists
    await this.propertyRepository.delete(id);
  }

  /**
   * Find properties within bounding box (for map)
   */
  async findInBoundingBox(bounds: {
    northEast: { lat: number; lng: number };
    southWest: { lat: number; lng: number };
  }) {
    return this.propertyRepository.findInBoundingBox(bounds);
  }
}
