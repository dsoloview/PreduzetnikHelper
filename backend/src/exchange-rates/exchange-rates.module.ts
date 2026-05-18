import { Module } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesScheduler } from './exchange-rates.scheduler';
import { NbsClient } from './nbs.client';

@Module({
    providers: [ExchangeRatesService, NbsClient, ExchangeRatesScheduler],
    controllers: [ExchangeRatesController],
    exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
