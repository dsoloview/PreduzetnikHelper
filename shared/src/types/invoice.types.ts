import { Currency, InvoiceStatus } from './enums';

// --- Invoice Item ---

export interface IInvoiceItemResponse {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface ICreateInvoiceItemRequest {
  description: string;
  quantity: number;
  unitPrice: number;
}

// --- Invoice ---

export interface IInvoiceResponse {
  id: string;
  invoiceNumber: number;
  year: number;
  displayNumber: string; // "1/2026" — computed on backend
  status: InvoiceStatus;

  clientId: string;
  clientName: string;

  issueDate: string;
  dueDate: string;
  placeOfIssue: string;
  domesticSupply: boolean;

  currency: Currency;
  exchangeRate: number | null;
  totalAmount: number;
  totalRsd: number;

  note: string | null;
  bankAccountId: string;

  items: IInvoiceItemResponse[];
  createdAt: Date;
}

export interface ICreateInvoiceRequest {
  clientId: string;
  bankAccountId: string;

  issueDate: string;    // ISO date string
  dueDate: string;      // ISO date string
  placeOfIssue?: string;
  domesticSupply?: boolean; // auto-filled from client type if omitted

  currency?: Currency;
  exchangeRate?: number;  // required if currency !== RSD

  note?: string;
  items: ICreateInvoiceItemRequest[];
}

export interface IUpdateInvoiceRequest {
  clientId?: string;
  bankAccountId?: string;
  status?: InvoiceStatus;
  issueDate?: string;
  dueDate?: string;
  placeOfIssue?: string;
  domesticSupply?: boolean;
  note?: string;
  currency?: Currency;
  exchangeRate?: number;
  items?: ICreateInvoiceItemRequest[];
}
