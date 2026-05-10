import { useQuery } from "@tanstack/react-query";
import { kpoApi } from "@/shared/api/kpo.api";

export const kpoKeys = {
  all: ["kpo"] as const,
  byYear: (year: number) => [...kpoKeys.all, year] as const,
};

export const useKpo = (year: number) => {
  return useQuery({
    queryKey: kpoKeys.byYear(year),
    queryFn: () => kpoApi.getByYear(year),
  });
};
