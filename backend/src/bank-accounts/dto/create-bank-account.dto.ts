import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { Currency } from '@preduzetnik/shared';
import { Currency as CurrencyEnum } from '../../generated/prisma/enums';
import { ICreateBankAccountRequest } from '@preduzetnik/shared';

export class CreateBankAccountDto implements ICreateBankAccountRequest {
    @ApiProperty({ example: 'Banca Intesa' })
    @IsString()
    @IsNotEmpty()
    bankName: string;

    @ApiProperty({ example: '160-123456789012-95', description: 'Format: XXX-XXXXXXXXXX-XX' })
    @IsString()
    @IsNotEmpty()
    accountNumber: string;

    @ApiPropertyOptional({ example: 'BKBMRS22' })
    @IsOptional()
    @IsString()
    swiftCode?: string;

    @ApiPropertyOptional({ example: 'RS35160005080003520714' })
    @IsOptional()
    @IsString()
    iban?: string;

    @ApiProperty({ enum: CurrencyEnum, default: CurrencyEnum.RSD })
    @IsEnum(CurrencyEnum)
    currency: Currency;

    @ApiPropertyOptional({ example: true, description: 'Set as default account for invoices' })
    @IsOptional()
    @IsBoolean()
    isDefault?: boolean;
}
