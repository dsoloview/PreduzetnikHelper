import { ExecutionContext, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { KpoModule } from './kpo/kpo.module';
import { LimitsModule } from './limits/limits.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import type { Request } from 'express';

const requestPath = (ctx: ExecutionContext) =>
  ctx.switchToHttp().getRequest<Request>().path;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config: Record<string, unknown>) => {
        const required = ['DATABASE_URL', 'JWT_SECRET'];
        for (const key of required) {
          if (!config[key]) {
            throw new Error(`Missing required environment variable: ${key}`);
          }
        }
        return config;
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        { name: 'default', ttl: 60000, limit: 100 },
        {
          name: 'auth',
          ttl: 60000,
          // Overridable so e2e tests can sign up more users than a person would in a minute
          limit: Number(config.get('THROTTLE_AUTH_LIMIT', 10)),
          skipIf: (ctx) => !requestPath(ctx).startsWith('/api/auth/'),
        },
        {
          name: 'pdf',
          ttl: 60000,
          limit: 10,
          skipIf: (ctx) => !requestPath(ctx).endsWith('/pdf'),
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ClientsModule,
    BankAccountsModule,
    InvoicesModule,
    KpoModule,
    LimitsModule,
    ScheduleModule.forRoot(),
    ExchangeRatesModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
