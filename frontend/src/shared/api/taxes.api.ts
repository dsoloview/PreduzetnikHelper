import { apiClient } from "./api.client";
import type {
  ICreateTaxObligationRequest,
  IMarkTaxPaidRequest,
  ITaxCalendarResponse,
  ITaxObligation,
  IUpdateTaxObligationRequest,
} from "@preduzetnik/shared";

export const taxesApi = {
  getObligations: async (): Promise<ITaxObligation[]> => {
    const response = await apiClient.get<ITaxObligation[]>("/taxes/obligations");
    return response.data;
  },

  createObligation: async (dto: ICreateTaxObligationRequest): Promise<ITaxObligation> => {
    const response = await apiClient.post<ITaxObligation>("/taxes/obligations", dto);
    return response.data;
  },

  updateObligation: async (id: string, dto: IUpdateTaxObligationRequest): Promise<ITaxObligation> => {
    const response = await apiClient.patch<ITaxObligation>(`/taxes/obligations/${id}`, dto);
    return response.data;
  },

  deleteObligation: async (id: string): Promise<void> => {
    await apiClient.delete(`/taxes/obligations/${id}`);
  },

  getCalendar: async (year: number): Promise<ITaxCalendarResponse> => {
    const response = await apiClient.get<ITaxCalendarResponse>("/taxes/calendar", { params: { year } });
    return response.data;
  },

  markPaid: async (dto: IMarkTaxPaidRequest): Promise<void> => {
    await apiClient.post("/taxes/payments", dto);
  },

  unmarkPaid: async (paymentId: string): Promise<void> => {
    await apiClient.delete(`/taxes/payments/${paymentId}`);
  },
};
