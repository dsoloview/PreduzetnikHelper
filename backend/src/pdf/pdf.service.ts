import {Injectable, InternalServerErrorException, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class PdfService implements OnModuleInit, OnModuleDestroy {
    private compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();
    private browser: puppeteer.Browser | null = null;

    async onModuleInit() {
        this.registerHandlebarsHelpers();

        try {
            this.browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-extensions'
                ],
            });
            console.info('Puppeteer browser launched successfully.');
        } catch (error) {
            console.error('Failed to launch Puppeteer on startup:', error);
        }
    }

    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
            console.info('Puppeteer browser closed.');
        }
    }

    private registerHandlebarsHelpers() {
        handlebars.registerHelper('formatCurrency', function (value) {
            if (value === undefined || value === null) return '';
            return Number(value).toLocaleString('sr-RS', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        });

        handlebars.registerHelper('formatDate', function (dateString) {
            if (!dateString) return '';
            const date = new Date(dateString);
            return date.toLocaleDateString('sr-RS');
        });
    }

    private async compileTemplate(templateName: string, data: any): Promise<string> {
        try {
            let template = this.compiledTemplates.get(templateName);

            if (!template) {
                const templatePath = path.join(process.cwd(), 'src', 'pdf', 'templates', `${templateName}.hbs`);

                const templateHtml = await fs.readFile(templatePath, 'utf8');

                template = handlebars.compile(templateHtml);
                this.compiledTemplates.set(templateName, template);
            }

            return template(data);
        } catch (error) {
            console.error('Template compilation error:', error);
            throw new InternalServerErrorException('Failed to compile PDF template');
        }
    }

    async generateInvoicePdf(invoiceData: any): Promise<Buffer> {
        if (!this.browser) {
            throw new InternalServerErrorException('PDF generation service is not initialized');
        }

        let page: puppeteer.Page | null = null;

        try {
            const html = await this.compileTemplate('invoice', invoiceData);

            page = await this.browser.newPage();

            await page.setContent(html, { waitUntil: 'networkidle0' });

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

            return Buffer.from(pdfBuffer);
        } catch (error) {
            console.error('PDF generation error:', error);
            throw new InternalServerErrorException('Failed to generate PDF');
        } finally {
            if (page) {
                await page.close().catch(err => console.error('Error closing page:', err));
            }
        }
    }
}
