import type { ILimitStatus } from "@preduzetnik/shared";

export type LimitLevel = "ok" | "warning" | "danger";

/** Calm until 80%, a warning from 80%, danger from 95% or when exceeded */
export const getLimitLevel = (status: ILimitStatus): LimitLevel => {
  if (status.isExceeded || status.percentage >= 95) return "danger";
  if (status.percentage >= 80) return "warning";
  return "ok";
};
