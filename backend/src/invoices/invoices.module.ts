import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { ClientsModule } from '../clients/clients.module';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';

@Module({
  imports: [ClientsModule, BankAccountsModule],
  providers: [InvoicesService],
  controllers: [InvoicesController]
})
export class InvoicesModule {}
