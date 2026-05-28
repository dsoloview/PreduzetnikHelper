import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import * as path from 'path';
import type { TDocumentDefinitions, Content, TableCell, Alignment } from 'pdfmake/interfaces';
import type { IPdfService, InvoicePdfData, KpoPdfData } from './pdf.interface';

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
        return new Date(dateString).toLocaleDateString('sr-RS');
    }

    private async bufferFromDoc(docDefinition: TDocumentDefinitions): Promise<Buffer> {
        return pm.createPdf(docDefinition).getBuffer();
    }

    async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
        this.logger.debug('Generating invoice PDF for data:', data);
        try {
            const itemRows: TableCell[][] = data.items.map((item, idx) => [
                { text: String(idx + 1), alignment: 'center' },
                item.description,
                { text: String(item.quantity), alignment: 'right' },
                { text: this.formatCurrency(item.unitPrice), alignment: 'right' },
                { text: this.formatCurrency(item.total), alignment: 'right' },
            ]);

            const totalsSection: Content[] = [
                {
                    columns: [
                        { width: '*', text: '' },
                        {
                            width: 'auto',
                            table: {
                                widths: [160, 120],
                                body: [
                                    [
                                        { text: 'Osnovica / Base Amount:', alignment: 'left' },
                                        { text: `${this.formatCurrency(data.totalAmount)} ${data.currency}`, alignment: 'right' },
                                    ],
                                    [
                                        { text: 'PDV / VAT (0%):', alignment: 'left' },
                                        { text: `0.00 ${data.currency}`, alignment: 'right' },
                                    ],
                                    [
                                        { text: 'UKUPNO / TOTAL:', bold: true, fontSize: 10, alignment: 'left' },
                                        { text: `${this.formatCurrency(data.totalAmount)} ${data.currency}`, bold: true, fontSize: 10, alignment: 'right' },
                                    ],
                                    ...(data.exchangeRate ? [[
                                        { text: 'Protivvrednost u RSD:', alignment: 'left' as Alignment, fontSize: 8, color: COLORS.muted },
                                        { text: `${this.formatCurrency(data.totalRsd)} RSD (kurs: ${data.exchangeRate})`, alignment: 'right' as Alignment, fontSize: 8, color: COLORS.muted },
                                    ]] as TableCell[][] : [] as TableCell[][]),
                                ],
                            },
                            layout: {
                                hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
                                    i === 0 ? 0 : i === node.table.body.length ? 0.5 : 0.1,
                                vLineWidth: () => 0,
                                hLineColor: () => COLORS.border,
                                paddingLeft: () => 8,
                                paddingRight: () => 8,
                                paddingTop: () => 4,
                                paddingBottom: () => 4,
                            },
                        },
                    ],
                    margin: [0, 0, 0, 10],
                },
            ];

            const docDefinition: TDocumentDefinitions = {
                pageSize: 'A4',
                pageMargins: [40, 40, 40, 40],
                defaultStyle: { font: 'Roboto', fontSize: 9, color: COLORS.primary },
                content: [
                    {
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    { text: data.user.companyName ?? data.user.name, fontSize: 14, bold: true, color: COLORS.primary },
                                    { text: data.user.name, fontSize: 10, margin: [0, 2, 0, 0] },
                                    { text: `${data.user.address ?? ''}, ${data.user.postalCode ?? ''} ${data.user.city ?? ''}`, fontSize: 9, margin: [0, 2, 0, 0] },
                                    { text: `PIB: ${data.user.pib ?? '—'} | MB: ${data.user.mbr ?? '—'}`, fontSize: 9, margin: [0, 2, 0, 0] },
                                ],
                            },
                            {
                                width: 'auto',
                                alignment: 'right',
                                stack: [
                                    { text: 'FAKTURA', fontSize: 18, bold: true, color: COLORS.primary },
                                    { text: 'INVOICE', fontSize: 10, color: COLORS.muted, margin: [0, 0, 0, 6] },
                                    {
                                        table: {
                                            widths: [100, '*'],
                                            body: [
                                                ['Broj / No:', { text: data.displayNumber, bold: true }],
                                                ['Mesto / Place:', data.placeOfIssue],
                                                ['Datum / Date:', this.formatDate(data.issueDate)],
                                                ['Rok / Due:', this.formatDate(data.dueDate)],
                                            ],
                                        },
                                        layout: {
                                            hLineWidth: () => 0,
                                            vLineWidth: () => 0,
                                            paddingLeft: (i: number) => (i === 0 ? 0 : 6),
                                            paddingRight: () => 0,
                                            paddingTop: () => 2,
                                            paddingBottom: () => 2,
                                        },
                                    },
                                ],
                            },
                        ],
                        margin: [0, 0, 0, 20],
                    },
                    {
                        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.1, lineColor: COLORS.border }],
                        margin: [0, 0, 0, 15],
                    },
                    {
                        columns: [
                            {
                                width: '*',
                                table: {
                                    widths: ['*'],
                                    body: [
                                        [
                                            {
                                                stack: [
                                                    { text: 'KUPAC / CLIENT', fontSize: 8, bold: true, color: COLORS.muted, margin: [0, 0, 0, 4] as [number, number, number, number] },
                                                    { text: data.client.name, fontSize: 10, bold: true },
                                                    { text: data.client.address ?? '', margin: [0, 2, 0, 0] as [number, number, number, number] },
                                                    { text: `${data.client.postalCode ? data.client.postalCode + ' ' : ''}${data.client.city ?? ''}${data.client.country ? ', ' + data.client.country : ''}`, margin: [0, 2, 0, 0] as [number, number, number, number] },
                                                    ...(data.client.taxId ? [{ text: `PIB: ${data.client.taxId}`, margin: [0, 2, 0, 0] as [number, number, number, number] }] : [] as Content[]),
                                                    ...(data.client.registrationNumber ? [{ text: `MB: ${data.client.registrationNumber}`, margin: [0, 2, 0, 0] as [number, number, number, number] }] : [] as Content[]),
                                                ],
                                                margin: [8, 8, 8, 8],
                                            },
                                        ],
                                    ],
                                },
                                layout: {
                                    hLineWidth: () => 0.5,
                                    vLineWidth: () => 0.5,
                                    hLineColor: () => COLORS.border,
                                    vLineColor: () => COLORS.border,
                                },
                            },
                            { width: 12, text: '' },
                            {
                                width: '*',
                                table: {
                                    widths: ['*'],
                                    body: [
                                        [
                                            {
                                                stack: [
                                                    { text: 'UPLATA / PAYMENT', fontSize: 8, bold: true, color: COLORS.muted, margin: [0, 0, 0, 4] as [number, number, number, number] },
                                                    { text: `Banka: ${data.bankAccount.bankName}`, margin: [0, 1, 0, 0] as [number, number, number, number] },
                                                    { text: `Račun: ${data.bankAccount.accountNumber}`, margin: [0, 1, 0, 0] as [number, number, number, number] },
                                                    ...(data.bankAccount.swiftCode ? [{ text: `SWIFT: ${data.bankAccount.swiftCode}`, margin: [0, 1, 0, 0] as [number, number, number, number] }] : [] as Content[]),
                                                    ...(data.bankAccount.iban ? [{ text: `IBAN: ${data.bankAccount.iban}`, margin: [0, 1, 0, 0] as [number, number, number, number] }] : [] as Content[]),
                                                    { text: `Valuta: ${data.currency}`, bold: true, margin: [0, 4, 0, 0] as [number, number, number, number] },
                                                ],
                                                margin: [8, 8, 8, 8],
                                            },
                                        ],
                                    ],
                                },
                                layout: {
                                    hLineWidth: () => 0.5,
                                    vLineWidth: () => 0.5,
                                    hLineColor: () => COLORS.border,
                                    vLineColor: () => COLORS.border,
                                },
                            },
                        ],
                        margin: [0, 0, 0, 15],
                    },
                    {
                        table: {
                            headerRows: 1,
                            widths: [30, '*', 50, 80, 80],
                            body: [
                                [
                                    { text: 'R.br.', style: 'tableHeader', alignment: 'center' },
                                    { text: 'Opis usluge / Service Description', style: 'tableHeader' },
                                    { text: 'Kol. / Qty', style: 'tableHeader', alignment: 'center' },
                                    { text: `Cena / Price (${data.currency})`, style: 'tableHeader', alignment: 'right' },
                                    { text: `Iznos / Amount (${data.currency})`, style: 'tableHeader', alignment: 'right' },
                                ],
                                ...itemRows,
                            ],
                        },
                        layout: {
                            hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
                                i === 0 || i === node.table.body.length ? 0.25 : 0.1,
                            vLineWidth: () => 0,
                            hLineColor: () => COLORS.lightBorder,
                            fillColor: (i: number) => (i === 0 ? COLORS.headerBg : null),
                        },
                        margin: [0, 0, 0, 15],
                    },
                    ...totalsSection,
                    {
                        table: {
                            widths: ['*'],
                            body: [
                                [
                                    {
                                        text: [
                                            { text: 'Napomena: ', bold: true },
                                            { text: 'Preduzetnik nije u sistemu PDV-a prema članu 33. Zakona o PDV-u. / Not subject to VAT per Article 33 of the VAT Law.' },
                                        ],
                                        fontSize: 9,
                                        margin: [8, 6, 8, 6],
                                    },
                                ],
                            ],
                        },
                        layout: {
                            hLineWidth: () => 0,
                            vLineWidth: (i: number) => (i === 0 ? 1 : 0),
                            vLineColor: () => COLORS.muted,
                            fillColor: () => COLORS.noteBg,
                        },
                        margin: [0, 10, 0, 10],
                    },
                    ...(data.note ? [
                        {
                            table: {
                                widths: ['*'],
                                body: [[{ text: [{ text: 'Dodatna napomena / Note:\n', bold: true }, data.note], margin: [8, 6, 8, 6] }]],
                            },
                            layout: {
                                hLineWidth: () => 0,
                                vLineWidth: () => 0,
                                fillColor: () => COLORS.noteBg,
                            },
                            margin: [0, 0, 0, 10],
                        } as Content,
                    ] : []),
                    {
                        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 0.1, lineColor: COLORS.border }],
                        margin: [0, 20, 0, 10],
                    },
                    {
                        text: [
                            { text: 'Faktura je validna bez pečata i potpisa. / This invoice is valid without stamp and signature.', italics: true },
                        ],
                        fontSize: 8,
                        color: COLORS.muted,
                        alignment: 'center',
                    },
                ],
                styles: {
                    tableHeader: {
                        bold: true,
                        fontSize: 9,
                        color: COLORS.headerText,
                    },
                },
            };

            return this.bufferFromDoc(docDefinition);
        } catch (error) {
            this.logger.error('Invoice PDF generation failed', error);
            throw new InternalServerErrorException('Failed to generate PDF');
        }
    }

    async generateKpoPdf(data: KpoPdfData): Promise<Buffer> {
        try {
            const totalProducts = data.entries.reduce((sum, e) => sum + e.productAmount, 0);
            const totalServices = data.entries.reduce((sum, e) => sum + e.serviceAmount, 0);

            const entryRows: TableCell[][] = data.entries.map((e) => [
                { text: String(e.sequenceNumber), alignment: 'center', fontSize: 9 },
                {
                    stack: [
                        { text: this.formatDate(e.issueDate), bold: true, fontSize: 9 },
                        { text: e.description, fontSize: 8 },
                    ],
                    alignment: 'left',
                },
                { text: this.formatCurrency(e.productAmount), alignment: 'right', fontSize: 9 },
                { text: this.formatCurrency(e.serviceAmount), alignment: 'right', fontSize: 9 },
                { text: this.formatCurrency(e.totalAmount), alignment: 'right', bold: true, fontSize: 9 },
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
                                            { text: [{ text: 'Poslovno ime: ', bold: true }, data.user.companyName ?? '—'] },
                                            { text: [{ text: 'Ime i prezime: ', bold: true }, data.user.name] },
                                            { text: [{ text: 'Sedište: ', bold: true }, `${data.user.address ?? ''}, ${data.user.city ?? ''}`] },
                                        ],
                                        margin: [8, 6, 8, 6] as [number, number, number, number],
                                    },
                                    {
                                        stack: [
                                            { text: [{ text: 'PIB: ', bold: true }, data.user.pib ?? '—'] },
                                            { text: [{ text: 'Matični broj: ', bold: true }, data.user.mbr ?? '—'] },
                                            { text: [{ text: 'Šifra delatnosti: ', bold: true }, data.user.activityCode ?? '—'] },
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
                                    { text: 'Redni\nbroj', rowSpan: 2, alignment: 'center', bold: true, margin: [0, 4, 0, 4] as [number, number, number, number] },
                                    { text: 'Datum i opis knjiženja\n(broj fakture, naziv kupca)', rowSpan: 2, alignment: 'center', bold: true, margin: [0, 4, 0, 4] as [number, number, number, number] },
                                    { text: 'Iznos ostvarenog prihoda u RSD', colSpan: 2, alignment: 'center', bold: true, margin: [0, 4, 0, 4] as [number, number, number, number] },
                                    {},
                                    { text: 'Ukupan prihod u RSD\n(kol. 3 + 4)', rowSpan: 2, alignment: 'right', bold: true, margin: [0, 4, 0, 4] as [number, number, number, number] },
                                ],
                                [
                                    '',
                                    '',
                                    { text: 'od prodaje\nproizvoda (3)', alignment: 'right', bold: true, fontSize: 8 },
                                    { text: 'od pružanja\nusluga (4)', alignment: 'right', bold: true, fontSize: 8 },
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
                                    { text: 'SVEGA:', colSpan: 2, alignment: 'right', bold: true, margin: [0, 4, 8, 4] as [number, number, number, number] },
                                    {},
                                    { text: this.formatCurrency(totalProducts), alignment: 'right', bold: true, margin: [0, 4, 0, 4] as [number, number, number, number] },
                                    { text: this.formatCurrency(totalServices), alignment: 'right', bold: true, margin: [0, 4, 0, 4] as [number, number, number, number] },
                                    { text: this.formatCurrency(data.totalYearly), alignment: 'right', bold: true, margin: [0, 4, 0, 4] as [number, number, number, number] },
                                ],
                            ],
                        },
                        layout: {
                            hLineWidth: (i: number, node: { table: { body: unknown[] } }) =>
                                i === 0 || i === 1 ? 0.5 : i === node.table.body.length ? 1 : 0.25,
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
                                    { text: 'Dana: _____________________________', margin: [0, 10, 0, 0] as [number, number, number, number] },
                                ],
                            },
                            {
                                width: 250,
                                alignment: 'center',
                                stack: [
                                    { text: ' ', margin: [0, 0, 0, 40] as [number, number, number, number] },
                                    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 0.5, lineColor: COLORS.border }] },
                                    { text: 'M.P. (Potpis preduzetnika)', margin: [0, 6, 0, 0] as [number, number, number, number], fontSize: 9 },
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
