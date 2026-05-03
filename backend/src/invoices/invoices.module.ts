import { Module } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { ClientsModule } from '../clients/clients.module';
import { BankAccountsModule } from '../bank-accounts/bank-accounts.module';
import { PdfModule } from '../pdf/pdf.module';

@Module({
  imports: [ClientsModule, BankAccountsModule, PdfModule],
  providers: [InvoicesService],
  controllers: [InvoicesController]
})
export class InvoicesModule {}
