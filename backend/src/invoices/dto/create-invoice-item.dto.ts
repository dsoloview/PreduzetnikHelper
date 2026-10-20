import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, MaxLength } from 'class-validator';
import { MAX_LENGTH } from '../../common/validation/max-length';
import { ICreateInvoiceItemRequest } from '@preduzetnik/shared';

export class CreateInvoiceItemDto implements ICreateInvoiceItemRequest {
  @ApiProperty({ example: 'Web development services — May 2026' })
  @IsNotEmpty()
  @MaxLength(MAX_LENGTH.description)
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
