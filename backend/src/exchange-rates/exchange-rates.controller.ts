import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import type { IExchangeRatesResponse } from '@preduzetnik/shared';
import {Public} from "../auth/helpers/auth.helpers";

@ApiTags('Exchange Rates')
@ApiBearerAuth()
@Controller('exchange-rates')
export class ExchangeRatesController {
    constructor(private readonly service: ExchangeRatesService) {}

    @Public()
    @Get()
    @ApiOperation({ summary: 'Get NBS exchange rates (EUR, USD) for a given date' })
    @ApiQuery({ name: 'date', required: false, description: 'ISO date (YYYY-MM-DD). Defaults to today.' })
    @ApiResponse({ status: 200, description: 'Exchange rates retrieved successfully' })
    async getRates(@Query('date') dateStr?: string): Promise<IExchangeRatesResponse> {
        const date = dateStr ? new Date(dateStr) : new Date();
        return this.service.getRatesForDate(date);
    }
}
