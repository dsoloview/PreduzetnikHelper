import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { InvoiceForm } from "./InvoiceForm";
import type { InvoiceFormValues } from "./InvoiceForm";
import { useUpdateInvoice } from "@/entities/invoice/api/invoice.queries";
import type { IInvoiceResponse, ICreateInvoiceRequest } from "@preduzetnik/shared";

interface EditInvoiceDialogProps {
  invoice: IInvoiceResponse;
}

export const EditInvoiceDialog = ({ invoice }: EditInvoiceDialogProps) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useUpdateInvoice();

  const defaultValues: Partial<InvoiceFormValues> = {
    clientId: invoice.clientId,
    bankAccountId: invoice.bankAccountId,
    issueDate: new Date(invoice.issueDate),
    dueDate: new Date(invoice.dueDate),
    placeOfIssue: invoice.placeOfIssue ?? "Beograd",
    domesticSupply: invoice.domesticSupply,
    currency: invoice.currency as "RSD" | "EUR" | "USD",
    exchangeRate: invoice.exchangeRate ?? undefined,
    items: invoice.items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    note: invoice.note ?? undefined,
  };

  const onSubmit = (data: ICreateInvoiceRequest) => {
    mutate(
      { id: invoice.id, dto: data },
      {
        onSuccess: () => {
          toast.success(t("invoices.edit.success"));
          setOpen(false);
        },
        onError: (error: unknown) => {
          const axiosError = error as { response?: { data?: { message?: string } } };
          toast.error(axiosError.response?.data?.message ?? t("invoices.edit.error"));
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("invoices.edit.title")} #{invoice.displayNumber}</DialogTitle>
          <DialogDescription>
            {t("invoices.edit.description")}
          </DialogDescription>
        </DialogHeader>
        <InvoiceForm
          onSubmit={onSubmit}
          defaultValues={defaultValues}
          isLoading={isPending}
          submitLabel={t("invoices.edit.submit")}
        />
      </DialogContent>
    </Dialog>
  );
};
