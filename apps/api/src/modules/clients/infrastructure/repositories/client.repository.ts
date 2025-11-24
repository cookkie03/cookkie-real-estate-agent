/**
 * Client Repository (Infrastructure)
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '@shared/database/prisma.service';
import { Client } from '../../domain/entities/client.entity';

@Injectable()
export class ClientRepository {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: any) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.city) where.city = filters.city;

    const contacts = await this.prisma.contact.findMany({
      where,
      take: filters.limit || 20,
      skip: ((filters.page || 1) - 1) * (filters.limit || 20),
      orderBy: { [filters.sortBy || 'createdAt']: filters.sortOrder || 'desc' },
    });

    return {
      data: contacts.map(this.mapToEntity),
      total: await this.prisma.contact.count({ where }),
    };
  }

  async findById(id: string): Promise<Client | null> {
    const contact = await this.prisma.contact.findUnique({ where: { id } });
    return contact ? this.mapToEntity(contact) : null;
  }

  async create(data: any): Promise<Client> {
    const contact = await this.prisma.contact.create({ data });
    return this.mapToEntity(contact);
  }

  async update(id: string, data: any): Promise<Client> {
    const contact = await this.prisma.contact.update({ where: { id }, data });
    return this.mapToEntity(contact);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.contact.delete({ where: { id } });
  }

  private mapToEntity(data: any): Client {
    return new Client(data);
  }
}
