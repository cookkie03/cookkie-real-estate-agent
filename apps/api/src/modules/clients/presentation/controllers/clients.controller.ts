/**
 * Clients Controller (Presentation Layer)
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
import { ClientsService } from '../../application/services/clients.service';

@ApiTags('clients')
@Controller('clients')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all clients with filters' })
  async findAll(@Query() filters: any) {
    return this.clientsService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client by ID' })
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create new client' })
  async create(@Body() createDto: any) {
    return this.clientsService.create(createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update client' })
  async update(@Param('id') id: string, @Body() updateDto: any) {
    return this.clientsService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete client' })
  async remove(@Param('id') id: string) {
    await this.clientsService.remove(id);
    return { message: 'Client deleted successfully' };
  }
}
