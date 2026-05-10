import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { IBankAccount } from "@preduzetnik/shared";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { BankAccountForm } from "./BankAccountForm";
import type { BankAccountFormValues } from "./BankAccountForm";
import { useUpdateBankAccount } from "@/entities/bank-account/api/bank-account.queries";

interface EditBankAccountDialogProps {
  account: IBankAccount;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditBankAccountDialog = ({ account, open, onOpenChange }: EditBankAccountDialogProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useUpdateBankAccount();

  const onSubmit = (data: BankAccountFormValues) => {
    mutate(
      { id: account.id, dto: data },
      {
        onSuccess: () => {
          toast.success(t("bankAccounts.edit.success"));
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: { message?: string } } };
          toast.error(axiosError.response?.data?.message || "Failed to update bank account");
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("bankAccounts.edit.title")}</DialogTitle>
          <DialogDescription>{account.bankName} — {account.accountNumber}</DialogDescription>
        </DialogHeader>
        <BankAccountForm
          onSubmit={onSubmit}
          isLoading={isPending}
          defaultValues={{
            bankName: account.bankName,
            accountNumber: account.accountNumber,
            swiftCode: account.swiftCode ?? "",
            iban: account.iban ?? "",
            currency: account.currency,
            isDefault: account.isDefault,
          }}
        />
      </DialogContent>
    </Dialog>
  );
};
