import { Inject, Injectable } from '@nestjs/common';
import { PDF_SERVICE, type IPdfService, type InvoicePdfData, type KpoPdfData } from './pdf.interface';

@Injectable()
export class PdfService {
    constructor(@Inject(PDF_SERVICE) private readonly impl: IPdfService) {}

    generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
        return this.impl.generateInvoicePdf(data);
    }

    generateKpoPdf(data: KpoPdfData): Promise<Buffer> {
        return this.impl.generateKpoPdf(data);
    }
}
