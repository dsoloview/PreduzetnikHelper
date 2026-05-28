import { Injectable, InternalServerErrorException, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import DOMPurify from 'isomorphic-dompurify';
import type { IPdfService, InvoicePdfData, KpoPdfData } from './pdf.interface';

@Injectable()
export class PuppeteerPdfService implements IPdfService, OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PuppeteerPdfService.name);
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
            this.logger.log('Puppeteer browser launched successfully.');
        } catch (error) {
            this.logger.error('Failed to launch Puppeteer on startup', error);
        }
    }

    async onModuleDestroy() {
        if (this.browser) {
            await this.browser.close();
            this.logger.log('Puppeteer browser closed.');
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

    private static readonly ALLOWED_TEMPLATES = ['invoice', 'kpo'] as const;

    private async compileTemplate(templateName: string, data: unknown): Promise<string> {
        if (!(PuppeteerPdfService.ALLOWED_TEMPLATES as readonly string[]).includes(templateName)) {
            throw new InternalServerErrorException('Unknown PDF template');
        }

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
            this.logger.error('Template compilation error', error);
            throw new InternalServerErrorException('Failed to compile PDF template');
        }
    }

    private async renderToPdf(html: string, landscape = false): Promise<Buffer> {
        if (!this.browser) {
            throw new InternalServerErrorException('PDF generation service is not initialized');
        }

        let page: puppeteer.Page | null = null;

        try {
            page = await this.browser.newPage();
            // Set CSP to prevent any script execution during PDF generation
            await page.setExtraHTTPHeaders({
                'Content-Security-Policy': "default-src 'none'; script-src 'none'; object-src 'none'; style-src 'unsafe-inline';"
            });
            await page.setContent(html, { waitUntil: 'domcontentloaded' });

            const pdfBuffer = await page.pdf({
                format: 'A4',
                landscape,
                printBackground: true,
                margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' },
            });

            return Buffer.from(pdfBuffer);
        } finally {
            if (page) {
                await page.close().catch(err => this.logger.error('Error closing page', err));
            }
        }
    }

    async generateInvoicePdf(data: InvoicePdfData): Promise<Buffer> {
        this.logger.debug(`Generating invoice PDF for invoice: ${data.displayNumber}`);
        try {
            const sanitizedData = this.sanitizeInvoiceData(data);
            const html = await this.compileTemplate('invoice', sanitizedData);
            return this.renderToPdf(html, false);
        } catch (error) {
            this.logger.error('Invoice PDF generation failed', error);
            throw new InternalServerErrorException('Failed to generate PDF');
        }
    }

    async generateKpoPdf(data: KpoPdfData): Promise<Buffer> {
        this.logger.debug(`Generating KPO PDF for year: ${data.year}`);
        try {
            const sanitizedData = this.sanitizeKpoData(data);
            const html = await this.compileTemplate('kpo', sanitizedData);
            return this.renderToPdf(html, true);
        } catch (error) {
            this.logger.error('KPO PDF generation failed', error);
            throw new InternalServerErrorException('Failed to generate KPO PDF');
        }
    }

    private sanitizeInvoiceData(data: InvoicePdfData): InvoicePdfData {
        return {
            ...data,
            user: {
                ...data.user,
                name: DOMPurify.sanitize(data.user.name),
                companyName: data.user.companyName ? DOMPurify.sanitize(data.user.companyName) : null,
                address: data.user.address ? DOMPurify.sanitize(data.user.address) : null,
                postalCode: data.user.postalCode ? DOMPurify.sanitize(data.user.postalCode) : null,
                city: data.user.city ? DOMPurify.sanitize(data.user.city) : null,
                pib: data.user.pib ? DOMPurify.sanitize(data.user.pib) : null,
                mbr: data.user.mbr ? DOMPurify.sanitize(data.user.mbr) : null,
            },
            client: {
                ...data.client,
                name: DOMPurify.sanitize(data.client.name),
                address: data.client.address ? DOMPurify.sanitize(data.client.address) : null,
                postalCode: data.client.postalCode ? DOMPurify.sanitize(data.client.postalCode) : null,
                city: data.client.city ? DOMPurify.sanitize(data.client.city) : null,
                country: data.client.country ? DOMPurify.sanitize(data.client.country) : null,
                taxId: data.client.taxId ? DOMPurify.sanitize(data.client.taxId) : null,
                registrationNumber: data.client.registrationNumber ? DOMPurify.sanitize(data.client.registrationNumber) : null,
            },
            bankAccount: {
                ...data.bankAccount,
                bankName: DOMPurify.sanitize(data.bankAccount.bankName),
                accountNumber: DOMPurify.sanitize(data.bankAccount.accountNumber),
                swiftCode: data.bankAccount.swiftCode ? DOMPurify.sanitize(data.bankAccount.swiftCode) : null,
                iban: data.bankAccount.iban ? DOMPurify.sanitize(data.bankAccount.iban) : null,
            },
            note: data.note ? DOMPurify.sanitize(data.note) : null,
            items: data.items.map(item => ({
                ...item,
                description: DOMPurify.sanitize(item.description),
            })),
        };
    }

    private sanitizeKpoData(data: KpoPdfData): KpoPdfData {
        return {
            ...data,
            user: {
                ...data.user,
                name: DOMPurify.sanitize(data.user.name),
                companyName: data.user.companyName ? DOMPurify.sanitize(data.user.companyName) : null,
                address: data.user.address ? DOMPurify.sanitize(data.user.address) : null,
                city: data.user.city ? DOMPurify.sanitize(data.user.city) : null,
                pib: data.user.pib ? DOMPurify.sanitize(data.user.pib) : null,
                mbr: data.user.mbr ? DOMPurify.sanitize(data.user.mbr) : null,
                activityCode: data.user.activityCode ? DOMPurify.sanitize(data.user.activityCode) : null,
            },
            entries: data.entries.map(entry => ({
                ...entry,
                description: DOMPurify.sanitize(entry.description),
            })),
        };
    }
}
