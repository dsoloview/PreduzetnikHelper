import { Prisma } from '../generated/prisma/client';
import { Currency } from '../generated/prisma/enums';

const { Decimal } = Prisma;

export interface InvoiceItemInput {
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceTotals {
    items: { description: string; quantity: Prisma.Decimal; unitPrice: Prisma.Decimal; total: Prisma.Decimal }[];
    totalAmount: Prisma.Decimal;
    totalRsd: Prisma.Decimal;
}

/**
 * Money math in decimals: each line is rounded to 2 places (as printed on the invoice),
 * the total is the sum of printed lines, and the RSD amount is rounded once after conversion.
 */
export const calculateInvoiceTotals = (
    items: InvoiceItemInput[],
    currency: Currency,
    exchangeRate?: number | null,
): InvoiceTotals => {
    const lines = items.map(item => {
        const quantity = new Decimal(item.quantity);
        const unitPrice = new Decimal(item.unitPrice);
        return {
            description: item.description,
            quantity,
            unitPrice,
            total: quantity.mul(unitPrice).toDecimalPlaces(2),
        };
    });

    const totalAmount = lines.reduce((sum, line) => sum.add(line.total), new Decimal(0));
    const totalRsd = currency === Currency.RSD
        ? totalAmount
        : totalAmount.mul(exchangeRate ?? 0).toDecimalPlaces(2);

    return { items: lines, totalAmount, totalRsd };
};
