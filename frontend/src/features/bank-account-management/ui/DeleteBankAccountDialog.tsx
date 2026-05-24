import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { IBankAccount } from "@preduzetnik/shared";

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
import { useDeleteBankAccount } from "@/entities/bank-account/api/bank-account.queries";
import { Spinner } from "@/shared/ui/spinner";
import { getApiErrorMessage } from "@/shared/lib/api-error";

interface DeleteBankAccountDialogProps {
  account: IBankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteBankAccountDialog = ({ account, open, onOpenChange }: DeleteBankAccountDialogProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useDeleteBankAccount();

  const onDelete = () => {
    mutate(account.id, {
      onSuccess: () => {
        toast.success(t("bankAccounts.delete.success"));
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to delete bank account"));
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("bankAccounts.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("bankAccounts.delete.description", {
              bankName: account.bankName,
              accountNumber: account.accountNumber,
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {t("app.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Spinner className="mr-2" />}
            {t("bankAccounts.delete.button")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
