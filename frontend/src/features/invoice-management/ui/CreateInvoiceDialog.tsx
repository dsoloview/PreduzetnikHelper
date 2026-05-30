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
import { CreateInvoiceForm } from "./CreateInvoiceForm";
import { useCreateInvoice } from "@/entities/invoice/api/invoice.queries";
import type { ICreateInvoiceRequest } from "@preduzetnik/shared";

export const CreateInvoiceDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateInvoice();

  const onSubmit = (data: ICreateInvoiceRequest) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(t("invoices.create.success"));
        setOpen(false);
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || t("errors.createInvoiceFailed"));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("invoices.create.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("invoices.create.title")}</DialogTitle>
          <DialogDescription>
            {t("invoices.create.description")}
          </DialogDescription>
        </DialogHeader>
        <CreateInvoiceForm onSubmit={onSubmit} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
};
