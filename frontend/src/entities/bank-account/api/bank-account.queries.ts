import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bankAccountApi } from "@/shared/api/bank-account.api";
import type { ICreateBankAccountRequest, IUpdateBankAccountRequest } from "@preduzetnik/shared";

export const bankAccountKeys = {
  all: ["bank-accounts"] as const,
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: bankAccountKeys.all,
    queryFn: bankAccountApi.getAll,
  });
};

export const useCreateBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: ICreateBankAccountRequest) => bankAccountApi.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
    },
  });
};

export const useUpdateBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateBankAccountRequest }) =>
      bankAccountApi.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
    },
  });
};

export const useDeleteBankAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => bankAccountApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bankAccountKeys.all });
    },
  });
};
