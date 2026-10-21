import { describe, expect, it } from "vitest";
import { emptyObligationValues, obligationToValues, parseAmount, valuesToRequest } from "./obligation-form";

describe("parseAmount", () => {
  it("accepts Serbian and plain notations", () => {
    expect(parseAmount("6.500,50")).toBe(6500.5);
    expect(parseAmount("6500.50")).toBe(6500.5);
    expect(parseAmount("6 500,5")).toBe(6500.5);
    expect(parseAmount("")).toBeNaN();
    expect(parseAmount("abc")).toBeNaN();
  });
});

describe("obligation form mapping", () => {
  it("starts in the current month with the usual tax payment code and model", () => {
    const values = emptyObligationValues(new Date(2026, 9, 21));
    expect(values).toMatchObject({ start: "2026-10", end: "", paymentCode: "253", model: "97" });
  });

  it("round-trips an obligation through the form", () => {
    const obligation = {
      id: "1",
      name: " Porez ",
      amount: 6500.5,
      recipientName: "Poreska uprava",
      recipientAccount: "840-711122843-32",
      paymentCode: "253",
      model: "97",
      reference: "1234567890",
      purpose: null,
      startYear: 2026,
      startMonth: 3,
      endYear: 2026,
      endMonth: 12,
    };
    const values = obligationToValues(obligation);
    expect(values).toMatchObject({ amount: "6500.5", start: "2026-03", end: "2026-12", purpose: "" });
    expect(valuesToRequest(values)).toEqual({
      name: "Porez",
      amount: 6500.5,
      recipientName: "Poreska uprava",
      recipientAccount: "840-711122843-32",
      paymentCode: "253",
      model: "97",
      reference: "1234567890",
      purpose: null,
      startYear: 2026,
      startMonth: 3,
      endYear: 2026,
      endMonth: 12,
    });
  });

  it("sends an open end as null so editing can remove it", () => {
    const request = valuesToRequest({ ...emptyObligationValues(new Date(2026, 0, 1)), end: "" });
    expect(request).toMatchObject({ startYear: 2026, startMonth: 1, endYear: null, endMonth: null });
  });
});
