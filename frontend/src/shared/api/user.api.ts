import { apiClient } from "./api.client";
import type { IUserResponse, IUpdateUserRequest, IChangePasswordRequest } from "@preduzetnik/shared";

export const userApi = {
  getProfile: async (): Promise<IUserResponse> => {
    const response = await apiClient.get<IUserResponse>("/users/profile");
    return response.data;
  },

  updateProfile: async (dto: IUpdateUserRequest): Promise<IUserResponse> => {
    const response = await apiClient.patch<IUserResponse>("/users/profile", dto);
    return response.data;
  },

  changePassword: async (dto: IChangePasswordRequest): Promise<void> => {
    await apiClient.patch("/users/change-password", dto);
  },
};
