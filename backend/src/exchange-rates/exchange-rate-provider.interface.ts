export interface ExchangeRateQuote {
    currencyCode: string;
    middleRate: number;
}

export interface IExchangeRateProvider {
    fetchRatesForDate(date: Date): Promise<ExchangeRateQuote[]>;
}

export const EXCHANGE_RATE_PROVIDER = Symbol('EXCHANGE_RATE_PROVIDER');