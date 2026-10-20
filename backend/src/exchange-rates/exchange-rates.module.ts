import { Module } from '@nestjs/common';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRatesController } from './exchange-rates.controller';
import { ExchangeRatesScheduler } from './exchange-rates.scheduler';
import { EXCHANGE_RATE_PROVIDER } from './exchange-rate-provider.interface';
import { KursResenjeClient } from './kurs-resenje.client';

@Module({
  providers: [
    ExchangeRatesService,
    ExchangeRatesScheduler,
    { provide: EXCHANGE_RATE_PROVIDER, useClass: KursResenjeClient },
  ],
  controllers: [ExchangeRatesController],
  exports: [ExchangeRatesService],
})
export class ExchangeRatesModule {}
