/**
 * Clients Service (Application Layer)
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { ClientRepository } from '../../infrastructure/repositories/client.repository';
import { Client } from '../../domain/entities/client.entity';

@Injectable()
export class ClientsService {
  constructor(private clientRepository: ClientRepository) {}

  async findAll(filters: any) {
    return this.clientRepository.findAll(filters);
  }

  async findOne(id: string): Promise<Client> {
    const client = await this.clientRepository.findById(id);
    if (!client) {
      throw new NotFoundException(`Client with ID ${id} not found`);
    }
    return client;
  }

  async create(createDto: any): Promise<Client> {
    return this.clientRepository.create(createDto);
  }

  async update(id: string, updateDto: any): Promise<Client> {
    await this.findOne(id);
    return this.clientRepository.update(id, updateDto);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.clientRepository.delete(id);
  }
}
