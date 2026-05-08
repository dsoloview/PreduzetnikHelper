import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PdfService } from '../pdf/pdf.service';
import { IKpoResponse, IKpoEntry } from '@preduzetnik/shared';

@Injectable()
export class KpoService {
    constructor(
        private prisma: PrismaService,
        private pdfService: PdfService
    ) {}

    async getKpoForYear(userId: string, year: number): Promise<IKpoResponse> {
        // Fetch all non-CANCELLED invoices for the given year, ordered by issueDate ASC
        const invoices = await this.prisma.invoice.findMany({
            where: {
                userId,
                year,
                status: {
                    not: 'CANCELLED' // We don't include cancelled invoices in KPO
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
                description: `Faktura br. ${invoice.invoiceNumber}/${invoice.year} - ${invoice.client.name}`,
                productAmount: 0, // Assume 0 for services
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
        
        // We also need user details for the PDF header
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        const pdfData = {
            ...kpoData,
            user,
        };

        return this.pdfService.generateKpoPdf(pdfData);
    }
}
