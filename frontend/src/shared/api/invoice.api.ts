import { apiClient } from "./api.client";
import type { IInvoice, ICreateInvoiceRequest } from "@preduzetnik/shared";

export const invoiceApi = {
  getAll: async (): Promise<IInvoice[]> => {
    const response = await apiClient.get<IInvoice[]>('/invoices');
    return response.data;
  },
  getById: async (id: string): Promise<IInvoice> => {
    const response = await apiClient.get<IInvoice>(`/invoices/${id}`);
    return response.data;
  },
  create: async (data: ICreateInvoiceRequest): Promise<IInvoice> => {
    const response = await apiClient.post<IInvoice>('/invoices', data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },
  getDownloadUrl: (id: string) => {
    return `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/invoices/${id}/pdf`;
  },
};
