import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import { ClientsService } from '../clients/clients.service';
import { BankAccountsService } from '../bank-accounts/bank-accounts.service';
import { PdfService } from '../pdf/pdf.service';
import { InvoiceStatus, Currency, ClientType } from '../generated/prisma/enums';
import { Prisma } from '../generated/prisma/client';
import { calculateInvoiceTotals } from './invoice-totals';
import { getBelgradeYear } from '../common/utils';

// Fields that may change on a non-DRAFT invoice
const STATUS_FIELDS = ['status', 'paidAt'];

@Injectable()
export class InvoicesService {
  constructor(
    private prisma: PrismaService,
    private clientsService: ClientsService,
    private bankAccountsService: BankAccountsService,
    private pdfService: PdfService,
  ) {}

  async create(
    userId: string,
    dto: CreateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
    const client = await this.clientsService.findOne(dto.clientId, userId);
    // Ownership check only: throws if the account belongs to someone else
    await this.bankAccountsService.findOne(dto.bankAccountId, userId);

    const issueDate = new Date(dto.issueDate);
    const year = getBelgradeYear(issueDate);

    const domesticSupply =
      dto.domesticSupply ?? client.type === ClientType.DOMESTIC;

    const currency = dto.currency ?? Currency.RSD;
    if (currency !== Currency.RSD && !dto.exchangeRate) {
      throw new BadRequestException(
        'Exchange rate is required for foreign currencies',
      );
    }

    const totals = calculateInvoiceTotals(
      dto.items,
      currency,
      dto.exchangeRate,
    );

    const invoice = await this.prisma.$transaction(async (tx) => {
      // Number assignment is read-then-write: serialize it per user and year with a transaction-scoped
      // advisory lock, so concurrent creations queue up instead of failing. Other users are not blocked.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}), ${year})`;

      const lastInvoice = await tx.invoice.findFirst({
        where: { userId, year },
        orderBy: { invoiceNumber: 'desc' },
      });
      const invoiceNumber = (lastInvoice?.invoiceNumber ?? 0) + 1;

      return tx.invoice.create({
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
          currency,
          exchangeRate: currency === Currency.RSD ? null : dto.exchangeRate,
          totalAmount: totals.totalAmount,
          totalRsd: totals.totalRsd,
          note: dto.note,
          items: {
            create: totals.items,
          },
        },
        include: {
          client: true,
          items: true,
        },
      });
    });

    return this.mapToResponseDto(invoice);
  }

  async findAll(
    userId: string,
    filters: { year?: number; status?: string; clientId?: string },
  ): Promise<InvoiceResponseDto[]> {
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
      orderBy: [{ year: 'desc' }, { invoiceNumber: 'desc' }],
    });

    return invoices.map((inv) => this.mapToResponseDto(inv));
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

  async update(
    id: string,
    userId: string,
    dto: UpdateInvoiceDto,
  ): Promise<InvoiceResponseDto> {
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

    if (
      dto.issueDate &&
      getBelgradeYear(new Date(dto.issueDate)) !== existing.year
    ) {
      throw new BadRequestException('Cannot move invoice to another year');
    }

    const definedKeys = Object.entries(dto)
      .filter(([, v]) => v !== undefined)
      .map(([k]) => k);
    const isOnlyStatusUpdate = definedKeys.every((k) =>
      STATUS_FIELDS.includes(k),
    );
    if (existing.status !== InvoiceStatus.DRAFT && !isOnlyStatusUpdate) {
      throw new BadRequestException('Only DRAFT invoices can be edited');
    }

    const nextStatus = dto.status ?? existing.status;
    if (dto.paidAt && nextStatus !== InvoiceStatus.PAID) {
      throw new BadRequestException('paidAt can only be set on PAID invoices');
    }
    const paidAt =
      nextStatus === InvoiceStatus.PAID
        ? dto.paidAt
          ? new Date(dto.paidAt)
          : (existing.paidAt ?? new Date())
        : null;

    if (dto.clientId) {
      await this.clientsService.findOne(dto.clientId, userId);
    }
    if (dto.bankAccountId) {
      await this.bankAccountsService.findOne(dto.bankAccountId, userId);
    }

    const currency = dto.currency ?? existing.currency;
    const exchangeRate =
      dto.exchangeRate ??
      (existing.exchangeRate ? Number(existing.exchangeRate) : null);

    // Recalculate whenever anything that affects the amounts changes
    const amountsChanged =
      dto.items !== undefined ||
      dto.currency !== undefined ||
      dto.exchangeRate !== undefined;
    if (amountsChanged && currency !== Currency.RSD && !exchangeRate) {
      throw new BadRequestException(
        'Exchange rate is required for foreign currencies',
      );
    }
    const items =
      dto.items ??
      existing.items.map((item) => ({
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      }));
    const totals = amountsChanged
      ? calculateInvoiceTotals(items, currency, exchangeRate)
      : null;

    const itemsOperation:
      | Prisma.InvoiceItemUpdateManyWithoutInvoiceNestedInput
      | undefined =
      dto.items && totals
        ? { deleteMany: {}, create: totals.items }
        : undefined;

    const updated = await this.prisma.invoice.update({
      where: { id },
      data: {
        clientId: dto.clientId,
        bankAccountId: dto.bankAccountId,
        status: dto.status as InvoiceStatus,
        paidAt,
        issueDate: dto.issueDate ? new Date(dto.issueDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        placeOfIssue: dto.placeOfIssue,
        domesticSupply: dto.domesticSupply,
        note: dto.note,
        currency: dto.currency as Currency,
        exchangeRate: currency === Currency.RSD ? null : exchangeRate,
        totalAmount: totals?.totalAmount,
        totalRsd: totals?.totalRsd,
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
    if (existing.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only DRAFT invoices can be deleted');
    }

    const deleted = await this.prisma.invoice.delete({
      where: { id },
      include: { client: true, items: true },
    });

    return this.mapToResponseDto(deleted);
  }

  async generatePdf(
    id: string,
    userId: string,
  ): Promise<{ buffer: Buffer; displayNumber: string }> {
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

    const mappedDto = this.mapToResponseDto(invoice);
    const pdfData = {
      ...mappedDto,
      user: invoice.user,
      client: invoice.client,
      bankAccount: invoice.bankAccount,
    };

    const buffer = await this.pdfService.generateInvoicePdf(pdfData);
    return { buffer, displayNumber: mappedDto.displayNumber };
  }

  private mapToResponseDto(
    invoice: NonNullable<
      Awaited<
        ReturnType<
          typeof this.prisma.invoice.findFirst<{
            include: { client: true; items: true };
          }>
        >
      >
    >,
  ): InvoiceResponseDto {
    return {
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      year: invoice.year,
      displayNumber: `${invoice.invoiceNumber}/${invoice.year}`,
      status: invoice.status,
      paidAt: invoice.paidAt ? invoice.paidAt.toISOString() : null,
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
      items: invoice.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
      })),
    };
  }
}
