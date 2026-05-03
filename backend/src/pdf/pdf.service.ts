import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PdfService {
    private compileTemplate(templateName: string, data: any): string {
        try {
            const templatePath = path.join(process.cwd(), 'src', 'pdf', 'templates', `${templateName}.hbs`);
            const templateHtml = fs.readFileSync(templatePath, 'utf8');
            
            // Register a helper for formatting currency
            handlebars.registerHelper('formatCurrency', function(value) {
                if (value === undefined || value === null) return '';
                return Number(value).toLocaleString('sr-RS', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            });

            // Register helper for date formatting
            handlebars.registerHelper('formatDate', function(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('sr-RS');
            });

            const template = handlebars.compile(templateHtml);
            return template(data);
        } catch (error) {
            console.error('Template compilation error:', error);
            throw new InternalServerErrorException('Failed to compile PDF template');
        }
    }

    async generateInvoicePdf(invoiceData: any): Promise<Buffer> {
        try {
            const html = this.compileTemplate('invoice', invoiceData);

            // Launch Puppeteer
            const browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'], // Recommended for Docker/server environments
            });

            const page = await browser.newPage();
            
            // Set HTML content
            await page.setContent(html, { waitUntil: 'networkidle0' });

            // Generate PDF
            const pdfBuffer = await page.pdf({
                format: 'A4',
                printBackground: true,
                margin: {
                    top: '20px',
                    bottom: '20px',
                    left: '20px',
                    right: '20px',
                },
            });

            await browser.close();
            
            // Return as Buffer
            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('PDF generation error:', error);
            throw new InternalServerErrorException('Failed to generate PDF');
        }
    }
}
