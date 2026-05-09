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
import type { InvoiceFormValues } from "./CreateInvoiceForm";
import { useCreateInvoice } from "@/entities/invoice/api/invoice.queries";

export const CreateInvoiceDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateInvoice();

  const onSubmit = (data: InvoiceFormValues) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(t("invoices.create.success", { defaultValue: "Invoice created successfully!" }));
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create invoice");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("invoices.create.button", { defaultValue: "Create Invoice" })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("invoices.create.title", { defaultValue: "Create New Invoice" })}</DialogTitle>
          <DialogDescription>
            {t("invoices.create.description", { defaultValue: "Fill in the details to issue a new invoice." })}
          </DialogDescription>
        </DialogHeader>
        <CreateInvoiceForm onSubmit={onSubmit} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
};
