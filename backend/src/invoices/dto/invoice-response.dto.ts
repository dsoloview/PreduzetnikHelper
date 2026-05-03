import {ApiProperty, ApiPropertyOptional} from '@nestjs/swagger';
import {IInvoiceResponse, IInvoiceItemResponse} from '@preduzetnik/shared';
import type {InvoiceStatus, Currency} from '@preduzetnik/shared';

export class InvoiceItemResponseDto implements IInvoiceItemResponse {
    @ApiProperty()
    id: string;

    @ApiProperty({example: 'Web development services'})
    description: string;

    @ApiProperty({example: 1})
    quantity: number;

    @ApiProperty({example: 1500})
    unitPrice: number;

    @ApiProperty({example: 1500})
    total: number;
}

export class InvoiceResponseDto implements IInvoiceResponse {
    @ApiProperty()
    id: string;

    @ApiProperty({example: 1})
    invoiceNumber: number;

    @ApiProperty({example: 2026})
    year: number;

    @ApiProperty({example: '1/2026'})
    displayNumber: string;

    @ApiProperty({enum: ['DRAFT', 'SENT', 'PAID', 'CANCELLED']})
    status: InvoiceStatus;

    @ApiProperty()
    clientId: string;

    @ApiProperty({example: 'Acme Corp'})
    clientName: string;

    @ApiProperty({example: '2026-05-03'})
    issueDate: string;

    @ApiProperty({example: '2026-06-03'})
    dueDate: string;

    @ApiProperty({example: 'Beograd'})
    placeOfIssue: string;

    @ApiProperty({example: true})
    domesticSupply: boolean;

    @ApiProperty({enum: ['RSD', 'EUR', 'USD']})
    currency: Currency;

    @ApiPropertyOptional({example: 117.5})
    exchangeRate: number | null;

    @ApiProperty({example: 1500})
    totalAmount: number;

    @ApiProperty({example: 176250})
    totalRsd: number;

    @ApiPropertyOptional()
    note: string | null;

    @ApiProperty()
    bankAccountId: string;

    @ApiProperty({type: [InvoiceItemResponseDto]})
    items: InvoiceItemResponseDto[];

    @ApiProperty()
    createdAt: Date;
}
