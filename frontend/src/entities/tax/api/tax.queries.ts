import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  ICreateTaxObligationRequest,
  IMarkTaxPaidRequest,
  IUpdateTaxObligationRequest,
} from "@preduzetnik/shared";
import { taxesApi } from "@/shared/api/taxes.api";
import { monthsNeedingAttention } from "../lib/tax-status";

export const taxKeys = {
  all: ["taxes"] as const,
  obligations: () => [...taxKeys.all, "obligations"] as const,
  calendar: (year: number) => [...taxKeys.all, "calendar", year] as const,
};

export const useTaxObligations = () =>
  useQuery({ queryKey: taxKeys.obligations(), queryFn: taxesApi.getObligations });

export const useTaxCalendar = (year: number) =>
  useQuery({ queryKey: taxKeys.calendar(year), queryFn: () => taxesApi.getCalendar(year) });

const useInvalidateTaxes = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: taxKeys.all });
};

export const useCreateTaxObligation = () => {
  const invalidate = useInvalidateTaxes();
  return useMutation({
    mutationFn: (dto: ICreateTaxObligationRequest) => taxesApi.createObligation(dto),
    onSuccess: invalidate,
  });
};

export const useUpdateTaxObligation = () => {
  const invalidate = useInvalidateTaxes();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: IUpdateTaxObligationRequest }) => taxesApi.updateObligation(id, dto),
    onSuccess: invalidate,
  });
};

export const useDeleteTaxObligation = () => {
  const invalidate = useInvalidateTaxes();
  return useMutation({ mutationFn: (id: string) => taxesApi.deleteObligation(id), onSuccess: invalidate });
};

export const useMarkTaxPaid = () => {
  const invalidate = useInvalidateTaxes();
  return useMutation({ mutationFn: (dto: IMarkTaxPaidRequest) => taxesApi.markPaid(dto), onSuccess: invalidate });
};

export const useUnmarkTaxPaid = () => {
  const invalidate = useInvalidateTaxes();
  return useMutation({ mutationFn: (paymentId: string) => taxesApi.unmarkPaid(paymentId), onSuccess: invalidate });
};

/** Unpaid tax months that are overdue or due soon; last year is included so December's taxes show up in January */
export const useTaxMonthsNeedingAttention = (today = new Date()) => {
  const year = today.getFullYear();
  const previous = useTaxCalendar(year - 1);
  const current = useTaxCalendar(year);
  const months = [...(previous.data?.months ?? []), ...(current.data?.months ?? [])];
  return {
    months: monthsNeedingAttention(months, today),
    isLoading: previous.isLoading || current.isLoading,
  };
};
