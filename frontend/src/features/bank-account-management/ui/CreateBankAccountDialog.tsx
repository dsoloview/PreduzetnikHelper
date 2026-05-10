import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { BankAccountForm } from "./BankAccountForm";
import type { BankAccountFormValues } from "./BankAccountForm";
import { useCreateBankAccount } from "@/entities/bank-account/api/bank-account.queries";

export const CreateBankAccountDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateBankAccount();

  const onSubmit = (data: BankAccountFormValues) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(t("bankAccounts.create.success"));
        setOpen(false);
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || "Failed to add bank account");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("bankAccounts.create.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{t("bankAccounts.create.title")}</DialogTitle>
          <DialogDescription>{t("bankAccounts.create.description")}</DialogDescription>
        </DialogHeader>
        <BankAccountForm onSubmit={onSubmit} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
};
