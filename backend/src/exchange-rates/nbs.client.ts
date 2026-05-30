import { Injectable, Logger } from '@nestjs/common';
import { Currency } from '../generated/prisma/enums';
import { formatSerbianDate } from '../common/utils';

export interface NbsRate {
    currencyCode: string;
    middleRate: number;
}

@Injectable()
export class NbsClient {
    private readonly logger = new Logger(NbsClient.name);
    private readonly NBS_SOAP_URL =
        'https://webservices.nbs.rs/CommunicationOfficeService1_0/ExchangeRateXmlService.asmx';
    private readonly SUPPORTED_CURRENCIES = [Currency.EUR, Currency.USD];

    async fetchRatesForDate(date: Date): Promise<NbsRate[]> {
        const formatted = formatSerbianDate(date);

        const body = this.buildSoapEnvelope(
            'GetExchangeRateByDate',
            `<com:date>${formatted}</com:date>
      <com:exchangeRateListTypeID>2</com:exchangeRateListTypeID>`,
        );

        this.logger.log(`Fetching NBS rates for ${formatted}`);

        const xml = await this.soapRequest('GetExchangeRateByDate', body);
        const html = this.extractResultHtml(xml, 'GetExchangeRateByDateResult');

        if (!html) {
            this.logger.warn(`Empty NBS result for ${formatted} — possibly a weekend/holiday`);
            return [];
        }

        return this.parseHtmlTable(html);
    }

    async fetchCurrentRates(): Promise<NbsRate[]> {
        const body = this.buildSoapEnvelope(
            'GetCurrentExchangeRate',
            '<com:exchangeRateListTypeID>2</com:exchangeRateListTypeID>',
        );

        this.logger.log('Fetching current NBS rates');

        const xml = await this.soapRequest('GetCurrentExchangeRate', body);
        const html = this.extractResultHtml(xml, 'GetCurrentExchangeRateResult');

        if (!html) {
            this.logger.warn('Empty NBS result for current rates');
            return [];
        }

        return this.parseHtmlTable(html);
    }

    private async soapRequest(method: string, body: string): Promise<string> {
        const action = `http://communicationoffice.nbs.rs/${method}`;
        const response = await fetch(this.NBS_SOAP_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                'SOAPAction': action,
            },
            body,
        });

        if (!response.ok) {
            const text = await response.text();
            this.logger.error(`NBS API returned ${response.status}: ${text.substring(0, 1500)}`);
            throw new Error(`NBS API error: ${response.status}`);
        }

        return response.text();
    }

    private buildSoapEnvelope(method: string, params: string): string {
        return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:com="http://communicationoffice.nbs.rs">
  <soap:Body>
    <com:${method}>
      ${params}
    </com:${method}>
  </soap:Body>
</soap:Envelope>`;
    }

    private extractResultHtml(xml: string, resultTag: string): string | null {
        const regex = new RegExp(`<${resultTag}>([\\s\\S]*?)</${resultTag}>`);
        const match = xml.match(regex);

        if (!match) {
            this.logger.debug(`Tag <${resultTag}> not found in response: ${xml.substring(0, 500)}`);
            return null;
        }

        const content = this.decodeXmlEntities(match[1]).trim();
        return content.length > 0 ? content : null;
    }

    private parseHtmlTable(html: string): NbsRate[] {
        const rates: NbsRate[] = [];

        for (const currency of this.SUPPORTED_CURRENCIES) {
            const rowRegex = new RegExp(
                `<tr[^>]*>(?:(?!</tr>)[\\s\\S])*?<td[^>]*>\\s*${currency}\\s*</td>(?:(?!</tr>)[\\s\\S])*?</tr>`,
                'i',
            );
            const rowMatch = html.match(rowRegex);

            if (!rowMatch) {
                this.logger.warn(`Currency ${currency} not found in NBS HTML table`);
                continue;
            }

            const cellValues: string[] = [];
            const tdRegex = /<td[^>]*>\s*([\s\S]*?)\s*<\/td>/gi;
            let tdMatch: RegExpExecArray | null;
            while ((tdMatch = tdRegex.exec(rowMatch[0])) !== null) {
                cellValues.push(tdMatch[1].trim());
            }

            const middleRate = this.extractMiddleRate(cellValues, currency);

            if (middleRate !== null) {
                rates.push({ currencyCode: currency, middleRate });
                this.logger.log(`${currency} srednji kurs: ${middleRate}`);
            } else {
                this.logger.warn(
                    `Could not extract middle rate for ${currency}. Cells: ${JSON.stringify(cellValues)}`,
                );
            }
        }

        return rates;
    }

    private extractMiddleRate(cellValues: string[], currency: string): number | null {
        const currencyIndex = cellValues.findIndex((v) => v === currency);
        if (currencyIndex === -1) return null;

        const numbersAfter: number[] = [];
        for (let i = currencyIndex + 1; i < cellValues.length; i++) {
            const num = this.parseSerbianDecimal(cellValues[i]);
            if (num !== null) {
                numbersAfter.push(num);
            }
        }

        if (numbersAfter.length >= 3) {
            return numbersAfter[2];
        }

        return numbersAfter.find((n) => n > 1) ?? null;
    }

    private parseSerbianDecimal(value: string): number | null {
        const cleaned = value.replace(/\s/g, '');
        if (!/^[\d.,]+$/.test(cleaned)) return null;

        const normalized = cleaned.replace(/\./g, '').replace(',', '.');
        const num = parseFloat(normalized);
        return isNaN(num) ? null : num;
    }

    private decodeXmlEntities(text: string): string {
        return text
            .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&apos;/g, "'");
    }
}
