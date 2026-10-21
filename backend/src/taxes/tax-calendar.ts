const DUE_DAY = 15;

export const taxDueDate = (year: number, month: number): string => {
  const due = new Date(Date.UTC(year, month, DUE_DAY));
  const weekday = due.getUTCDay();
  if (weekday === 6) due.setUTCDate(due.getUTCDate() + 2);
  if (weekday === 0) due.setUTCDate(due.getUTCDate() + 1);
  return due.toISOString().slice(0, 10);
};

export const monthIndex = (year: number, month: number): number =>
  year * 12 + (month - 1);

export interface MonthRange {
  startYear: number;
  startMonth: number;
  endYear: number | null;
  endMonth: number | null;
}

export const isActiveInMonth = (
  range: MonthRange,
  year: number,
  month: number,
): boolean => {
  const current = monthIndex(year, month);
  if (current < monthIndex(range.startYear, range.startMonth)) return false;
  if (range.endYear !== null && range.endMonth !== null) {
    return current <= monthIndex(range.endYear, range.endMonth);
  }
  return true;
};

export const periodLabel = (year: number, month: number): string =>
  `${String(month).padStart(2, '0')}/${year}`;
