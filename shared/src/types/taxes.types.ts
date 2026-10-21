export interface ITaxObligation {
  id: string;
  name: string;
  /** Monthly amount in RSD */
  amount: number;
  recipientName: string;
  recipientAccount: string;
  paymentCode: string;
  model: string;
  reference: string;
  purpose: string | null;
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
}

export interface ICreateTaxObligationRequest {
  name: string;
  amount: number;
  recipientName: string;
  recipientAccount: string;
  paymentCode?: string;
  model?: string;
  reference: string;
  purpose?: string | null;
  startYear: number;
  startMonth: number;
  endYear?: number | null;
  endMonth?: number | null;
}

export type IUpdateTaxObligationRequest = Partial<ICreateTaxObligationRequest>;

// --- Calendar ---

export interface ITaxCalendarItem {
  obligationId: string;
  name: string;
  amount: number;
  payment: { id: string; paidAt: string } | null;
  ipsQr: string | null;
  recipientName: string;
  recipientAccount: string;
  paymentCode: string;
  model: string;
  reference: string;
  purpose: string;
}

export interface ITaxCalendarMonth {
  year: number;
  /** 1–12: the month the taxes are for */
  month: number;
  /** YYYY-MM-DD: the 15th of the next month, moved to Monday when it falls on a weekend */
  dueDate: string;
  items: ITaxCalendarItem[];
}

export interface ITaxCalendarResponse {
  year: number;
  months: ITaxCalendarMonth[];
}

export interface IMarkTaxPaidRequest {
  obligationId: string;
  year: number;
  month: number;
  /** YYYY-MM-DD */
  paidAt: string;
}
