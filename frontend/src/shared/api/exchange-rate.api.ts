import { apiClient } from "./api.client";
import type { IExchangeRatesResponse } from "@preduzetnik/shared";

export const exchangeRateApi = {
  getForDate: async (date: string): Promise<IExchangeRatesResponse> => {
    const response = await apiClient.get<IExchangeRatesResponse>("/exchange-rates", { params: { date } });
    return response.data;
  },
};
