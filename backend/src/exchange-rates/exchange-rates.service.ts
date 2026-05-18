import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NbsClient } from './nbs.client';
import type { IExchangeRatesResponse } from '@preduzetnik/shared';

@Injectable()
export class ExchangeRatesService {
    private readonly logger = new Logger(ExchangeRatesService.name);

    constructor(
        private prisma: PrismaService,
        private nbsClient: NbsClient,
    ) {}

    /**
     * Get exchange rates for a given date.
     * Strategy: DB cache → fetch from NBS → fallback to latest available.
     */
    async getRatesForDate(date: Date): Promise<IExchangeRatesResponse> {
        const dateOnly = this.stripTime(date);

        // 1. Check DB cache
        let rates = await this.prisma.exchangeRate.findMany({
            where: { date: dateOnly },
        });

        // 2. Not cached → fetch from NBS and save
        if (rates.length === 0) {
            this.logger.log(`No cached rates for ${dateOnly.toISOString().split('T')[0]}, fetching from NBS`);
            rates = await this.fetchAndSave(dateOnly);
        }

        // 3. Still empty (weekend/holiday, NBS returned nothing) → fallback to latest before this date
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

    /**
     * Fetch rates from NBS and upsert into DB.
     * Uses upsert to handle concurrent lazy-fetch requests gracefully.
     */
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

    /**
     * Fallback: get the most recent rate before the given date for each currency.
     * Handles weekends and holidays (NBS doesn't publish rates on non-business days).
     */
    private async getLatestBefore(date: Date) {
        // Get latest EUR rate
        const latestEur = await this.prisma.exchangeRate.findFirst({
            where: { currencyCode: 'EUR', date: { lte: date } },
            orderBy: { date: 'desc' },
        });

        // Get latest USD rate
        const latestUsd = await this.prisma.exchangeRate.findFirst({
            where: { currencyCode: 'USD', date: { lte: date } },
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
