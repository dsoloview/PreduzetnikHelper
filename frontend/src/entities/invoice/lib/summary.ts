import type { IInvoiceResponse } from "@preduzetnik/shared";
import { getDaysOverdue } from "./display-status";

export interface InvoiceGroup {
  count: number;
  totalRsd: number;
}

export interface InvoiceSummary {
  /** Paid this calendar year, by payment date: the same income the KPO book and the 6M limit count */
  received: InvoiceGroup;
  /** Sent and not yet due */
  expected: InvoiceGroup;
  /** Sent and past the due date */
  overdue: InvoiceGroup;
  drafts: InvoiceGroup;
}

const add = (group: InvoiceGroup, invoice: IInvoiceResponse) => {
  group.count += 1;
  group.totalRsd += invoice.totalRsd;
};

export const summarizeInvoices = (invoices: IInvoiceResponse[], today = new Date()): InvoiceSummary => {
  const year = today.getFullYear();
  const summary: InvoiceSummary = {
    received: { count: 0, totalRsd: 0 },
    expected: { count: 0, totalRsd: 0 },
    overdue: { count: 0, totalRsd: 0 },
    drafts: { count: 0, totalRsd: 0 },
  };

  for (const invoice of invoices) {
    if (invoice.status === "PAID" && invoice.paidAt && new Date(invoice.paidAt).getFullYear() === year) {
      add(summary.received, invoice);
    } else if (invoice.status === "SENT") {
      add(getDaysOverdue(invoice, today) > 0 ? summary.overdue : summary.expected, invoice);
    } else if (invoice.status === "DRAFT") {
      add(summary.drafts, invoice);
    }
  }
  return summary;
};
