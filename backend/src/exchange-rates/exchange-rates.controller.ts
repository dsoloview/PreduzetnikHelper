import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import type { IExchangeRatesResponse } from '@preduzetnik/shared';
import { GetRatesQueryDto } from './dto/get-rates-query.dto';

@ApiTags('Exchange Rates')
@ApiBearerAuth()
@Controller('exchange-rates')
export class ExchangeRatesController {
    constructor(private readonly service: ExchangeRatesService) {}

    @Get()
    @ApiOperation({ summary: 'Get NBS exchange rates (EUR, USD) for a given date' })
    @ApiResponse({ status: 200, description: 'Exchange rates retrieved successfully' })
    async getRates(@Query() query: GetRatesQueryDto): Promise<IExchangeRatesResponse> {
        const date = query.date ? new Date(query.date) : new Date();
        return this.service.getRatesForDate(date);
    }
}
