import { apiClient } from "./api.client";
import type { ILimitsResponse } from "@preduzetnik/shared";

export const limitsApi = {
  get: async (): Promise<ILimitsResponse> => {
    const response = await apiClient.get<ILimitsResponse>("/limits");
    return response.data;
  },
};
