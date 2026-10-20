import { describe, expect, it } from "vitest";
import type { IInvoiceResponse } from "@preduzetnik/shared";
import { summarizeInvoices } from "./summary";

const today = new Date("2026-10-20T10:00:00");

const invoice = (overrides: Partial<IInvoiceResponse>): IInvoiceResponse => ({
  id: crypto.randomUUID(),
  invoiceNumber: 1,
  year: 2026,
  displayNumber: "1/2026",
  status: "DRAFT",
  paidAt: null,
  clientId: "c1",
  clientName: "Client",
  issueDate: "2026-10-01T00:00:00.000Z",
  dueDate: "2026-10-15T00:00:00.000Z",
  placeOfIssue: "Beograd",
  domesticSupply: true,
  currency: "RSD",
  exchangeRate: null,
  totalAmount: 1000,
  totalRsd: 1000,
  note: null,
  bankAccountId: "b1",
  items: [],
  createdAt: new Date("2026-10-01"),
  ...overrides,
});

describe("summarizeInvoices", () => {
  it("splits invoices into received, expected, overdue and drafts", () => {
    const summary = summarizeInvoices(
      [
        invoice({ status: "PAID", paidAt: "2026-03-10T00:00:00.000Z", totalRsd: 500 }),
        invoice({ status: "PAID", paidAt: "2026-09-01T00:00:00.000Z", totalRsd: 250 }),
        invoice({ status: "SENT", dueDate: "2026-11-01T00:00:00.000Z", totalRsd: 300 }),
        invoice({ status: "SENT", dueDate: "2026-10-01T00:00:00.000Z", totalRsd: 700 }),
        invoice({ status: "DRAFT", totalRsd: 100 }),
        invoice({ status: "CANCELLED", totalRsd: 9999 }),
      ],
      today,
    );

    expect(summary.received).toEqual({ count: 2, totalRsd: 750 });
    expect(summary.expected).toEqual({ count: 1, totalRsd: 300 });
    expect(summary.overdue).toEqual({ count: 1, totalRsd: 700 });
    expect(summary.drafts).toEqual({ count: 1, totalRsd: 100 });
  });

  it("counts income by payment date, so last year's invoice paid this year is included", () => {
    const summary = summarizeInvoices(
      [
        invoice({ status: "PAID", year: 2025, issueDate: "2025-12-20T00:00:00.000Z", paidAt: "2026-01-05T00:00:00.000Z", totalRsd: 400 }),
        invoice({ status: "PAID", paidAt: "2025-12-30T00:00:00.000Z", totalRsd: 999 }),
      ],
      today,
    );

    expect(summary.received).toEqual({ count: 1, totalRsd: 400 });
  });
});
