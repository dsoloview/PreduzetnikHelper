import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import { ClientsModule } from './clients/clients.module';
import { InvoicesModule } from './invoices/invoices.module';
import { BankAccountsModule } from './bank-accounts/bank-accounts.module';
import { KpoModule } from './kpo/kpo.module';
import { LimitsModule } from './limits/limits.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule, AuthModule, UsersModule, ClientsModule, BankAccountsModule, InvoicesModule, KpoModule, LimitsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
