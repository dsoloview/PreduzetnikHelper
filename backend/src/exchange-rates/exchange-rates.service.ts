import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NbsClient } from './nbs.client';
import type { IExchangeRatesResponse } from '@preduzetnik/shared';
import { Currency } from '../generated/prisma/enums';

@Injectable()
export class ExchangeRatesService {
    private readonly logger = new Logger(ExchangeRatesService.name);

    constructor(
        private prisma: PrismaService,
        private nbsClient: NbsClient,
    ) {}

    async getRatesForDate(date: Date): Promise<IExchangeRatesResponse> {
        const dateOnly = this.stripTime(date);

        let rates = await this.prisma.exchangeRate.findMany({
            where: { date: dateOnly },
        });

        if (rates.length === 0) {
            this.logger.log(`No cached rates for ${dateOnly.toISOString().split('T')[0]}, fetching from NBS`);
            rates = await this.fetchAndSave(dateOnly);
        }

        if (rates.length === 0) {
            this.logger.log(`NBS returned nothing for ${dateOnly.toISOString().split('T')[0]}, falling back to latest`);
            rates = await this.getLatestBefore(dateOnly);
        }

        const actualDate = rates[0]?.date ?? dateOnly;

        return {
            date: actualDate.toISOString().split('T')[0],
            rates: rates.map((r) => ({
                currencyCode: r.currencyCode,
                date: r.date.toISOString().split('T')[0],
                middleRate: Number(r.middleRate),
            })),
        };
    }

    async fetchAndSave(date: Date) {
        try {
            const nbsRates = await this.nbsClient.fetchRatesForDate(date);

            if (nbsRates.length === 0) {
                return [];
            }

            const saved = await Promise.all(
                nbsRates.map((rate) =>
                    this.prisma.exchangeRate.upsert({
                        where: {
                            currencyCode_date: {
                                currencyCode: rate.currencyCode,
                                date,
                            },
                        },
                        update: { middleRate: rate.middleRate },
                        create: {
                            currencyCode: rate.currencyCode,
                            date,
                            middleRate: rate.middleRate,
                        },
                    }),
                ),
            );

            this.logger.log(`Saved ${saved.length} rates for ${date.toISOString().split('T')[0]}`);
            return saved;
        } catch (error) {
            this.logger.error(`Failed to fetch/save rates: ${error}`);
            return [];
        }
    }

    private async getLatestBefore(date: Date) {
        const latestEur = await this.prisma.exchangeRate.findFirst({
            where: { currencyCode: Currency.EUR, date: { lte: date } },
            orderBy: { date: 'desc' },
        });

        const latestUsd = await this.prisma.exchangeRate.findFirst({
            where: { currencyCode: Currency.USD, date: { lte: date } },
            orderBy: { date: 'desc' },
        });

        return [latestEur, latestUsd].filter(
            (r): r is NonNullable<typeof r> => r !== null,
        );
    }

    /** Strip time component, keep only date at UTC midnight */
    private stripTime(date: Date): Date {
        const d = new Date(date);
        d.setUTCHours(0, 0, 0, 0);
        return d;
    }
}
