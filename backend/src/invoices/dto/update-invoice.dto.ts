import {ApiPropertyOptional} from '@nestjs/swagger';
import {
    IsDateString, IsOptional, IsBoolean,
    IsEnum, IsNumber, IsString, IsUUID, ValidateNested, ArrayMinSize,
} from 'class-validator';
import {Type} from 'class-transformer';
import {IUpdateInvoiceRequest} from '@preduzetnik/shared';
import type {InvoiceStatus, Currency} from '@preduzetnik/shared';
import { InvoiceStatus as InvoiceStatusEnum, Currency as CurrencyEnum } from '../../generated/prisma/enums';
import {CreateInvoiceItemDto} from './create-invoice-item.dto';

export class UpdateInvoiceDto implements IUpdateInvoiceRequest {
    @ApiPropertyOptional({example: 'uuid'})
    @IsOptional()
    @IsUUID()
    clientId?: string;

    @ApiPropertyOptional({example: 'uuid'})
    @IsOptional()
    @IsUUID()
    bankAccountId?: string;

    @ApiPropertyOptional({enum: InvoiceStatusEnum})
    @IsOptional()
    @IsEnum(InvoiceStatusEnum)
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

    @ApiPropertyOptional({enum: CurrencyEnum})
    @IsOptional()
    @IsEnum(CurrencyEnum)
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
