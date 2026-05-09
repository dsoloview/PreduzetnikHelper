import { apiClient } from "./api.client";

export interface IBankAccount {
  id: string;
  bankName: string;
  accountNumber: string;
  currency: string;
  isDefault: boolean;
}

export const bankAccountApi = {
  getAll: async (): Promise<IBankAccount[]> => {
    const response = await apiClient.get<IBankAccount[]>('/bank-accounts');
    return response.data;
  },
};
