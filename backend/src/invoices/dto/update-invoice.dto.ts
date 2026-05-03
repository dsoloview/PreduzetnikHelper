import {ApiPropertyOptional} from '@nestjs/swagger';
import {
    IsDateString, IsOptional, IsBoolean,
    IsEnum, IsNumber, IsString, ValidateNested, ArrayMinSize,
} from 'class-validator';
import {Type} from 'class-transformer';
import {IUpdateInvoiceRequest} from '@preduzetnik/shared';
import type {InvoiceStatus, Currency} from '@preduzetnik/shared';
import {CreateInvoiceItemDto} from './create-invoice-item.dto';

export class UpdateInvoiceDto implements IUpdateInvoiceRequest {
    @ApiPropertyOptional({enum: ['DRAFT', 'SENT', 'PAID', 'CANCELLED']})
    @IsOptional()
    @IsEnum(['DRAFT', 'SENT', 'PAID', 'CANCELLED'])
    status?: InvoiceStatus;

    @ApiPropertyOptional({example: '2026-05-03'})
    @IsOptional()
    @IsDateString()
    issueDate?: string;

    @ApiPropertyOptional({example: '2026-06-03'})
    @IsOptional()
    @IsDateString()
    dueDate?: string;

    @ApiPropertyOptional({example: 'Beograd'})
    @IsOptional()
    @IsString()
    placeOfIssue?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    domesticSupply?: boolean;

    @ApiPropertyOptional({example: 'Updated note'})
    @IsOptional()
    @IsString()
    note?: string;

    @ApiPropertyOptional({enum: ['RSD', 'EUR', 'USD']})
    @IsOptional()
    @IsEnum(['RSD', 'EUR', 'USD'])
    currency?: Currency;

    @ApiPropertyOptional({example: 117.5})
    @IsOptional()
    @IsNumber()
    exchangeRate?: number;

    @ApiPropertyOptional({type: [CreateInvoiceItemDto]})
    @IsOptional()
    @ValidateNested({each: true})
    @Type(() => CreateInvoiceItemDto)
    @ArrayMinSize(1)
    items?: CreateInvoiceItemDto[];
}
