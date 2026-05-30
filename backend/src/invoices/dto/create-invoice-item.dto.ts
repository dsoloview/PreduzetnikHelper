import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min } from 'class-validator';
import { ICreateInvoiceItemRequest } from '@preduzetnik/shared';

export class CreateInvoiceItemDto implements ICreateInvoiceItemRequest {
    @ApiProperty({ example: 'Web development services — May 2026' })
    @IsNotEmpty()
    description: string;

    @ApiProperty({ example: 1.5 })
    @IsNumber()
    @Min(0.01)
    quantity: number;

    @ApiProperty({ example: 150050 })
    @IsNumber()
    @Min(0)
    unitPrice: number;
}
