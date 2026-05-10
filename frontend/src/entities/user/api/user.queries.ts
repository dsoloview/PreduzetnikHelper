import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "@/shared/api/user.api";
import type { IUpdateUserRequest, IChangePasswordRequest } from "@preduzetnik/shared";

export const userKeys = {
  profile: ["user", "profile"] as const,
};

export const useProfile = () => {
  return useQuery({
    queryKey: userKeys.profile,
    queryFn: userApi.getProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: IUpdateUserRequest) => userApi.updateProfile(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (dto: IChangePasswordRequest) => userApi.changePassword(dto),
  });
};
