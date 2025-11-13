/**
 * Properties Controller (Presentation Layer)
 *
 * HTTP API endpoints for property management.
 */

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '@core/guards/jwt-auth.guard';
import { PropertiesService } from '../../application/services/properties.service';
import { CreatePropertyDto, UpdatePropertyDto, PropertyFiltersDto } from '../dto';

@ApiTags('properties')
@Controller('properties')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PropertiesController {
  constructor(private propertiesService: PropertiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all properties with filters' })
  async findAll(@Query() filters: PropertyFiltersDto) {
    return this.propertiesService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get property by ID' })
  async findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new property' })
  async create(@Body() createDto: CreatePropertyDto) {
    return this.propertiesService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update property' })
  async update(@Param('id') id: string, @Body() updateDto: UpdatePropertyDto) {
    return this.propertiesService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete property' })
  async remove(@Param('id') id: string) {
    await this.propertiesService.remove(id);
    return { message: 'Property deleted successfully' };
  }

  @Post('map/bounds')
  @ApiOperation({ summary: 'Get properties within map bounds' })
  async findInBounds(@Body() bounds: any) {
    return this.propertiesService.findInBoundingBox(bounds);
  }
}
