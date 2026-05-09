import { apiClient } from "./api.client";
import type { IClient, ICreateClientRequest } from "@preduzetnik/shared";

export const clientApi = {
  getAll: async (): Promise<IClient[]> => {
    const response = await apiClient.get<IClient[]>('/clients');
    return response.data;
  },
  getById: async (id: string): Promise<IClient> => {
    const response = await apiClient.get<IClient>(`/clients/${id}`);
    return response.data;
  },
  create: async (data: ICreateClientRequest): Promise<IClient> => {
    const response = await apiClient.post<IClient>('/clients', data);
    return response.data;
  },
  update: async (id: string, data: Partial<ICreateClientRequest>): Promise<IClient> => {
    const response = await apiClient.patch<IClient>(`/clients/${id}`, data);
    return response.data;
  },
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/clients/${id}`);
  },
};
