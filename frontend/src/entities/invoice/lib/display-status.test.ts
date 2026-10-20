import { describe, expect, it } from "vitest";
import { getDaysOverdue, getDisplayStatus, INVOICE_STATUSES } from "./display-status";

const today = new Date("2026-10-20T10:00:00");

describe("getDaysOverdue", () => {
  it("counts calendar days past the due date for sent invoices", () => {
    expect(getDaysOverdue({ status: "SENT", dueDate: "2026-10-15T00:00:00.000Z" }, today)).toBe(5);
  });

  it("is zero on the due date itself and before it", () => {
    expect(getDaysOverdue({ status: "SENT", dueDate: "2026-10-20T00:00:00.000Z" }, today)).toBe(0);
    expect(getDaysOverdue({ status: "SENT", dueDate: "2026-11-01T00:00:00.000Z" }, today)).toBe(0);
  });

  it("ignores invoices that are not waiting for payment", () => {
    for (const status of ["DRAFT", "PAID", "CANCELLED"] as const) {
      expect(getDaysOverdue({ status, dueDate: "2026-01-01T00:00:00.000Z" }, today)).toBe(0);
    }
  });
});

describe("getDisplayStatus", () => {
  it("shows OVERDUE for a sent invoice past its due date", () => {
    expect(getDisplayStatus({ status: "SENT", dueDate: "2026-10-01T00:00:00.000Z" }, today)).toBe("OVERDUE");
  });

  it("keeps the stored status otherwise", () => {
    expect(getDisplayStatus({ status: "SENT", dueDate: "2026-12-01T00:00:00.000Z" }, today)).toBe("SENT");
    expect(getDisplayStatus({ status: "PAID", dueDate: "2026-01-01T00:00:00.000Z" }, today)).toBe("PAID");
  });
});

describe("INVOICE_STATUSES", () => {
  it("lists only statuses that can be stored", () => {
    expect(INVOICE_STATUSES).toEqual(["DRAFT", "SENT", "PAID", "CANCELLED"]);
  });
});
