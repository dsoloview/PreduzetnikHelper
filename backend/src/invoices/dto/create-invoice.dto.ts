import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsUUID, IsDateString, IsOptional, IsBoolean,
    IsEnum, IsNumber, IsString, ValidateNested, ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import type {Currency} from '@preduzetnik/shared';
import {ICreateInvoiceRequest} from '@preduzetnik/shared';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto implements ICreateInvoiceRequest {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    clientId: string;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @IsUUID()
    bankAccountId: string;

    @ApiProperty({ example: '2026-05-03' })
    @IsDateString()
    issueDate: string;

    @ApiProperty({ example: '2026-06-03' })
    @IsDateString()
    dueDate: string;

    @ApiPropertyOptional({ example: 'Beograd' })
    @IsOptional()
    @IsString()
    placeOfIssue?: string;

    @ApiPropertyOptional({ example: true, description: 'Auto-filled from client type if omitted' })
    @IsOptional()
    @IsBoolean()
    domesticSupply?: boolean;

    @ApiPropertyOptional({ enum: ['RSD', 'EUR', 'USD'], default: 'RSD' })
    @IsOptional()
    @IsEnum(['RSD', 'EUR', 'USD'])
    currency?: Currency;

    @ApiPropertyOptional({ example: 117.5, description: 'Required if currency is not RSD' })
    @IsOptional()
    @IsNumber()
    exchangeRate?: number;

    @ApiPropertyOptional({ example: 'Payment for web development services' })
    @IsOptional()
    @IsString()
    note?: string;

    @ApiProperty({ type: [CreateInvoiceItemDto] })
    @ValidateNested({ each: true })
    @Type(() => CreateInvoiceItemDto)
    @ArrayMinSize(1)
    items: CreateInvoiceItemDto[];
}
