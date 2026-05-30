import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ILimitsResponse, ILimitStatus } from '@preduzetnik/shared';
import { InvoiceStatus } from '../generated/prisma/enums';

@Injectable()
export class LimitsService {
    private readonly PAUSAL_LIMIT = 6000000;
    private readonly VAT_LIMIT = 8000000;

    constructor(private prisma: PrismaService) {}

    async getLimits(userId: string): Promise<ILimitsResponse> {
        const today = new Date();
        const currentYear = today.getFullYear();

        const date365DaysAgo = new Date(today);
        date365DaysAgo.setDate(today.getDate() - 365);

        const pausalInvoices = await this.prisma.invoice.findMany({
            where: {
                userId,
                year: currentYear,
                status: {
                    not: InvoiceStatus.CANCELLED
                }
            },
            select: {
                totalRsd: true
            }
        });

        const pausalCurrent = pausalInvoices.reduce((sum, inv) => sum + Number(inv.totalRsd), 0);

        const vatInvoices = await this.prisma.invoice.findMany({
            where: {
                userId,
                issueDate: {
                    gte: date365DaysAgo
                },
                domesticSupply: true,
                status: {
                    not: InvoiceStatus.CANCELLED
                }
            },
            select: {
                totalRsd: true
            }
        });

        const vatCurrent = vatInvoices.reduce((sum, inv) => sum + Number(inv.totalRsd), 0);

        return {
            pausalLimit: this.calculateStatus(this.PAUSAL_LIMIT, pausalCurrent),
            vatLimit: this.calculateStatus(this.VAT_LIMIT, vatCurrent),
        };
    }

    private calculateStatus(limit: number, current: number): ILimitStatus {
        const remaining = Math.max(0, limit - current);
        const percentage = Number(((current / limit) * 100).toFixed(2));
        const isExceeded = current > limit;

        return {
            limit,
            current,
            remaining,
            percentage,
            isExceeded
        };
    }
}
