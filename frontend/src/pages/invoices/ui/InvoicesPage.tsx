import { useTranslation } from "react-i18next";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { CreateInvoiceDialog } from "@/features/invoice-management/ui/CreateInvoiceDialog";
import { InvoiceStatusBadge } from "@/entities/invoice/ui/InvoiceStatusBadge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { FileDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { invoiceApi } from "@/shared/api/invoice.api";
import { useDeleteInvoice } from "@/entities/invoice/api/invoice.queries";
import { toast } from "sonner";

export const InvoicesPage = () => {
  const { t } = useTranslation();
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: deleteInvoice } = useDeleteInvoice();

  const handleDownload = (id: string) => {
    window.open(invoiceApi.getDownloadUrl(id), "_blank");
  };

  const handleDelete = (id: string) => {
    if (confirm(t("invoices.delete.confirm", { defaultValue: "Are you sure?" }))) {
      deleteInvoice(id, {
        onSuccess: () => toast.success(t("invoices.delete.success")),
      });
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.invoices")}</h1>
          <p className="text-muted-foreground">{t("invoices.subtitle", { defaultValue: "Manage your invoices and payments." })}</p>
        </div>
        <CreateInvoiceDialog />
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("invoices.table.number")}</TableHead>
              <TableHead>{t("invoices.table.client")}</TableHead>
              <TableHead>{t("invoices.table.date")}</TableHead>
              <TableHead>{t("invoices.table.amount")}</TableHead>
              <TableHead>{t("invoices.table.status")}</TableHead>
              <TableHead className="text-right">{t("invoices.table.actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6} className="h-12 animate-pulse bg-muted/50" />
                </TableRow>
              ))
            ) : invoices?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t("invoices.empty", { defaultValue: "No invoices found." })}
                </TableCell>
              </TableRow>
            ) : (
              invoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.displayNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{format(new Date(invoice.issueDate), "dd.MM.yyyy")}</TableCell>
                  <TableCell>{invoice.totalAmount.toLocaleString()} {invoice.currency}</TableCell>
                  <TableCell>
                    <InvoiceStatusBadge status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => handleDownload(invoice.id)}>
                      <FileDown className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(invoice.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
