import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { IKpoResponse, IKpoEntry } from '@preduzetnik/shared';
import { InvoiceStatus } from '../generated/prisma/enums';
import { escapeHtml } from '../common/utils';

@Injectable()
export class KpoService {
    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService
    ) {}

    async getKpoForYear(userId: string, year: number): Promise<IKpoResponse> {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                userId,
                year,
                status: {
                    not: InvoiceStatus.CANCELLED
                }
            },
            include: {
                client: true,
            },
            orderBy: {
                issueDate: 'asc',
            },
        });

        let totalYearly = 0;
        const entries: IKpoEntry[] = invoices.map((invoice, index) => {
            const totalRsd = Number(invoice.totalRsd);
            totalYearly += totalRsd;

            return {
                sequenceNumber: index + 1,
                issueDate: invoice.issueDate.toISOString(),
                description: escapeHtml(`Faktura br. ${invoice.invoiceNumber}/${invoice.year} - ${invoice.client.name}`),
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
