import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BankAccountsService {
    constructor(private prisma: PrismaService) {}

    async findOne(id: string, userId: string) {
        const account = await this.prisma.bankAccount.findUnique({ where: { id } });

        if (!account) {
            throw new NotFoundException('Bank account not found');
        }

        if (account.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return account;
    }
}
