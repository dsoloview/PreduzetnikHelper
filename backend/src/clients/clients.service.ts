import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponseDto } from './dto/client-response.dto';
import { assertOwnership } from '../common/utils';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateClientDto): Promise<ClientResponseDto> {
        return this.prisma.client.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    async findAll(userId: string): Promise<ClientResponseDto[]> {
        return this.prisma.client.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string): Promise<ClientResponseDto> {
        const client = await this.prisma.client.findUnique({ where: { id } });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        assertOwnership(client, userId, 'client');

        return client;
    }

    async update(id: string, userId: string, dto: UpdateClientDto): Promise<ClientResponseDto> {
        await this.findOne(id, userId);

        return this.prisma.client.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, userId: string): Promise<ClientResponseDto> {
        await this.findOne(id, userId);

        return this.prisma.client.delete({ where: { id } });
    }
}
