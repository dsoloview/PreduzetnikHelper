import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ITaxObligation } from "@preduzetnik/shared";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { useCreateTaxObligation, useUpdateTaxObligation } from "@/entities/tax/api/tax.queries";
import { ObligationForm } from "./ObligationForm";
import { obligationToValues, valuesToRequest, type ObligationFormValues } from "../lib/obligation-form";

interface ObligationDialogProps {
  obligation?: ITaxObligation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ObligationDialog = ({ obligation, open, onOpenChange }: ObligationDialogProps) => {
  const { t } = useTranslation();
  const create = useCreateTaxObligation();
  const update = useUpdateTaxObligation();
  const isEdit = !!obligation;

  const onSubmit = (values: ObligationFormValues) => {
    const dto = valuesToRequest(values);
    const callbacks = {
      onSuccess: () => {
        toast.success(t(isEdit ? "taxes.obligations.updated" : "taxes.obligations.created"));
        onOpenChange(false);
      },
      onError: (error: unknown) => toast.error(getApiErrorMessage(error, t("taxes.errors.saveFailed"))),
    };
    if (obligation) update.mutate({ id: obligation.id, dto }, callbacks);
    else create.mutate(dto, callbacks);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t(isEdit ? "taxes.obligations.editTitle" : "taxes.obligations.createTitle")}</DialogTitle>
          <DialogDescription>{t("taxes.obligations.dialogDescription")}</DialogDescription>
        </DialogHeader>
        <ObligationForm
          key={obligation?.id ?? "new"}
          onSubmit={onSubmit}
          defaultValues={obligation ? obligationToValues(obligation) : undefined}
          isLoading={create.isPending || update.isPending}
        />
      </DialogContent>
    </Dialog>
  );
};
