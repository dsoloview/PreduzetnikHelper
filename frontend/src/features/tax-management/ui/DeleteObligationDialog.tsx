import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { ITaxObligation } from "@preduzetnik/shared";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/ui/alert-dialog";
import { Spinner } from "@/shared/ui/spinner";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { useDeleteTaxObligation } from "@/entities/tax/api/tax.queries";

interface DeleteObligationDialogProps {
  obligation: ITaxObligation;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteObligationDialog = ({ obligation, open, onOpenChange }: DeleteObligationDialogProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useDeleteTaxObligation();

  const onDelete = () => {
    mutate(obligation.id, {
      onSuccess: () => {
        toast.success(t("taxes.obligations.deleted"));
        onOpenChange(false);
      },
      onError: (error) => {
        const hasPayments = (error as { response?: { status?: number } }).response?.status === 409;
        toast.error(hasPayments ? t("taxes.obligations.deleteHasPayments") : getApiErrorMessage(error, t("taxes.errors.deleteFailed")));
        if (hasPayments) onOpenChange(false);
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("taxes.obligations.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("taxes.obligations.deleteDescription", { name: obligation.name })}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t("app.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault();
              onDelete();
            }}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Spinner className="mr-2" />}
            {t("app.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
