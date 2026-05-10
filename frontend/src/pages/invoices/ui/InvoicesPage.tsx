import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useInvoices, useDeleteInvoice } from "@/entities/invoice/api/invoice.queries";
import { CreateInvoiceDialog } from "@/features/invoice-management/ui/CreateInvoiceDialog";
import { InvoiceStatusSelect } from "@/entities/invoice/ui/InvoiceStatusSelect";
import { EditInvoiceDialog } from "@/features/invoice-management/ui/EditInvoiceDialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Badge } from "@/shared/ui/badge";
import { FileDown, Trash2, X } from "lucide-react";
import { format } from "date-fns";
import { invoiceApi } from "@/shared/api/invoice.api";
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
import type { InvoiceStatus } from "@preduzetnik/shared";

const ALL_STATUSES: InvoiceStatus[] = ["DRAFT", "SENT", "PAID", "CANCELLED"];

export const InvoicesPage = () => {
  const { t } = useTranslation();
  const { data: invoices = [], isLoading } = useInvoices();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | null>(null);

  const filtered = useMemo(() => {
    let result = invoices;
    if (statusFilter) result = result.filter((inv) => inv.status === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.clientName.toLowerCase().includes(q) ||
          inv.displayNumber.toLowerCase().includes(q),
      );
    }
    return result;
  }, [invoices, statusFilter, search]);

  const totalRsd = useMemo(
    () => filtered.reduce((sum, inv) => sum + inv.totalRsd, 0),
    [filtered],
  );

  const hasFilters = !!statusFilter || !!search.trim();

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
        toast.success(t("invoices.delete.success"));
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
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.invoices")}</h1>
          <p className="text-muted-foreground">{t("invoices.subtitle")}</p>
        </div>
        <CreateInvoiceDialog />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder={t("invoices.filter.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-64 h-9"
        />
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant={statusFilter === null ? "secondary" : "ghost"}
            onClick={() => setStatusFilter(null)}
          >
            {t("invoices.filter.all")}
          </Button>
          {ALL_STATUSES.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "secondary" : "ghost"}
              onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            >
              {t(`invoices.status.${s.toLowerCase()}`)}
            </Button>
          ))}
        </div>
        {hasFilters && (
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
            onClick={() => { setSearch(""); setStatusFilter(null); }}
          >
            <X className="size-3.5 mr-1" />
            {t("invoices.filter.clearFilters")}
          </Button>
        )}
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
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t("invoices.empty")}
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {t("invoices.noResults")}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium font-mono">{invoice.displayNumber}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{format(new Date(invoice.issueDate), "dd.MM.yyyy")}</TableCell>
                  <TableCell>
                    {invoice.totalAmount.toLocaleString()} {invoice.currency}
                    {invoice.currency !== "RSD" && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({invoice.totalRsd.toLocaleString("sr-RS", { maximumFractionDigits: 0 })} RSD)
                      </span>
                    )}
                  </TableCell>
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

      {/* Total row */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex justify-end">
          <Badge variant="outline" className="text-sm px-4 py-1.5 font-mono">
            {t("invoices.total", {
              amount: totalRsd.toLocaleString("sr-RS", { maximumFractionDigits: 0 }),
            })}
          </Badge>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("invoices.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("invoices.delete.description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "..." : t("invoices.delete.button")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

