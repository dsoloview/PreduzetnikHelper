import { apiClient } from "./api.client";
import type { IBankAccount, ICreateBankAccountRequest, IUpdateBankAccountRequest } from "@preduzetnik/shared";

export const bankAccountApi = {
  getAll: async (): Promise<IBankAccount[]> => {
    const response = await apiClient.get<IBankAccount[]>('/bank-accounts');
    return response.data;
  },

  create: async (dto: ICreateBankAccountRequest): Promise<IBankAccount> => {
    const response = await apiClient.post<IBankAccount>('/bank-accounts', dto);
    return response.data;
  },

  update: async (id: string, dto: IUpdateBankAccountRequest): Promise<IBankAccount> => {
    const response = await apiClient.patch<IBankAccount>(`/bank-accounts/${id}`, dto);
    return response.data;
  },

  delete: async (id: string): Promise<IBankAccount> => {
    const response = await apiClient.delete<IBankAccount>(`/bank-accounts/${id}`);
    return response.data;
  },
};
