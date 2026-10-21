import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { ITaxCalendarResponse, ITaxObligation } from '@preduzetnik/shared';
import { PrismaService } from '../prisma/prisma.service';
import type { TaxObligation } from '../generated/prisma/client';
import {
  normalizeAccountNumber,
  tryBuildIpsQr,
} from '../common/payments/ips-qr';
import { CreateTaxObligationDto } from './dto/create-tax-obligation.dto';
import { UpdateTaxObligationDto } from './dto/update-tax-obligation.dto';
import { MarkTaxPaidDto } from './dto/mark-tax-paid.dto';
import {
  isActiveInMonth,
  monthIndex,
  periodLabel,
  taxDueDate,
} from './tax-calendar';

@Injectable()
export class TaxesService {
  constructor(private readonly prisma: PrismaService) {}

  async listObligations(userId: string): Promise<ITaxObligation[]> {
    const obligations = await this.prisma.taxObligation.findMany({
      where: { userId },
      orderBy: [
        { startYear: 'asc' },
        { startMonth: 'asc' },
        { createdAt: 'asc' },
      ],
    });
    return obligations.map(toObligationDto);
  }

  async createObligation(
    userId: string,
    dto: CreateTaxObligationDto,
  ): Promise<ITaxObligation> {
    validateObligation(dto);
    const created = await this.prisma.taxObligation.create({
      data: { ...dto, userId },
    });
    return toObligationDto(created);
  }

  async updateObligation(
    userId: string,
    id: string,
    dto: UpdateTaxObligationDto,
  ): Promise<ITaxObligation> {
    const existing = await this.findOwnedObligation(userId, id);
    validateObligation({ ...toObligationDto(existing), ...dto });
    const updated = await this.prisma.taxObligation.update({
      where: { id },
      data: dto,
    });
    return toObligationDto(updated);
  }

  /** Only obligations without recorded payments can be deleted; otherwise end them with endYear/endMonth */
  async removeObligation(userId: string, id: string): Promise<void> {
    await this.findOwnedObligation(userId, id);
    const payments = await this.prisma.taxPayment.count({
      where: { obligationId: id },
    });
    if (payments > 0) {
      throw new ConflictException(
        'This obligation has recorded payments. Set the month it ends instead of deleting it.',
      );
    }
    await this.prisma.taxObligation.delete({ where: { id } });
  }

  async getCalendar(
    userId: string,
    year: number,
  ): Promise<ITaxCalendarResponse> {
    const [obligations, payments, user] = await Promise.all([
      this.prisma.taxObligation.findMany({
        where: { userId },
        orderBy: [
          { startYear: 'asc' },
          { startMonth: 'asc' },
          { createdAt: 'asc' },
        ],
      }),
      this.prisma.taxPayment.findMany({ where: { userId, year } }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, companyName: true, city: true },
      }),
    ]);

    const paymentFor = new Map(
      payments.map((p) => [`${p.obligationId}:${p.month}`, p]),
    );
    const payerName = user
      ? [user.companyName ?? user.name, user.city].filter(Boolean).join(', ')
      : null;

    const months = Array.from({ length: 12 }, (_, i) => i + 1)
      .map((month) => {
        const items = obligations
          .filter((o) => isActiveInMonth(o, year, month))
          .map((o) => {
            const payment = paymentFor.get(`${o.id}:${month}`);
            const amount = Number(payment?.amount ?? o.amount);
            const purpose = `${o.purpose || o.name} ${periodLabel(year, month)}`;
            return {
              obligationId: o.id,
              name: o.name,
              amount,
              payment: payment
                ? { id: payment.id, paidAt: payment.paidAt.toISOString() }
                : null,
              ipsQr: tryBuildIpsQr({
                recipientAccount: o.recipientAccount,
                recipientName: o.recipientName,
                amount,
                payerName,
                paymentCode: o.paymentCode,
                purpose,
                model: o.model,
                reference: o.reference,
              }),
              recipientName: o.recipientName,
              recipientAccount: o.recipientAccount,
              paymentCode: o.paymentCode,
              model: o.model,
              reference: o.reference,
              purpose,
            };
          });
        return { year, month, dueDate: taxDueDate(year, month), items };
      })
      .filter((m) => m.items.length > 0);

    return { year, months };
  }

  async markPaid(userId: string, dto: MarkTaxPaidDto) {
    const obligation = await this.findOwnedObligation(userId, dto.obligationId);
    if (!isActiveInMonth(obligation, dto.year, dto.month)) {
      throw new BadRequestException(
        'The obligation does not apply to this month',
      );
    }
    const paidAt = new Date(dto.paidAt);
    const key = {
      obligationId_year_month: {
        obligationId: obligation.id,
        year: dto.year,
        month: dto.month,
      },
    };
    const payment = await this.prisma.taxPayment.upsert({
      where: key,
      // Re-marking only corrects the date; the amount stays as it was when first paid
      update: { paidAt },
      create: {
        userId,
        obligationId: obligation.id,
        year: dto.year,
        month: dto.month,
        amount: obligation.amount,
        paidAt,
      },
    });
    return {
      id: payment.id,
      obligationId: payment.obligationId,
      year: payment.year,
      month: payment.month,
      amount: Number(payment.amount),
      paidAt: payment.paidAt.toISOString(),
    };
  }

  async unmarkPaid(userId: string, paymentId: string): Promise<void> {
    const payment = await this.prisma.taxPayment.findFirst({
      where: { id: paymentId, userId },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    await this.prisma.taxPayment.delete({ where: { id: paymentId } });
  }

  private async findOwnedObligation(
    userId: string,
    id: string,
  ): Promise<TaxObligation> {
    const obligation = await this.prisma.taxObligation.findFirst({
      where: { id, userId },
    });
    if (!obligation) throw new NotFoundException('Tax obligation not found');
    return obligation;
  }
}

const toObligationDto = (o: TaxObligation): ITaxObligation => ({
  id: o.id,
  name: o.name,
  amount: Number(o.amount),
  recipientName: o.recipientName,
  recipientAccount: o.recipientAccount,
  paymentCode: o.paymentCode,
  model: o.model,
  reference: o.reference,
  purpose: o.purpose,
  startYear: o.startYear,
  startMonth: o.startMonth,
  endYear: o.endYear,
  endMonth: o.endMonth,
});

/** Checks that span fields: the account check digits, a model-97 reference and the month range */
const validateObligation = (o: {
  recipientAccount: string;
  model?: string;
  reference: string;
  startYear: number;
  startMonth: number;
  endYear?: number | null;
  endMonth?: number | null;
}) => {
  if (!normalizeAccountNumber(o.recipientAccount)) {
    throw new BadRequestException(
      'recipientAccount is not a valid Serbian account number (check the digits against the decision)',
    );
  }
  if ((o.model ?? '97') === '97' && !/^\d+$/.test(o.reference)) {
    throw new BadRequestException(
      'A model 97 reference must contain digits only',
    );
  }
  const hasEndYear = o.endYear !== null && o.endYear !== undefined;
  const hasEndMonth = o.endMonth !== null && o.endMonth !== undefined;
  if (hasEndYear !== hasEndMonth) {
    throw new BadRequestException('Set both endYear and endMonth, or neither');
  }
  if (
    hasEndYear &&
    monthIndex(o.endYear!, o.endMonth!) < monthIndex(o.startYear, o.startMonth)
  ) {
    throw new BadRequestException('The end month is before the start month');
  }
};
