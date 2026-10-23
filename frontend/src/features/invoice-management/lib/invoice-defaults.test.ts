import { describe, expect, it } from "vitest";
import type { IBankAccount, IInvoiceResponse } from "@preduzetnik/shared";
import {
  defaultsForClient,
  itemSuggestions,
  itemsAreBlank,
  lastInvoiceForClient,
  paymentTermDays,
  pickBankAccount,
  repeatInvoice,
} from "./invoice-defaults";

const invoice = (overrides: Partial<IInvoiceResponse> = {}): IInvoiceResponse => ({
  id: crypto.randomUUID(),
  invoiceNumber: 1,
  year: 2026,
  displayNumber: "1/2026",
  status: "PAID",
  paidAt: null,
  clientId: "acme",
  clientName: "Acme",
  issueDate: "2026-09-01T00:00:00.000Z",
  dueDate: "2026-09-16T00:00:00.000Z",
  placeOfIssue: "Novi Sad",
  domesticSupply: false,
  currency: "EUR",
  exchangeRate: 117.2,
  totalAmount: 1000,
  totalRsd: 117200,
  note: null,
  bankAccountId: "eur",
  items: [{ id: "i", description: "Development", quantity: 10, unitPrice: 100, total: 1000 }],
  createdAt: new Date(),
  ...overrides,
});

const account = (id: string, currency: IBankAccount["currency"], isDefault = false): IBankAccount => ({
  id,
  bankName: "Bank",
  accountNumber: id,
  currency,
  isDefault,
});

const accounts = [account("rsd", "RSD", true), account("eur", "EUR"), account("usd", "USD")];

describe("paymentTermDays", () => {
  it("counts calendar days between issue and due date", () => {
    expect(paymentTermDays(invoice())).toBe(15);
  });
});

describe("lastInvoiceForClient", () => {
  it("returns the newest invoice of that client, skipping cancelled ones", () => {
    const invoices = [
      invoice({ id: "old", issueDate: "2026-08-01T00:00:00.000Z" }),
      invoice({ id: "new", issueDate: "2026-10-01T00:00:00.000Z" }),
      invoice({ id: "cancelled", issueDate: "2026-10-10T00:00:00.000Z", status: "CANCELLED" }),
      invoice({ id: "other", clientId: "other", issueDate: "2026-10-20T00:00:00.000Z" }),
    ];
    expect(lastInvoiceForClient(invoices, "acme")?.id).toBe("new");
    expect(lastInvoiceForClient(invoices, "nobody")).toBeUndefined();
  });
});

describe("pickBankAccount", () => {
  it("reuses the account from the client's last invoice", () => {
    expect(pickBankAccount(accounts, { type: "INTERNATIONAL" }, { bankAccountId: "usd" })?.id).toBe("usd");
  });

  it("falls back to a foreign account for international clients and a dinar one for domestic", () => {
    expect(pickBankAccount(accounts, { type: "INTERNATIONAL" })?.id).toBe("eur");
    expect(pickBankAccount(accounts, { type: "INTERNATIONAL" }, { bankAccountId: "deleted" })?.id).toBe("eur");
    expect(pickBankAccount(accounts, { type: "DOMESTIC" })?.id).toBe("rsd");
  });

  it("uses the default account when nothing matches the client", () => {
    expect(pickBankAccount([account("rsd", "RSD", true)], { type: "INTERNATIONAL" })?.id).toBe("rsd");
    expect(pickBankAccount([], { type: "DOMESTIC" })).toBeUndefined();
  });
});

describe("itemsAreBlank", () => {
  it("is true only for untouched rows", () => {
    expect(itemsAreBlank([{ description: "", quantity: 1, unitPrice: 0 }])).toBe(true);
    expect(itemsAreBlank([{ description: " ", quantity: 1, unitPrice: 0 }])).toBe(true);
    expect(itemsAreBlank([{ description: "", quantity: 1, unitPrice: 5 }])).toBe(false);
    expect(itemsAreBlank([{ description: "Design", quantity: 1, unitPrice: 0 }])).toBe(false);
  });
});

describe("repeatInvoice", () => {
  it("keeps client, account and items and moves the dates to today with the same term", () => {
    const values = repeatInvoice(invoice({ note: "Hvala" }), new Date(2026, 9, 23));
    expect(values).toMatchObject({
      clientId: "acme",
      bankAccountId: "eur",
      currency: "EUR",
      note: "Hvala",
      items: [{ description: "Development", quantity: 10, unitPrice: 100 }],
    });
    expect(values.issueDate).toEqual(new Date(2026, 9, 23));
    expect(values.dueDate).toEqual(new Date(2026, 10, 7));
  });
});

describe("itemSuggestions", () => {
  it("lists unique descriptions in that currency with the latest price", () => {
    const invoices = [
      invoice({ issueDate: "2026-08-01T00:00:00.000Z", items: [{ id: "a", description: "Development", quantity: 1, unitPrice: 90, total: 90 }] }),
      invoice({ issueDate: "2026-09-01T00:00:00.000Z" }),
      invoice({ currency: "RSD", items: [{ id: "b", description: "Konsalting", quantity: 1, unitPrice: 4500, total: 4500 }] }),
    ];
    expect(itemSuggestions(invoices, "EUR")).toEqual([{ description: "Development", unitPrice: 100 }]);
    expect(itemSuggestions(invoices, "RSD")).toEqual([{ description: "Konsalting", unitPrice: 4500 }]);
  });
});

describe("defaultsForClient", () => {
  const issueDate = new Date(2026, 9, 23);

  it("takes account, term and items from the client's last invoice", () => {
    const last = invoice({ displayNumber: "7/2026", bankAccountId: "usd" });
    expect(defaultsForClient({ id: "acme", type: "INTERNATIONAL" }, [last], accounts, issueDate, [{ description: "" }])).toEqual({
      domesticSupply: false,
      bankAccountId: "usd",
      currency: "USD",
      dueDate: new Date(2026, 10, 7),
      items: [{ description: "Development", quantity: 10, unitPrice: 100 }],
      prefilledFrom: "7/2026",
    });
  });

  it("keeps items the user already typed", () => {
    const result = defaultsForClient({ id: "acme", type: "INTERNATIONAL" }, [invoice()], accounts, issueDate, [
      { description: "Audit", unitPrice: 50 },
    ]);
    expect(result.items).toBeUndefined();
    expect(result.prefilledFrom).toBeNull();
  });

  it("falls back to an account matching a new client", () => {
    expect(defaultsForClient({ id: "new", type: "DOMESTIC" }, [invoice()], accounts, issueDate, undefined)).toEqual({
      domesticSupply: true,
      bankAccountId: "rsd",
      currency: "RSD",
      dueDate: undefined,
      items: undefined,
      prefilledFrom: null,
    });
  });
});
