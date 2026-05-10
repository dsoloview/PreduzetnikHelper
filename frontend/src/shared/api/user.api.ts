import { apiClient } from "./api.client";
import type { IUserResponse, IUpdateUserRequest } from "@preduzetnik/shared";

export const userApi = {
  getProfile: async (): Promise<IUserResponse> => {
    const response = await apiClient.get<IUserResponse>("/users/profile");
    return response.data;
  },

  updateProfile: async (dto: IUpdateUserRequest): Promise<IUserResponse> => {
    const response = await apiClient.patch<IUserResponse>("/users/profile", dto);
    return response.data;
  },
};
