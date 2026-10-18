import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { IKpoResponse, IKpoEntry } from '@preduzetnik/shared';
import { InvoiceStatus } from '../generated/prisma/enums';
import { getBelgradeYearRange } from '../common/utils';

@Injectable()
export class KpoService {
    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService
    ) {}

    async getKpoForYear(userId: string, year: number): Promise<IKpoResponse> {
        // KPO records income on the day it was received, so the year is taken from paidAt, not from the invoice number
        const { start, end } = getBelgradeYearRange(year);
        const invoices = await this.prisma.invoice.findMany({
            where: {
                userId,
                status: InvoiceStatus.PAID,
                paidAt: { gte: start, lt: end },
            },
            include: {
                client: true,
            },
            orderBy: [
                { paidAt: 'asc' },
                { invoiceNumber: 'asc' },
            ],
        });

        let totalYearly = 0;
        const entries: IKpoEntry[] = invoices.map((invoice, index) => {
            const totalRsd = Number(invoice.totalRsd);
            totalYearly += totalRsd;

            return {
                sequenceNumber: index + 1,
                date: invoice.paidAt!.toISOString(),
                description: `Faktura br. ${invoice.invoiceNumber}/${invoice.year} - ${invoice.client.name}`,
                productAmount: 0,
                serviceAmount: totalRsd,
                totalAmount: totalRsd,
            };
        });

        return {
            year,
            entries,
            totalYearly,
        };
    }

    async generateKpoPdf(userId: string, year: number): Promise<Buffer> {
        const kpoData = await this.getKpoForYear(userId, year);

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            omit: { password: true },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const pdfData = {
            ...kpoData,
            user,
        };

        return this.pdfService.generateKpoPdf(pdfData);
    }
}
