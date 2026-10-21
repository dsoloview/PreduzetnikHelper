import type { ICreateTaxObligationRequest, ITaxObligation } from "@preduzetnik/shared";

export interface ObligationFormValues {
  name: string;
  amount: string;
  recipientName: string;
  recipientAccount: string;
  paymentCode: string;
  model: string;
  reference: string;
  purpose: string;
  start: string;
  end: string;
}

const toMonthValue = (year: number, month: number) => `${year}-${String(month).padStart(2, "0")}`;

const fromMonthValue = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
};

export const parseAmount = (value: string): number => {
  const compact = value.replace(/\s/g, "");
  const normalized = compact.includes(",") ? compact.replace(/\./g, "").replace(",", ".") : compact;
  return normalized === "" ? NaN : Number(normalized);
};

export const emptyObligationValues = (today = new Date()): ObligationFormValues => ({
  name: "",
  amount: "",
  recipientName: "",
  recipientAccount: "",
  paymentCode: "253",
  model: "97",
  reference: "",
  purpose: "",
  start: toMonthValue(today.getFullYear(), today.getMonth() + 1),
  end: "",
});

export const obligationToValues = (obligation: ITaxObligation): ObligationFormValues => ({
  name: obligation.name,
  amount: String(obligation.amount),
  recipientName: obligation.recipientName,
  recipientAccount: obligation.recipientAccount,
  paymentCode: obligation.paymentCode,
  model: obligation.model,
  reference: obligation.reference,
  purpose: obligation.purpose ?? "",
  start: toMonthValue(obligation.startYear, obligation.startMonth),
  end: obligation.endYear && obligation.endMonth ? toMonthValue(obligation.endYear, obligation.endMonth) : "",
});

export const valuesToRequest = (values: ObligationFormValues): ICreateTaxObligationRequest => {
  const start = fromMonthValue(values.start);
  const end = values.end ? fromMonthValue(values.end) : null;
  return {
    name: values.name.trim(),
    amount: parseAmount(values.amount),
    recipientName: values.recipientName.trim(),
    recipientAccount: values.recipientAccount.trim(),
    paymentCode: values.paymentCode.trim(),
    model: values.model.trim(),
    reference: values.reference.trim(),
    purpose: values.purpose.trim() || null,
    startYear: start.year,
    startMonth: start.month,
    endYear: end?.year ?? null,
    endMonth: end?.month ?? null,
  };
};
