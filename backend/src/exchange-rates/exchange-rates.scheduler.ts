import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ExchangeRatesService } from './exchange-rates.service';

@Injectable()
export class ExchangeRatesScheduler {
    private readonly logger = new Logger(ExchangeRatesScheduler.name);

    constructor(private service: ExchangeRatesService) {}

    @Cron('0 30 8 * * 1-5')
    async fetchDailyRates() {
        this.logger.log('CRON: Fetching daily NBS exchange rates');
        try {
            const result = await this.service.getRatesForDate(new Date());
            this.logger.log(`CRON: Fetched ${result.rates.length} rates for ${result.date}`);
        } catch (error) {
            this.logger.error(`CRON: Failed to fetch daily rates: ${error}`);
        }
    }
}
