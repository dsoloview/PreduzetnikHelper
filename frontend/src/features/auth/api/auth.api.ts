import { apiClient } from "@/shared/api/api.client";
import type { ILoginRequest, IAuthResponse, IRegisterRequest } from "@preduzetnik/shared";

export const authApi = {
  login: async (data: ILoginRequest): Promise<IAuthResponse> => {
    const response = await apiClient.post<IAuthResponse>('/auth/login', data);
    return response.data;
  },
  register: async (data: IRegisterRequest): Promise<void> => {
    await apiClient.post('/auth/register', data);
  },
};
