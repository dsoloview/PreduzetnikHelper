export interface IExchangeRate {
  currencyCode: string;
  date: string; // ISO date string (YYYY-MM-DD)
  middleRate: number;
}

export interface IExchangeRatesResponse {
  date: string; // actual rate date (may differ from requested on weekends)
  rates: IExchangeRate[];
}
