import { Currency } from './enums';

export interface IBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  swiftCode?: string | null;
  iban?: string | null;
  currency: Currency;
  isDefault: boolean;
}

export interface ICreateBankAccountRequest {
  bankName: string;
  accountNumber: string;
  swiftCode?: string;
  iban?: string;
  currency: Currency;
  isDefault?: boolean;
}

export interface IUpdateBankAccountRequest {
  bankName?: string;
  accountNumber?: string;
  swiftCode?: string;
  iban?: string;
  currency?: Currency;
  isDefault?: boolean;
}
