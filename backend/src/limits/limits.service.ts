import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ILimitsResponse, ILimitStatus } from '@preduzetnik/shared';
import { InvoiceStatus } from '../generated/prisma/enums';
import { getBelgradeYear, getBelgradeYearRange } from '../common/utils';

@Injectable()
export class LimitsService {
  private readonly PAUSAL_LIMIT = 6000000;
  private readonly VAT_LIMIT = 8000000;
  private readonly ROLLING_WINDOW_DAYS = 365;

  constructor(private prisma: PrismaService) {}

  async getLimits(userId: string): Promise<ILimitsResponse> {
    const today = new Date();
    const currentYear = getBelgradeYear(today);

    const date365DaysAgo = new Date(today);
    date365DaysAgo.setDate(today.getDate() - this.ROLLING_WINDOW_DAYS);

    const { start: yearStart, end: yearEnd } =
      getBelgradeYearRange(currentYear);
    const pausalInvoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        status: InvoiceStatus.PAID,
        paidAt: { gte: yearStart, lt: yearEnd },
      },
      select: {
        totalRsd: true,
      },
    });

    const pausalCurrent = pausalInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalRsd),
      0,
    );

    const vatInvoices = await this.prisma.invoice.findMany({
      where: {
        userId,
        status: InvoiceStatus.PAID,
        paidAt: { gte: date365DaysAgo },
        domesticSupply: true,
      },
      select: {
        totalRsd: true,
      },
    });

    const vatCurrent = vatInvoices.reduce(
      (sum, inv) => sum + Number(inv.totalRsd),
      0,
    );

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
      isExceeded,
    };
  }
}
