import { apiClient } from "./api.client";
import type { IInvoiceResponse, ICreateInvoiceRequest } from "@preduzetnik/shared";

export const invoiceApi = {
  getAll: async (): Promise<IInvoiceResponse[]> => {
    const response = await apiClient.get<IInvoiceResponse[]>('/invoices');
    return response.data;
  },
  getById: async (id: string): Promise<IInvoiceResponse> => {
    const response = await apiClient.get<IInvoiceResponse>(`/invoices/${id}`);
    return response.data;
  },
  create: async (data: ICreateInvoiceRequest): Promise<IInvoiceResponse> => {
    const response = await apiClient.post<IInvoiceResponse>('/invoices', data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/invoices/${id}`);
  },
  downloadPdf: async (id: string, filename: string): Promise<void> => {
    const response = await apiClient.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
    const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },
};

