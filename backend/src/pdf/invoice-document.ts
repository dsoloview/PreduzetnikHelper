import type {
  Column,
  Content,
  TableCell,
  TDocumentDefinitions,
} from 'pdfmake/interfaces';
import type { InvoicePdfData } from './pdf.interface';
import { tryBuildIpsQr } from '../common/payments/ips-qr';

/** The app's palette: teal primary on calm neutrals */
export const INVOICE_COLORS = {
  primary: '#006b81',
  primarySoft: '#e0f2f7',
  text: '#0e171e',
  muted: '#5f6b74',
  border: '#d9e2e7',
  surface: '#f4f7f9',
} as const;

/** IPS payment code for B2B trade in goods and services */
const INVOICE_PAYMENT_CODE = '221';

type Margin = [number, number, number, number];

const formatAmount = (value: number): string =>
  Number(value).toLocaleString('sr-RS', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

/** "05.09.2026": the Belgrade calendar date, in the same form the app shows */
export const formatInvoiceDate = (value: string): string => {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Belgrade',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${part('day')}.${part('month')}.${part('year')}`;
};

const joinParts = (parts: (string | null | undefined)[], separator = ', ') =>
  parts.filter((part) => part && part.trim()).join(separator);

/**
 * Labels are Serbian, with an English line under them for international clients:
 * domestic invoices stay clean, foreign ones remain readable for the client.
 */
const labeler =
  (bilingual: boolean) =>
  (
    sr: string,
    en: string,
    {
      enColor = INVOICE_COLORS.muted,
      ...style
    }: { bold?: boolean; color?: string; enColor?: string } = {},
  ) =>
    (bilingual
      ? {
          stack: [
            { text: sr },
            { text: en, fontSize: 7, color: enColor, bold: false },
          ],
          ...style,
        }
      : { text: sr, ...style }) as Content;

/** The IPS QR payload for paying this invoice, or null when it cannot have one */
export const invoiceIpsQr = (data: InvoicePdfData): string | null => {
  // IPS only moves dinars between Serbian accounts
  if (data.currency !== 'RSD') return null;
  return tryBuildIpsQr({
    recipientAccount: data.bankAccount.accountNumber,
    recipientName: joinParts([
      data.user.companyName ?? data.user.name,
      data.user.city,
    ]),
    amount: data.totalAmount,
    payerName: joinParts([data.client.name, data.client.city]),
    paymentCode: INVOICE_PAYMENT_CODE,
    purpose: `Faktura ${data.displayNumber}`,
    model: '00',
    reference: data.displayNumber.replace(/\//g, '-'),
  });
};

interface InvoiceDocumentOptions {
  /** SVG markup of the IPS QR code to print next to the payment details */
  qrSvg?: string | null;
}

export const buildInvoiceDocument = (
  data: InvoicePdfData,
  { qrSvg }: InvoiceDocumentOptions = {},
): TDocumentDefinitions => {
  const bilingual = data.client.type === 'INTERNATIONAL';
  const label = labeler(bilingual);
  const money = (value: number) => `${formatAmount(value)} ${data.currency}`;
  const date = formatInvoiceDate;
  const sellerName = data.user.companyName ?? data.user.name;

  const sectionTitle = (sr: string, en: string): Content => ({
    text: bilingual ? `${sr} · ${en}` : sr,
    fontSize: 7.5,
    bold: true,
    color: INVOICE_COLORS.primary,
    characterSpacing: 0.6,
    margin: [0, 0, 0, 6] as Margin,
  });

  const line = (text: string | null | undefined, extra: object = {}) =>
    text ? [{ text, margin: [0, 1.5, 0, 0] as Margin, ...extra }] : [];

  const card = (stack: Content[]): Content => ({
    table: {
      widths: ['*'],
      body: [[{ stack, margin: [10, 9, 10, 10] as Margin }]],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
      fillColor: () => INVOICE_COLORS.surface,
    },
  });

  const header: Content = {
    columns: [
      {
        width: '*',
        stack: [
          {
            text: sellerName,
            fontSize: 15,
            bold: true,
            color: INVOICE_COLORS.text,
          },
          ...line(
            data.user.companyName && data.user.companyName !== data.user.name
              ? data.user.name
              : null,
            { fontSize: 9.5 },
          ),
          ...line(
            joinParts([
              data.user.address,
              joinParts([data.user.postalCode, data.user.city], ' '),
            ]),
            { color: INVOICE_COLORS.muted },
          ),
          ...line(
            joinParts(
              [
                data.user.pib && `PIB ${data.user.pib}`,
                data.user.mbr && `MB ${data.user.mbr}`,
              ],
              '  ·  ',
            ),
            { color: INVOICE_COLORS.muted },
          ),
        ],
      },
      {
        width: 'auto',
        stack: [
          {
            text: 'FAKTURA',
            fontSize: 24,
            bold: true,
            color: INVOICE_COLORS.primary,
            alignment: 'right',
            characterSpacing: 1,
          },
          ...(bilingual
            ? [
                {
                  text: 'INVOICE',
                  fontSize: 9,
                  color: INVOICE_COLORS.muted,
                  alignment: 'right' as const,
                  characterSpacing: 2,
                },
              ]
            : []),
        ],
      },
    ],
  };

  const meta: Content = {
    table: {
      widths: ['*', '*', '*', '*'],
      body: [
        [
          label('Broj fakture', 'Invoice no.', { color: INVOICE_COLORS.muted }),
          label('Datum izdavanja', 'Issue date', {
            color: INVOICE_COLORS.muted,
          }),
          label('Rok plaćanja', 'Due date', { color: INVOICE_COLORS.muted }),
          label('Mesto izdavanja', 'Place of issue', {
            color: INVOICE_COLORS.muted,
          }),
        ],
        [
          { text: data.displayNumber, bold: true, fontSize: 10 },
          { text: date(data.issueDate), bold: true, fontSize: 10 },
          { text: date(data.dueDate), bold: true, fontSize: 10 },
          { text: data.placeOfIssue, bold: true, fontSize: 10 },
        ],
      ],
    },
    layout: {
      hLineWidth: (i: number) => (i === 0 || i === 2 ? 0.75 : 0),
      vLineWidth: () => 0,
      hLineColor: () => INVOICE_COLORS.border,
      paddingLeft: () => 0,
      paddingRight: () => 8,
      paddingTop: (i: number) => (i === 0 ? 8 : 2),
      paddingBottom: (i: number) => (i === 1 ? 8 : 0),
    },
    fontSize: 8,
    margin: [0, 18, 0, 16] as Margin,
  };

  const parties: Content = {
    columns: [
      card([
        sectionTitle('KUPAC', 'BILL TO'),
        { text: data.client.name, fontSize: 10.5, bold: true },
        ...line(data.client.address),
        ...line(
          joinParts([
            joinParts([data.client.postalCode, data.client.city], ' '),
            data.client.country,
          ]),
        ),
        ...line(
          data.client.taxId &&
            `${bilingual ? 'VAT / Tax ID' : 'PIB'}: ${data.client.taxId}`,
          { margin: [0, 5, 0, 0] as Margin },
        ),
        ...line(
          data.client.registrationNumber &&
            `${bilingual ? 'Reg. no.' : 'MB'}: ${data.client.registrationNumber}`,
        ),
      ]),
      card([
        sectionTitle('PODACI ZA UPLATU', 'PAYMENT DETAILS'),
        { text: data.bankAccount.bankName, bold: true },
        ...line(
          `${bilingual ? 'Račun / Account' : 'Račun'}: ${data.bankAccount.accountNumber}`,
        ),
        ...line(data.bankAccount.iban && `IBAN: ${data.bankAccount.iban}`),
        ...line(
          data.bankAccount.swiftCode &&
            `SWIFT/BIC: ${data.bankAccount.swiftCode}`,
        ),
        ...line(
          `${bilingual ? 'Poziv na broj / Reference' : 'Poziv na broj'}: ${data.displayNumber}`,
          { margin: [0, 5, 0, 0] as Margin },
        ),
        ...line(
          `${bilingual ? 'Valuta / Currency' : 'Valuta'}: ${data.currency}`,
        ),
      ]),
    ],
    columnGap: 12,
    margin: [0, 0, 0, 18] as Margin,
  };

  const headerCell = (
    sr: string,
    en: string,
    alignment: 'left' | 'right' | 'center' = 'left',
  ): TableCell =>
    bilingual
      ? {
          stack: [
            { text: sr, bold: true },
            {
              text: en,
              fontSize: 7,
              bold: false,
              color: INVOICE_COLORS.muted,
            },
          ],
          alignment,
        }
      : { text: sr, bold: true, alignment };

  const items: Content = {
    table: {
      headerRows: 1,
      dontBreakRows: true,
      widths: [22, '*', 44, 78, 84],
      body: [
        [
          headerCell('#', 'No.', 'center'),
          headerCell('Opis usluge', 'Description'),
          headerCell('Kol.', 'Qty', 'right'),
          headerCell('Cena', 'Unit price', 'right'),
          headerCell('Iznos', 'Amount', 'right'),
        ],
        ...data.items.map((item, idx): TableCell[] => [
          {
            text: String(idx + 1),
            alignment: 'center',
            color: INVOICE_COLORS.muted,
          },
          item.description,
          {
            text: Number(item.quantity).toLocaleString('sr-RS', {
              maximumFractionDigits: 2,
            }),
            alignment: 'right',
          },
          { text: formatAmount(item.unitPrice), alignment: 'right' },
          { text: formatAmount(item.total), alignment: 'right', bold: true },
        ]),
      ],
    },
    layout: {
      hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
        i === 0 ? 0 : i === 1 || i === node.table.body.length ? 0.75 : 0.4,
      vLineWidth: () => 0,
      hLineColor: (i: number) =>
        i === 1 ? INVOICE_COLORS.primary : INVOICE_COLORS.border,
      fillColor: (i: number) => (i === 0 ? INVOICE_COLORS.primarySoft : null),
      paddingLeft: () => 6,
      paddingRight: () => 6,
      paddingTop: () => 6,
      paddingBottom: () => 6,
    },
    margin: [0, 0, 0, 12] as Margin,
  };

  const totalsRow = (labelCell: Content, value: string): TableCell[] => [
    { ...(labelCell as object), color: INVOICE_COLORS.muted } as TableCell,
    { text: value, alignment: 'right' },
  ];

  const totals: Content = {
    unbreakable: true,
    columns: [
      { width: '*', text: '' },
      {
        width: 240,
        stack: [
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                totalsRow(
                  label('Osnovica', 'Subtotal'),
                  money(data.totalAmount),
                ),
                totalsRow(label('PDV (0%)', 'VAT (0%)'), money(0)),
              ],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 3,
              paddingBottom: () => 3,
            },
          },
          {
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  label('ZA UPLATU', 'TOTAL DUE', {
                    bold: true,
                    color: '#ffffff',
                    enColor: INVOICE_COLORS.primarySoft,
                  }),
                  {
                    text: money(data.totalAmount),
                    bold: true,
                    fontSize: 13,
                    color: '#ffffff',
                    alignment: 'right',
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0,
              vLineWidth: () => 0,
              fillColor: () => INVOICE_COLORS.primary,
              paddingLeft: () => 8,
              paddingRight: () => 8,
              paddingTop: () => 7,
              paddingBottom: () => 7,
            },
            margin: [0, 4, 0, 0] as Margin,
          },
          ...(data.exchangeRate
            ? [
                {
                  text: `${bilingual ? 'Protivvrednost / RSD equivalent' : 'Protivvrednost'}: ${formatAmount(data.totalRsd)} RSD (${bilingual ? 'kurs / rate' : 'srednji kurs NBS'} ${data.exchangeRate})`,
                  fontSize: 7.5,
                  color: INVOICE_COLORS.muted,
                  alignment: 'right' as const,
                  margin: [0, 4, 0, 0] as Margin,
                },
              ]
            : []),
        ],
      },
    ],
    margin: [0, 0, 0, 20] as Margin,
  };

  const notes: Content[] = [
    {
      text: bilingual
        ? 'Obveznik nije u sistemu PDV-a (čl. 33 Zakona o PDV-u). / The supplier is not registered for VAT (Art. 33 of the Serbian VAT Law).'
        : 'Obveznik nije u sistemu PDV-a (čl. 33 Zakona o PDV-u).',
      color: INVOICE_COLORS.muted,
    },
    {
      text: bilingual
        ? 'Faktura je punovažna bez pečata i potpisa. / This invoice is valid without stamp and signature.'
        : 'Faktura je punovažna bez pečata i potpisa.',
      color: INVOICE_COLORS.muted,
      margin: [0, 3, 0, 0] as Margin,
    },
    ...(data.note
      ? [
          {
            stack: [
              label('Napomena', 'Note', { bold: true }),
              { text: data.note, margin: [0, 2, 0, 0] as Margin },
            ],
            margin: [0, 10, 0, 0] as Margin,
          },
        ]
      : []),
  ];

  const qr: Column[] = qrSvg
    ? [
        {
          width: 92,
          stack: [
            { svg: qrSvg, width: 92 },
            {
              text: 'Plati IPS QR kodom',
              fontSize: 7,
              color: INVOICE_COLORS.muted,
              alignment: 'center',
              margin: [0, 2, 0, 0] as Margin,
            },
          ],
        },
      ]
    : [];

  return {
    pageSize: 'A4',
    pageMargins: [40, 36, 40, 50],
    info: { title: `Faktura ${data.displayNumber}`, author: sellerName },
    defaultStyle: {
      font: 'Roboto',
      fontSize: 8.5,
      color: INVOICE_COLORS.text,
      lineHeight: 1.15,
    },
    background: () => ({
      canvas: [
        {
          type: 'rect',
          x: 0,
          y: 0,
          w: 595.28,
          h: 6,
          color: INVOICE_COLORS.primary,
        },
      ],
    }),
    content: [
      header,
      meta,
      parties,
      items,
      totals,
      {
        columns: [{ width: '*', stack: notes }, ...qr],
        columnGap: 20,
      },
    ],
    footer: (currentPage: number, pageCount: number): Content => ({
      columns: [
        {
          text: joinParts(
            [sellerName, data.user.pib && `PIB ${data.user.pib}`],
            ' · ',
          ),
        },
        {
          text: `${bilingual ? 'Faktura / Invoice' : 'Faktura'} ${data.displayNumber} · ${currentPage}/${pageCount}`,
          alignment: 'right',
        },
      ],
      fontSize: 7,
      color: INVOICE_COLORS.muted,
      margin: [40, 18, 40, 0] as Margin,
    }),
  };
};
