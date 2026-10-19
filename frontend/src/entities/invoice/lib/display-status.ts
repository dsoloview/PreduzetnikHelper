import { differenceInCalendarDays, startOfDay } from "date-fns";
import type { IInvoiceResponse, InvoiceStatus } from "@preduzetnik/shared";

/** What the user sees: the stored status, plus OVERDUE for sent invoices past their due date */
export type InvoiceDisplayStatus = InvoiceStatus | "OVERDUE";

export const DISPLAY_STATUSES: readonly InvoiceDisplayStatus[] = ["DRAFT", "SENT", "OVERDUE", "PAID", "CANCELLED"];

/** Days past the due date for an unpaid sent invoice; 0 when it is not overdue */
export const getDaysOverdue = (invoice: Pick<IInvoiceResponse, "status" | "dueDate">, today = new Date()): number => {
  if (invoice.status !== "SENT") return 0;
  return Math.max(0, differenceInCalendarDays(startOfDay(today), startOfDay(new Date(invoice.dueDate))));
};

export const getDisplayStatus = (invoice: Pick<IInvoiceResponse, "status" | "dueDate">, today = new Date()): InvoiceDisplayStatus =>
  getDaysOverdue(invoice, today) > 0 ? "OVERDUE" : invoice.status;
