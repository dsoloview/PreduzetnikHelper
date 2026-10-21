import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import * as path from 'path';
import type { TDocumentDefinitions, TableCell } from 'pdfmake/interfaces';
import type { IPdfService, InvoicePdfData, KpoPdfData } from './pdf.interface';
import { formatBelgradeDate } from '../common/utils';
import * as QRCode from 'qrcode';
import { buildInvoiceDocument, invoiceIpsQr } from './invoice-document';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pm = require('pdfmake') as {
  addFonts: (fonts: Record<string, unknown>) => void;
  setLocalAccessPolicy: (cb: (p: string) => boolean) => void;
  setUrlAccessPolicy: (cb: (u: string) => boolean) => void;
  createPdf: (dd: TDocumentDefinitions) => { getBuffer: () => Promise<Buffer> };
};

const PDFMAKE_FONTS_DIR = path.join(
  require.resolve('pdfmake/package.json'),
  '..',
  'fonts',
  'Roboto',
);

const COLORS = {
  primary: '#2c3e50',
  secondary: '#34495e',
  headerBg: '#2c3e50',
  headerText: '#ffffff',
  totalsBg: '#f8f9fa',
  border: '#bdc3c7',
  lightBorder: '#dfe6e9',
  muted: '#7f8c8d',
  noteBg: '#f8f9fa',
  sectionBg: '#f1f2f6',
};

@Injectable()
export class PdfmakePdfService implements IPdfService, OnModuleInit {
  private readonly logger = new Logger(PdfmakePdfService.name);
  onModuleInit() {
    pm.addFonts({
      Roboto: {
        normal: path.join(PDFMAKE_FONTS_DIR, 'Roboto-Regular.ttf'),
        bold: path.join(PDFMAKE_FONTS_DIR, 'Roboto-Medium.ttf'),
        italics: path.join(PDFMAKE_FONTS_DIR, 'Roboto-Italic.ttf'),
        bolditalics: path.join(PDFMAKE_FONTS_DIR, 'Roboto-MediumItalic.ttf'),
      },
    });
    pm.setLocalAccessPolicy(() => true);
    pm.setUrlAccessPolicy(() => false);
    this.logger.log('PdfmakePdfService initialized.');
  }

  private formatCurrency(value: number | null | undefined): string {
    if (value == null) return '';
    return Number(value).toLocaleString('sr-RS', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return '';
    return formatBelgradeDate(dateString);
  }

  private async bufferFromDoc(
    docDefinition: TDocumentDefinitions,
  ): Promise<Buffer> {
    return pm.createPdf(docDefinition).getBuffer();
  }

  async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
    try {
      const qrPayload = invoiceIpsQr(data);
      const qrSvg = qrPayload
        ? await QRCode.toString(qrPayload, {
            type: 'svg',
            margin: 0,
            errorCorrectionLevel: 'M',
          })
        : null;
      return await this.bufferFromDoc(buildInvoiceDocument(data, { qrSvg }));
    } catch (error) {
      this.logger.error('Invoice PDF generation failed', error);
      throw new InternalServerErrorException('Failed to generate PDF');
    }
  }

  async generateKpoPdf(data: KpoPdfData): Promise<Buffer> {
    try {
      const totalProducts = data.entries.reduce(
        (sum, e) => sum + e.productAmount,
        0,
      );
      const totalServices = data.entries.reduce(
        (sum, e) => sum + e.serviceAmount,
        0,
      );

      const entryRows: TableCell[][] = data.entries.map((e) => [
        { text: String(e.sequenceNumber), alignment: 'center', fontSize: 9 },
        {
          stack: [
            { text: this.formatDate(e.date), bold: true, fontSize: 9 },
            { text: e.description, fontSize: 8 },
          ],
          alignment: 'left',
        },
        {
          text: this.formatCurrency(e.productAmount),
          alignment: 'right',
          fontSize: 9,
        },
        {
          text: this.formatCurrency(e.serviceAmount),
          alignment: 'right',
          fontSize: 9,
        },
        {
          text: this.formatCurrency(e.totalAmount),
          alignment: 'right',
          bold: true,
          fontSize: 9,
        },
      ]);

      const docDefinition: TDocumentDefinitions = {
        pageSize: 'A4',
        pageOrientation: 'landscape',
        pageMargins: [30, 30, 30, 30],
        defaultStyle: { font: 'Roboto', fontSize: 9, color: COLORS.primary },
        content: [
          {
            text: 'KNJIGA O OSTVARENOM PROMETU PAUŠALNO OPOREZOVANIH OBVEZNIKA (KPO)',
            fontSize: 12,
            bold: true,
            alignment: 'center',
            color: COLORS.primary,
            margin: [0, 0, 0, 6],
          },
          {
            text: `Za kalendarsku godinu: ${data.year}`,
            fontSize: 11,
            alignment: 'center',
            bold: true,
            margin: [0, 0, 0, 16],
          },
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    stack: [
                      {
                        text: [
                          { text: 'Poslovno ime: ', bold: true },
                          data.user.companyName ?? '—',
                        ],
                      },
                      {
                        text: [
                          { text: 'Ime i prezime: ', bold: true },
                          data.user.name,
                        ],
                      },
                      {
                        text: [
                          { text: 'Sedište: ', bold: true },
                          `${data.user.address ?? ''}, ${data.user.city ?? ''}`,
                        ],
                      },
                    ],
                    margin: [8, 6, 8, 6] as [number, number, number, number],
                  },
                  {
                    stack: [
                      {
                        text: [
                          { text: 'PIB: ', bold: true },
                          data.user.pib ?? '—',
                        ],
                      },
                      {
                        text: [
                          { text: 'Matični broj: ', bold: true },
                          data.user.mbr ?? '—',
                        ],
                      },
                      {
                        text: [
                          { text: 'Šifra delatnosti: ', bold: true },
                          data.user.activityCode ?? '—',
                        ],
                      },
                    ],
                    margin: [8, 6, 8, 6] as [number, number, number, number],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: () => 0.5,
              vLineWidth: () => 0.5,
              hLineColor: () => COLORS.lightBorder,
              vLineColor: () => COLORS.lightBorder,
            },
            margin: [0, 0, 0, 16],
          },
          {
            table: {
              headerRows: 2,
              widths: [50, '*', 110, 110, 110],
              body: [
                [
                  {
                    text: 'Redni\nbroj',
                    rowSpan: 2,
                    alignment: 'center',
                    bold: true,
                    margin: [0, 4, 0, 4] as [number, number, number, number],
                  },
                  {
                    text: 'Datum i opis knjiženja\n(broj fakture, naziv kupca)',
                    rowSpan: 2,
                    alignment: 'center',
                    bold: true,
                    margin: [0, 4, 0, 4] as [number, number, number, number],
                  },
                  {
                    text: 'Iznos ostvarenog prihoda u RSD',
                    colSpan: 2,
                    alignment: 'center',
                    bold: true,
                    margin: [0, 4, 0, 4] as [number, number, number, number],
                  },
                  {},
                  {
                    text: 'Ukupan prihod u RSD\n(kol. 3 + 4)',
                    rowSpan: 2,
                    alignment: 'right',
                    bold: true,
                    margin: [0, 4, 0, 4] as [number, number, number, number],
                  },
                ],
                [
                  '',
                  '',
                  {
                    text: 'od prodaje\nproizvoda (3)',
                    alignment: 'right',
                    bold: true,
                    fontSize: 8,
                  },
                  {
                    text: 'od pružanja\nusluga (4)',
                    alignment: 'right',
                    bold: true,
                    fontSize: 8,
                  },
                  '',
                ],
                [
                  { text: '1', alignment: 'center', fontSize: 8 },
                  { text: '2', alignment: 'center', fontSize: 8 },
                  { text: '3', alignment: 'right', fontSize: 8 },
                  { text: '4', alignment: 'right', fontSize: 8 },
                  { text: '5', alignment: 'right', fontSize: 8 },
                ],
                ...entryRows,
                [
                  {
                    text: 'SVEGA:',
                    colSpan: 2,
                    alignment: 'right',
                    bold: true,
                    margin: [0, 4, 8, 4] as [number, number, number, number],
                  },
                  {},
                  {
                    text: this.formatCurrency(totalProducts),
                    alignment: 'right',
                    bold: true,
                    margin: [0, 4, 0, 4] as [number, number, number, number],
                  },
                  {
                    text: this.formatCurrency(totalServices),
                    alignment: 'right',
                    bold: true,
                    margin: [0, 4, 0, 4] as [number, number, number, number],
                  },
                  {
                    text: this.formatCurrency(data.totalYearly),
                    alignment: 'right',
                    bold: true,
                    margin: [0, 4, 0, 4] as [number, number, number, number],
                  },
                ],
              ],
            },
            layout: {
              hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
                i === 0 || i === 1
                  ? 0.5
                  : i === node.table.body.length
                    ? 1
                    : 0.25,
              vLineWidth: () => 0,
              hLineColor: () => COLORS.lightBorder,
            },
            margin: [0, 0, 0, 30],
          },
          {
            columns: [
              {
                width: '*',
                stack: [
                  { text: 'U _________________________________' },
                  {
                    text: 'Dana: _____________________________',
                    margin: [0, 10, 0, 0] as [number, number, number, number],
                  },
                ],
              },
              {
                width: 250,
                alignment: 'center',
                stack: [
                  {
                    text: ' ',
                    margin: [0, 0, 0, 40] as [number, number, number, number],
                  },
                  {
                    canvas: [
                      {
                        type: 'line',
                        x1: 0,
                        y1: 0,
                        x2: 220,
                        y2: 0,
                        lineWidth: 0.5,
                        lineColor: COLORS.border,
                      },
                    ],
                  },
                  {
                    text: 'M.P. (Potpis preduzetnika)',
                    margin: [0, 6, 0, 0] as [number, number, number, number],
                    fontSize: 9,
                  },
                ],
              },
            ],
          },
        ],
      };

      return this.bufferFromDoc(docDefinition);
    } catch (error) {
      this.logger.error('KPO PDF generation failed', error);
      throw new InternalServerErrorException('Failed to generate KPO PDF');
    }
  }
}
