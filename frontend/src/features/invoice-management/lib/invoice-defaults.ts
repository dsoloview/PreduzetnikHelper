import { addDays, differenceInCalendarDays, parseISO } from "date-fns";
import type { Currency, IBankAccount, IClient, IInvoiceResponse } from "@preduzetnik/shared";

export interface InvoiceItemValues {
  description: string;
  quantity: number;
  unitPrice: number;
}

export const paymentTermDays = (invoice: Pick<IInvoiceResponse, "issueDate" | "dueDate">): number =>
  Math.max(0, differenceInCalendarDays(parseISO(invoice.dueDate), parseISO(invoice.issueDate)));

export const lastInvoiceForClient = (
  invoices: IInvoiceResponse[],
  clientId: string,
): IInvoiceResponse | undefined =>
  invoices
    .filter((invoice) => invoice.clientId === clientId && invoice.status !== "CANCELLED")
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate) || b.year - a.year || b.invoiceNumber - a.invoiceNumber)[0];

export const pickBankAccount = (
  accounts: IBankAccount[],
  client: Pick<IClient, "type">,
  lastInvoice?: Pick<IInvoiceResponse, "bankAccountId">,
): IBankAccount | undefined => {
  const previous = accounts.find((account) => account.id === lastInvoice?.bankAccountId);
  if (previous) return previous;
  const matching = accounts.filter((account) =>
    client.type === "INTERNATIONAL" ? account.currency !== "RSD" : account.currency === "RSD",
  );
  return (
    matching.find((account) => account.isDefault) ??
    matching[0] ??
    accounts.find((account) => account.isDefault) ??
    accounts[0]
  );
};

export const copyItems = (invoice: Pick<IInvoiceResponse, "items">): InvoiceItemValues[] =>
  invoice.items.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice }));

export const itemsAreBlank = (items: Partial<InvoiceItemValues>[] | undefined): boolean =>
  !items?.some((item) => item.description?.trim() || (item.unitPrice ?? 0) > 0);

export const repeatInvoice = (invoice: IInvoiceResponse, today: Date) => ({
  clientId: invoice.clientId,
  bankAccountId: invoice.bankAccountId,
  currency: invoice.currency,
  placeOfIssue: invoice.placeOfIssue,
  domesticSupply: invoice.domesticSupply,
  issueDate: today,
  dueDate: addDays(today, paymentTermDays(invoice)),
  items: copyItems(invoice),
  note: invoice.note ?? "",
});

export interface ItemSuggestion {
  description: string;
  unitPrice: number;
}

export const itemSuggestions = (invoices: IInvoiceResponse[], currency: Currency, limit = 50): ItemSuggestion[] => {
  const seen = new Map<string, ItemSuggestion>();
  const newestFirst = invoices
    .filter((invoice) => invoice.currency === currency && invoice.status !== "CANCELLED")
    .sort((a, b) => b.issueDate.localeCompare(a.issueDate));
  for (const invoice of newestFirst) {
    for (const item of invoice.items) {
      const description = item.description.trim();
      if (description && !seen.has(description)) seen.set(description, { description, unitPrice: item.unitPrice });
    }
  }
  return [...seen.values()].slice(0, limit);
};

export interface ClientDefaults {
  domesticSupply: boolean;
  bankAccountId?: string;
  currency?: Currency;
  dueDate?: Date;
  items?: InvoiceItemValues[];
  prefilledFrom: string | null;
}

export const defaultsForClient = (
  client: Pick<IClient, "id" | "type">,
  invoices: IInvoiceResponse[],
  accounts: IBankAccount[],
  issueDate: Date,
  currentItems: Partial<InvoiceItemValues>[] | undefined,
): ClientDefaults => {
  const last = lastInvoiceForClient(invoices, client.id);
  const account = pickBankAccount(accounts, client, last);
  const items = last && itemsAreBlank(currentItems) ? copyItems(last) : undefined;
  return {
    domesticSupply: client.type === "DOMESTIC",
    bankAccountId: account?.id,
    currency: account?.currency,
    dueDate: last ? addDays(issueDate, paymentTermDays(last)) : undefined,
    items,
    prefilledFrom: items && last ? last.displayNumber : null,
  };
};
