import { Injectable, Logger } from '@nestjs/common';
import { Currency } from '../generated/prisma/enums';
import type {
  ExchangeRateQuote,
  IExchangeRateProvider,
} from './exchange-rate-provider.interface';

interface KursResenjeRate {
  code: string;
  date: string; // date of the NBS rate list, YYYY-MM-DD
  parity: number; // units the rate is quoted for, e.g. 100 for JPY
  exchange_middle: number; // NBS middle rate (srednji kurs)
}

/**
 * NBS middle rates via kurs.resenje.org, a free public mirror of the NBS rate lists (no registration).
 * API: GET https://kurs.resenje.org/api/v1/currencies/{code}/rates/{YYYY-MM-DD}
 */
@Injectable()
export class KursResenjeClient implements IExchangeRateProvider {
  private readonly logger = new Logger(KursResenjeClient.name);

  private static readonly BASE_URL = 'https://kurs.resenje.org/api/v1';
  private static readonly SUPPORTED_CURRENCIES: string[] = [
    Currency.EUR,
    Currency.USD,
  ];
  private static readonly TIMEOUT_MS = 10_000;

  /** Middle rates of the supported currencies for a date; empty when no rate list exists for it (e.g. a weekend) */
  async fetchRatesForDate(date: Date): Promise<ExchangeRateQuote[]> {
    const day = this.formatDate(date);
    this.logger.log(`Fetching exchange rates for ${day}`);

    const quotes = await Promise.all(
      KursResenjeClient.SUPPORTED_CURRENCIES.map((code) =>
        this.fetchRate(code, day),
      ),
    );
    return quotes.filter((q): q is ExchangeRateQuote => q !== null);
  }

  private async fetchRate(
    currencyCode: string,
    day: string,
  ): Promise<ExchangeRateQuote | null> {
    const url = `${KursResenjeClient.BASE_URL}/currencies/${currencyCode.toLowerCase()}/rates/${day}`;
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(KursResenjeClient.TIMEOUT_MS),
    });

    if (response.status === 404) {
      this.logger.warn(
        `No ${currencyCode} rate for ${day}, probably a weekend or holiday`,
      );
      return null;
    }
    const body = await response.text();
    if (!response.ok) {
      this.logger.error(
        `kurs.resenje.org returned HTTP ${response.status} for ${url}: ${body.substring(0, 1000)}`,
      );
      throw new Error(`Exchange rate API error: HTTP ${response.status}`);
    }

    let rate: Partial<KursResenjeRate>;
    try {
      rate = JSON.parse(body) as Partial<KursResenjeRate>;
    } catch {
      this.logger.error(`Invalid JSON from ${url}: ${body.substring(0, 1000)}`);
      throw new Error('Exchange rate API returned invalid JSON');
    }

    const middle = Number(rate.exchange_middle);
    const parity = Number(rate.parity ?? 1) || 1;
    if (!Number.isFinite(middle) || middle <= 0) {
      this.logger.error(
        `No exchange_middle in response from ${url}: ${body.substring(0, 1000)}`,
      );
      throw new Error(
        `Exchange rate API response without a middle rate for ${currencyCode}`,
      );
    }

    if (rate.date && rate.date !== day) {
      this.logger.log(
        `${currencyCode} rate for ${day} comes from the ${rate.date} list`,
      );
    }
    return { currencyCode, middleRate: Number((middle / parity).toFixed(4)) };
  }

  /** YYYY-MM-DD of the date in Belgrade time */
  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Belgrade',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
