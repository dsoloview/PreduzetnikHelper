import type { InvoicePdfData } from './pdf.interface';
import {
  buildInvoiceDocument,
  formatInvoiceDate,
  invoiceIpsQr,
} from './invoice-document';

const invoice = (overrides: Partial<InvoicePdfData> = {}): InvoicePdfData => ({
  displayNumber: '7/2026',
  issueDate: '2026-10-19T22:00:00.000Z',
  dueDate: '2026-11-04T00:00:00.000Z',
  placeOfIssue: 'Novi Sad',
  currency: 'RSD',
  exchangeRate: null,
  totalAmount: 27003,
  totalRsd: 27003,
  note: null,
  items: [
    { description: 'Konsalting', quantity: 3, unitPrice: 9001, total: 27003 },
  ],
  user: {
    companyName: 'Marko Petrović PR',
    name: 'Marko Petrović',
    address: 'Bulevar oslobođenja 12',
    postalCode: '21000',
    city: 'Novi Sad',
    pib: '112233445',
    mbr: '66778899',
  },
  client: {
    type: 'DOMESTIC',
    name: 'Studio Kreativ',
    address: 'Zmaj Jovina 3',
    postalCode: null,
    city: 'Beograd',
    country: 'RS',
    taxId: '108765432',
    registrationNumber: null,
  },
  bankAccount: {
    bankName: 'Banca Intesa',
    accountNumber: '160-0000000123456-54',
    swiftCode: null,
    iban: null,
  },
  ...overrides,
});

/** Every string printed in the document, in order */
const texts = (node: unknown): string[] => {
  if (typeof node === 'string') return [node];
  if (Array.isArray(node)) return node.flatMap(texts);
  if (node && typeof node === 'object') {
    return Object.entries(node).flatMap(([key, value]) =>
      key === 'svg' ? [] : texts(value),
    );
  }
  return [];
};

describe('formatInvoiceDate', () => {
  it('prints the Belgrade calendar date as dd.MM.yyyy', () => {
    // Local midnight in Belgrade, stored in UTC as the previous day
    expect(formatInvoiceDate('2026-10-19T22:00:00.000Z')).toBe('20.10.2026');
    expect(formatInvoiceDate('2026-01-05')).toBe('05.01.2026');
  });
});

describe('invoiceIpsQr', () => {
  it('builds a payment order for an RSD invoice', () => {
    expect(invoiceIpsQr(invoice())).toBe(
      'K:PR|V:01|C:1|R:160000000012345654|N:Marko Petrović PR, Novi Sad|I:RSD27003,00|P:Studio Kreativ, Beograd|SF:221|S:Faktura 7/2026|RO:007-2026',
    );
  });

  it('has none for foreign currencies or invalid accounts', () => {
    expect(invoiceIpsQr(invoice({ currency: 'EUR' }))).toBeNull();
    expect(
      invoiceIpsQr(
        invoice({
          bankAccount: {
            ...invoice().bankAccount,
            accountNumber: '160-0000000123456-55',
          },
        }),
      ),
    ).toBeNull();
  });
});

describe('buildInvoiceDocument', () => {
  it('uses Serbian labels for domestic clients', () => {
    const printed = texts(buildInvoiceDocument(invoice()).content);
    expect(printed).toContain('FAKTURA');
    expect(printed).toContain('Rok plaćanja');
    expect(printed).toContain('20.10.2026');
    expect(printed).not.toContain('INVOICE');
    expect(printed).not.toContain('Due date');
  });

  it('adds English labels for international clients', () => {
    const doc = buildInvoiceDocument(
      invoice({
        currency: 'EUR',
        exchangeRate: 117.15,
        totalAmount: 4200,
        totalRsd: 492030,
        client: { ...invoice().client, type: 'INTERNATIONAL', country: 'DE' },
      }),
    );
    const printed = texts(doc.content);
    expect(printed).toEqual(
      expect.arrayContaining([
        'INVOICE',
        'Rok plaćanja',
        'Due date',
        'TOTAL DUE',
      ]),
    );
    expect(printed.join(' ')).toContain('492.030,00 RSD');
  });

  it('prints the QR code only when given one', () => {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';
    expect(
      JSON.stringify(buildInvoiceDocument(invoice()).content),
    ).not.toContain('"svg"');
    expect(
      JSON.stringify(buildInvoiceDocument(invoice(), { qrSvg: svg }).content),
    ).toContain('"svg"');
  });
});
