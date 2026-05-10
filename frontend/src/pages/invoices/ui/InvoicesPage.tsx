import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { CreateInvoiceDialog } from "@/features/invoice-management/ui/CreateInvoiceDialog";
import { InvoiceStatusSelect } from "@/entities/invoice/ui/InvoiceStatusSelect";
import { EditInvoiceDialog } from "@/features/invoice-management/ui/EditInvoiceDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { FileDown, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { invoiceApi } from "@/shared/api/invoice.api";
import { useDeleteInvoice } from "@/entities/invoice/api/invoice.queries";
import { toast } from "sonner";
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

export const InvoicesPage = () => {
  const { t } = useTranslation();
  const { data: invoices, isLoading } = useInvoices();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (id: string, displayNumber: string) => {
    setDownloadingId(id);
    try {
      await invoiceApi.downloadPdf(id, `invoice-${displayNumber}.pdf`);
    } catch {
      toast.error("Failed to download PDF");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteInvoice(deleteId, {
      onSuccess: () => {
        toast.success(t("invoices.delete.success", { defaultValue: "Invoice deleted." }));
        setDeleteId(null);
      },
      onError: (error: unknown) => {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || "Failed to delete invoice");
        setDeleteId(null);
      },
    });
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
                    <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} />
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    {invoice.status === "DRAFT" && (
                      <EditInvoiceDialog invoice={invoice} />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={downloadingId === invoice.id}
                      onClick={() => handleDownload(invoice.id, invoice.displayNumber)}
                    >
                      <FileDown className="h-4 w-4" />
                    </Button>
                    {invoice.status === "DRAFT" && (
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(invoice.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("invoices.delete.title", { defaultValue: "Delete Invoice" })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("invoices.delete.description", { defaultValue: "This action cannot be undone. The invoice will be permanently deleted." })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("app.cancel", { defaultValue: "Cancel" })}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "..." : t("invoices.delete.button", { defaultValue: "Delete" })}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

