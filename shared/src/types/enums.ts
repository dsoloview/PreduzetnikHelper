export type ClientType = 'DOMESTIC' | 'INTERNATIONAL';
export const CLIENT_TYPES: readonly ClientType[] = ['DOMESTIC', 'INTERNATIONAL'];

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';
export const INVOICE_STATUSES: readonly InvoiceStatus[] = ['DRAFT', 'SENT', 'PAID', 'CANCELLED'];

export type Currency = 'RSD' | 'EUR' | 'USD';
export const CURRENCIES: readonly Currency[] = ['RSD', 'EUR', 'USD'];
