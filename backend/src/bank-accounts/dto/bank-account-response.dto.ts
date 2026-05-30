import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Currency } from '@preduzetnik/shared';
import { Currency as CurrencyEnum } from '../../generated/prisma/enums';
import { IBankAccount } from '@preduzetnik/shared';

export class BankAccountResponseDto implements IBankAccount {
    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    id: string;

    @ApiProperty({ example: 'Banca Intesa' })
    bankName: string;

    @ApiProperty({ example: '160-123456789012-95' })
    accountNumber: string;

    @ApiPropertyOptional({ example: 'BKBMRS22' })
    swiftCode?: string | null;

    @ApiPropertyOptional({ example: 'RS35160005080003520714' })
    iban?: string | null;

    @ApiProperty({ enum: CurrencyEnum })
    currency: Currency;

    @ApiProperty({ example: true })
    isDefault: boolean;
}
