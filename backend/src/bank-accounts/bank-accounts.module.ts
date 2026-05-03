import { Module } from '@nestjs/common';
import { BankAccountsService } from './bank-accounts.service';

@Module({
  providers: [BankAccountsService],
  exports: [BankAccountsService]
})
export class BankAccountsModule {}
