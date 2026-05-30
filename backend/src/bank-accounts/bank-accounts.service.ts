import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { BankAccountResponseDto } from './dto/bank-account-response.dto';
import { assertOwnership } from '../common/utils';

@Injectable()
export class BankAccountsService {
    constructor(private prisma: PrismaService) {}

    async create(userId: string, dto: CreateBankAccountDto): Promise<BankAccountResponseDto> {
        return this.prisma.$transaction(async (tx) => {
            if (dto.isDefault) {
                await tx.bankAccount.updateMany({
                    where: { userId },
                    data: { isDefault: false },
                });
            }

            return tx.bankAccount.create({
                data: { ...dto, userId },
            });
        });
    }

    async findAll(userId: string): Promise<BankAccountResponseDto[]> {
        return this.prisma.bankAccount.findMany({
            where: { userId },
            orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        });
    }

    async findOne(id: string, userId: string): Promise<BankAccountResponseDto> {
        const account = await this.prisma.bankAccount.findUnique({ where: { id } });

        if (!account) {
            throw new NotFoundException('Bank account not found');
        }

        assertOwnership(account, userId, 'bank account');

        return account;
    }

    async update(id: string, userId: string, dto: UpdateBankAccountDto): Promise<BankAccountResponseDto> {
        await this.findOne(id, userId);

        return this.prisma.$transaction(async (tx) => {
            if (dto.isDefault) {
                await tx.bankAccount.updateMany({
                    where: { userId, NOT: { id } },
                    data: { isDefault: false },
                });
            }

            return tx.bankAccount.update({
                where: { id },
                data: dto,
            });
        });
    }

    async remove(id: string, userId: string): Promise<BankAccountResponseDto> {
        const account = await this.findOne(id, userId);

        if (account.isDefault) {
            const count = await this.prisma.bankAccount.count({ where: { userId } });
            if (count > 1) {
                throw new BadRequestException(
                    'Cannot delete the default bank account. Set another account as default first.',
                );
            }
        }

        return this.prisma.bankAccount.delete({ where: { id } });
    }
}
