import { differenceInCalendarDays, parseISO, startOfDay } from "date-fns";
import type { ITaxCalendarMonth } from "@preduzetnik/shared";

export type TaxMonthStatus = "paid" | "overdue" | "dueSoon" | "upcoming";

export const DUE_SOON_DAYS = 10;

export const daysUntilDue = (month: Pick<ITaxCalendarMonth, "dueDate">, today = new Date()): number =>
  differenceInCalendarDays(parseISO(month.dueDate), startOfDay(today));

export const getTaxMonthStatus = (month: ITaxCalendarMonth, today = new Date()): TaxMonthStatus => {
  if (month.items.every((item) => item.payment)) return "paid";
  const days = daysUntilDue(month, today);
  if (days < 0) return "overdue";
  if (days <= DUE_SOON_DAYS) return "dueSoon";
  return "upcoming";
};

export const unpaidAmount = (month: ITaxCalendarMonth): number =>
  month.items.filter((item) => !item.payment).reduce((sum, item) => sum + item.amount, 0);

export const monthsNeedingAttention = (months: ITaxCalendarMonth[], today = new Date()): ITaxCalendarMonth[] =>
  months
    .filter((month) => {
      const status = getTaxMonthStatus(month, today);
      return status === "overdue" || status === "dueSoon";
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
