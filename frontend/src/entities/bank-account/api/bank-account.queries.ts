import { useQuery } from "@tanstack/react-query";
import { bankAccountApi } from "@/shared/api/bank-account.api";

export const bankAccountKeys = {
  all: ["bank-accounts"] as const,
};

export const useBankAccounts = () => {
  return useQuery({
    queryKey: bankAccountKeys.all,
    queryFn: bankAccountApi.getAll,
  });
};
