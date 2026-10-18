import { useQuery } from "@tanstack/react-query";
import { exchangeRateApi } from "@/shared/api/exchange-rate.api";

export const exchangeRateKeys = {
  all: ["exchange-rates"] as const,
  byDate: (date: string) => [...exchangeRateKeys.all, date] as const,
};

/** NBS middle rates for a date (YYYY-MM-DD); a published rate list never changes, so it is cached for the session */
export const useExchangeRates = (date: string | undefined, enabled = true) => {
  return useQuery({
    queryKey: exchangeRateKeys.byDate(date ?? ""),
    queryFn: () => exchangeRateApi.getForDate(date!),
    enabled: enabled && !!date,
    staleTime: Infinity,
    retry: false,
  });
};
