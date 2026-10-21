import { isActiveInMonth, periodLabel, taxDueDate } from './tax-calendar';

describe('taxDueDate', () => {
  it('is the 15th of the following month', () => {
    expect(taxDueDate(2026, 9)).toBe('2026-10-15'); // Thursday
    expect(taxDueDate(2026, 5)).toBe('2026-06-15'); // Monday
  });

  it('rolls over the year for December', () => {
    expect(taxDueDate(2026, 12)).toBe('2027-01-15');
  });

  it('moves a Saturday or Sunday due date to Monday', () => {
    expect(taxDueDate(2026, 7)).toBe('2026-08-17'); // 15th is a Saturday
    expect(taxDueDate(2026, 1)).toBe('2026-02-16'); // 15th is a Sunday
  });
});

describe('isActiveInMonth', () => {
  const range = { startYear: 2026, startMonth: 3, endYear: 2026, endMonth: 8 };

  it('includes the start and end months', () => {
    expect(isActiveInMonth(range, 2026, 3)).toBe(true);
    expect(isActiveInMonth(range, 2026, 8)).toBe(true);
  });

  it('excludes months outside the range', () => {
    expect(isActiveInMonth(range, 2026, 2)).toBe(false);
    expect(isActiveInMonth(range, 2026, 9)).toBe(false);
    expect(isActiveInMonth(range, 2025, 12)).toBe(false);
  });

  it('is open-ended without an end month', () => {
    expect(
      isActiveInMonth({ ...range, endYear: null, endMonth: null }, 2030, 1),
    ).toBe(true);
  });
});

describe('periodLabel', () => {
  it('pads the month', () => {
    expect(periodLabel(2026, 9)).toBe('09/2026');
  });
});
