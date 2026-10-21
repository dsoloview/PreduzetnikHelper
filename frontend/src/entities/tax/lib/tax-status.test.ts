import { describe, expect, it } from "vitest";
import type { ITaxCalendarMonth } from "@preduzetnik/shared";
import { getTaxMonthStatus, monthsNeedingAttention, unpaidAmount } from "./tax-status";

const today = new Date("2026-10-08T12:00:00");

const item = (amount: number, paid = false) => ({
  obligationId: crypto.randomUUID(),
  name: "Porez",
  amount,
  payment: paid ? { id: crypto.randomUUID(), paidAt: "2026-10-01T00:00:00.000Z" } : null,
  ipsQr: null,
  recipientName: "Poreska uprava",
  recipientAccount: "840-711122843-32",
  paymentCode: "253",
  model: "97",
  reference: "1",
  purpose: "Porez",
});

const month = (m: number, dueDate: string, items = [item(1000)]): ITaxCalendarMonth => ({
  year: 2026,
  month: m,
  dueDate,
  items,
});

describe("getTaxMonthStatus", () => {
  it("is paid when every item is paid, even after the due date", () => {
    expect(getTaxMonthStatus(month(8, "2026-09-15", [item(1, true), item(2, true)]), today)).toBe("paid");
  });

  it("is overdue once the due date has passed", () => {
    expect(getTaxMonthStatus(month(8, "2026-09-15", [item(1, true), item(2)]), today)).toBe("overdue");
  });

  it("is due soon within 10 days, including the due date itself", () => {
    expect(getTaxMonthStatus(month(9, "2026-10-15"), today)).toBe("dueSoon");
    expect(getTaxMonthStatus(month(9, "2026-10-08"), today)).toBe("dueSoon");
  });

  it("is upcoming further out", () => {
    expect(getTaxMonthStatus(month(10, "2026-11-16"), today)).toBe("upcoming");
  });
});

describe("unpaidAmount", () => {
  it("sums only unpaid items", () => {
    expect(unpaidAmount(month(9, "2026-10-15", [item(1000, true), item(250), item(50)]))).toBe(300);
  });
});

describe("monthsNeedingAttention", () => {
  it("returns overdue and due-soon months, oldest first", () => {
    const months = [
      month(10, "2026-11-16"),
      month(9, "2026-10-15"),
      month(8, "2026-09-15"),
      month(7, "2026-08-17", [item(1, true)]),
    ];
    expect(monthsNeedingAttention(months, today).map((m) => m.month)).toEqual([8, 9]);
  });
});
