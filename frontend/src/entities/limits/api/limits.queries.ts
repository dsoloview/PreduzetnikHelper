import { useQuery } from "@tanstack/react-query";
import { limitsApi } from "@/shared/api/limits.api";

export const limitsKeys = {
  all: ["limits"] as const,
};

export const useLimits = () => {
  return useQuery({
    queryKey: limitsKeys.all,
    queryFn: limitsApi.get,
  });
};
