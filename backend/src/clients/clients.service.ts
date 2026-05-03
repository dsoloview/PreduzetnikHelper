import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateClientDto) {
        return this.prisma.client.create({
            data: {
                ...dto,
                userId,
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.client.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: string, userId: string) {
        const client = await this.prisma.client.findUnique({ where: { id } });

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        if (client.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return client;
    }

    async update(id: string, userId: string, dto: UpdateClientDto) {
        await this.findOne(id, userId);

        return this.prisma.client.update({
            where: { id },
            data: dto,
        });
    }

    async remove(id: string, userId: string) {
        await this.findOne(id, userId);

        return this.prisma.client.delete({ where: { id } });
    }
}
