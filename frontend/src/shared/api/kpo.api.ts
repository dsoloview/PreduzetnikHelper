import { apiClient } from "./api.client";
import type { IKpoResponse } from "@preduzetnik/shared";

export const kpoApi = {
  getByYear: async (year: number): Promise<IKpoResponse> => {
    const response = await apiClient.get<IKpoResponse>("/kpo", { params: { year } });
    return response.data;
  },

  downloadPdf: async (year: number): Promise<void> => {
    const response = await apiClient.get("/kpo/pdf", {
      params: { year },
      responseType: "blob",
    });
    const url = URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `KPO-${year}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};
