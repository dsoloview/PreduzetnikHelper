import { Module } from '@nestjs/common';
import { PdfService } from './pdf.service';
import { PuppeteerPdfService } from './puppeteer-pdf.service';
import { PdfmakePdfService } from './pdfmake-pdf.service';
import { PDF_SERVICE } from './pdf.interface';

const provider = process.env.PDF_PROVIDER === 'pdfmake' ? PdfmakePdfService : PuppeteerPdfService;

@Module({
    providers: [
        PdfService,
        { provide: PDF_SERVICE, useClass: provider },
    ],
    exports: [PdfService],
})
export class PdfModule {}
