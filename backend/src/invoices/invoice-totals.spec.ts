import { calculateInvoiceTotals } from './invoice-totals';
import { Currency } from '../generated/prisma/enums';

describe('calculateInvoiceTotals', () => {
  it('avoids floating point errors', () => {
    // 0.1 * 3 = 0.30000000000000004 and 1.005 * 1000 = 1004.9999999999999 with plain numbers
    const result = calculateInvoiceTotals(
      [
        { description: 'a', quantity: 3, unitPrice: 0.1 },
        { description: 'b', quantity: 1000, unitPrice: 1.005 },
      ],
      Currency.RSD,
    );

    expect(result.items[0].total.toString()).toBe('0.3');
    expect(result.items[1].total.toString()).toBe('1005');
    expect(result.totalAmount.toString()).toBe('1005.3');
    expect(result.totalRsd.toString()).toBe('1005.3');
  });

  it('rounds each line to 2 decimals before summing', () => {
    const result = calculateInvoiceTotals(
      [
        { description: 'a', quantity: 1.5, unitPrice: 10.005 }, // 15.0075 -> 15.01
        { description: 'b', quantity: 1.5, unitPrice: 10.005 },
      ],
      Currency.RSD,
    );

    expect(result.totalAmount.toString()).toBe('30.02');
  });

  it('converts foreign currency to RSD with the exchange rate, rounded to 2 decimals', () => {
    const result = calculateInvoiceTotals(
      [{ description: 'Dev', quantity: 10, unitPrice: 33.33 }],
      Currency.EUR,
      117.1726,
    );

    expect(result.totalAmount.toString()).toBe('333.3');
    expect(result.totalRsd.toString()).toBe('39053.63'); // 333.3 * 117.1726 = 39053.62758
  });
});
