import {
    Injectable, NotFoundException, ForbiddenException, BadRequestException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { ClientsService } from '../clients/clients.service';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { PdfService } from '../pdf/pdf.service';
import { InvoiceStatus, Currency } from '../generated/prisma/enums';

@Injectable()
export class InvoicesService {
    constructor(
        private prisma: PrismaService,
        private clientsService: ClientsService,
        private bankAccountsService: BankAccountsService,
        private pdfService: PdfService
    ) {}

    async create(userId: string, dto: CreateInvoiceDto): Promise<InvoiceResponseDto> {
        // Validate client exists and belongs to user using ClientsService
        // ClientsService.findOne already throws NotFoundException or ForbiddenException
        const client = await this.clientsService.findOne(dto.clientId, userId);

        // Validate bank account exists and belongs to user using BankAccountsService
        // BankAccountsService.findOne already throws NotFoundException or ForbiddenException
        const bankAccount = await this.bankAccountsService.findOne(dto.bankAccountId, userId);

        const issueDate = new Date(dto.issueDate);
        const year = issueDate.getFullYear();

        // Get next invoice number for this user and year
        const lastInvoice = await this.prisma.invoice.findFirst({
            where: { userId, year },
            orderBy: { invoiceNumber: 'desc' },
        });
        const invoiceNumber = (lastInvoice?.invoiceNumber ?? 0) + 1;

        // Determine domestic supply
        const domesticSupply = dto.domesticSupply ?? (client.type === 'DOMESTIC');

        // Validation for exchange rate
        if (dto.currency && dto.currency !== 'RSD' && !dto.exchangeRate) {
            throw new BadRequestException('Exchange rate is required for foreign currencies');
        }
        const exchangeRate = dto.exchangeRate ?? 1; // Default 1 for RSD

        // Calculate totals
        const itemsWithTotals = dto.items.map(item => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: Number(item.quantity) * Number(item.unitPrice),
        }));

        const totalAmount = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
        const totalRsd = dto.currency && dto.currency !== 'RSD' 
            ? totalAmount * exchangeRate 
            : totalAmount;

        // Nested create
        const invoice = await this.prisma.invoice.create({
            data: {
                userId,
                clientId: dto.clientId,
                bankAccountId: dto.bankAccountId,
                invoiceNumber,
                year,
                issueDate,
                dueDate: new Date(dto.dueDate),
                placeOfIssue: dto.placeOfIssue,
                domesticSupply,
                currency: dto.currency || 'RSD',
                exchangeRate: dto.currency === 'RSD' ? null : dto.exchangeRate,
                totalAmount,
                totalRsd,
                note: dto.note,
                items: {
                    create: itemsWithTotals,
                },
            },
            include: {
                client: true,
                items: true,
            },
        });

        return this.mapToResponseDto(invoice);
    }

    async findAll(userId: string, filters: { year?: number; status?: string; clientId?: string }): Promise<InvoiceResponseDto[]> {
        const invoices = await this.prisma.invoice.findMany({
            where: {
                userId,
                ...(filters.year && { year: filters.year }),
                ...(filters.status && { status: filters.status as InvoiceStatus }),
                ...(filters.clientId && { clientId: filters.clientId }),
            },
            include: {
                client: true,
                items: true,
            },
            orderBy: [
                { year: 'desc' },
                { invoiceNumber: 'desc' }
            ],
        });

        return invoices.map(inv => this.mapToResponseDto(inv));
    }

    async findOne(id: string, userId: string): Promise<InvoiceResponseDto> {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: { client: true, items: true },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }
        if (invoice.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        return this.mapToResponseDto(invoice);
    }

    async update(id: string, userId: string, dto: UpdateInvoiceDto): Promise<InvoiceResponseDto> {
        // Fetch existing invoice without mapping to check status
        const existing = await this.prisma.invoice.findUnique({
            where: { id },
            include: { client: true, items: true },
        });

        if (!existing) {
            throw new NotFoundException('Invoice not found');
        }
        if (existing.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        // Only DRAFT invoices can be updated, unless we are just updating the status
        const isOnlyStatusUpdate = Object.keys(dto).length === 1 && dto.status !== undefined;
        if (existing.status !== 'DRAFT' && !isOnlyStatusUpdate) {
            throw new BadRequestException('Only DRAFT invoices can be edited');
        }

        // If items are provided, we need to recalculate totals
        let totalAmount = Number(existing.totalAmount);
        let totalRsd = Number(existing.totalRsd);
        let exchangeRate = Number(existing.exchangeRate) || 1;
        let currency = existing.currency;

        if (dto.currency) currency = dto.currency as Currency;
        if (dto.exchangeRate !== undefined) exchangeRate = dto.exchangeRate;

        // Handle items update
        let itemsOperation: any = undefined;
        if (dto.items) {
            const itemsWithTotals = dto.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: Number(item.quantity) * Number(item.unitPrice),
            }));

            totalAmount = itemsWithTotals.reduce((sum, item) => sum + item.total, 0);
            totalRsd = currency !== 'RSD' ? totalAmount * exchangeRate : totalAmount;

            // Prisma requires deleting old items and creating new ones for a full replacement
            itemsOperation = {
                deleteMany: {},
                create: itemsWithTotals,
            };
        } else if (dto.currency !== undefined || dto.exchangeRate !== undefined) {
            // Recalculate RSD if currency/exchange rate changed but items didn't
            totalRsd = currency !== 'RSD' ? totalAmount * exchangeRate : totalAmount;
        }

        const updated = await this.prisma.invoice.update({
            where: { id },
            data: {
                status: dto.status as InvoiceStatus,
                issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                placeOfIssue: dto.placeOfIssue,
                domesticSupply: dto.domesticSupply,
                note: dto.note,
                currency: dto.currency as Currency,
                exchangeRate: currency === 'RSD' ? null : exchangeRate,
                totalAmount: dto.items || dto.currency || dto.exchangeRate ? totalAmount : undefined,
                totalRsd: dto.items || dto.currency || dto.exchangeRate ? totalRsd : undefined,
                ...(itemsOperation ? { items: itemsOperation } : {}),
            },
            include: {
                client: true,
                items: true,
            },
        });

        return this.mapToResponseDto(updated);
    }

    async remove(id: string, userId: string): Promise<InvoiceResponseDto> {
        const existing = await this.prisma.invoice.findUnique({ where: { id } });

        if (!existing) {
            throw new NotFoundException('Invoice not found');
        }
        if (existing.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }
        if (existing.status !== 'DRAFT') {
            throw new BadRequestException('Only DRAFT invoices can be deleted');
        }

        const deleted = await this.prisma.invoice.delete({
            where: { id },
            include: { client: true, items: true },
        });

        return this.mapToResponseDto(deleted);
    }

    async generatePdf(id: string, userId: string): Promise<Buffer> {
        const invoice = await this.prisma.invoice.findUnique({
            where: { id },
            include: {
                client: true,
                items: true,
                user: { omit: { password: true } },
                bankAccount: true,
            },
        });

        if (!invoice) {
            throw new NotFoundException('Invoice not found');
        }
        if (invoice.userId !== userId) {
            throw new ForbiddenException('Access denied');
        }

        // Format data for handlebars
        const mappedDto = this.mapToResponseDto(invoice);
        const pdfData = {
            ...mappedDto,
            user: invoice.user,
            client: invoice.client,
            bankAccount: invoice.bankAccount,
        };

        return this.pdfService.generateInvoicePdf(pdfData);
    }

    private mapToResponseDto(
        invoice: NonNullable<Awaited<ReturnType<typeof this.prisma.invoice.findFirst<{ include: { client: true; items: true } }>>>>
    ): InvoiceResponseDto {
        return {
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            year: invoice.year,
            displayNumber: `${invoice.invoiceNumber}/${invoice.year}`,
            status: invoice.status,
            clientId: invoice.clientId,
            clientName: invoice.client.name,
            issueDate: invoice.issueDate.toISOString(),
            dueDate: invoice.dueDate.toISOString(),
            placeOfIssue: invoice.placeOfIssue,
            domesticSupply: invoice.domesticSupply,
            currency: invoice.currency,
            exchangeRate: invoice.exchangeRate ? Number(invoice.exchangeRate) : null,
            totalAmount: Number(invoice.totalAmount),
            totalRsd: Number(invoice.totalRsd),
            note: invoice.note,
            bankAccountId: invoice.bankAccountId,
            createdAt: invoice.createdAt,
            items: invoice.items.map(item => ({
                id: item.id,
                description: item.description,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                total: Number(item.total),
            })),
        };
    }
}
