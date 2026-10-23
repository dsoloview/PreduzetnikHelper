import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { CopyPlus, FileDown, FileText, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { IInvoiceResponse } from "@preduzetnik/shared";

import { useInvoices, useDeleteInvoice } from "@/entities/invoice/api/invoice.queries";
import { InvoiceStatusSelect } from "@/entities/invoice/ui/InvoiceStatusSelect";
import {
  DISPLAY_STATUSES,
  getDaysOverdue,
  getDisplayStatus,
  type InvoiceDisplayStatus,
} from "@/entities/invoice/lib/display-status";
import { ProfileCompletenessAlert } from "@/widgets/profile-completeness/ui/ProfileCompletenessAlert";
import { invoiceApi } from "@/shared/api/invoice.api";
import { cn } from "@/shared/lib/utils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Money } from "@/shared/ui/money";
import { Skeleton } from "@/shared/ui/skeleton";
import { Spinner } from "@/shared/ui/spinner";
import { PageContainer, PageHeader } from "@/shared/ui/page-header";
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

const formatDate = (iso: string) => format(new Date(iso), "dd.MM.yyyy");

const isDisplayStatus = (value: string | null): value is InvoiceDisplayStatus =>
  !!value && (DISPLAY_STATUSES as readonly string[]).includes(value);

interface RowActionsProps {
  invoice: IInvoiceResponse;
  isDownloading: boolean;
  onDownload: () => void;
  onDelete: () => void;
}

const RowActions = ({ invoice, isDownloading, onDownload, onDelete }: RowActionsProps) => {
  const { t } = useTranslation();
  const isDraft = invoice.status === "DRAFT";

  return (
    <div className="flex items-center justify-end gap-0.5">
      {isDraft && (
        <Button variant="ghost" size="icon" asChild>
          <Link to={`/invoices/${invoice.id}/edit`} aria-label={t("app.edit")} title={t("app.edit")}>
            <Pencil className="size-4" />
          </Link>
        </Button>
      )}
      <Button variant="ghost" size="icon" asChild>
        <Link to={`/invoices/new?from=${invoice.id}`} aria-label={t("invoices.actions.repeat")} title={t("invoices.actions.repeat")}>
          <CopyPlus className="size-4" />
        </Link>
      </Button>
      <Button
        variant="ghost"
        size="icon"
        disabled={isDownloading}
        onClick={onDownload}
        aria-label={t("invoices.actions.downloadPdf")}
        title={t("invoices.actions.downloadPdf")}
      >
        {isDownloading ? <Spinner className="size-4" /> : <FileDown className="size-4" />}
      </Button>
      {isDraft && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          aria-label={t("invoices.delete.button")}
          title={t("invoices.delete.button")}
        >
          <Trash2 className="size-4 text-destructive" />
        </Button>
      )}
    </div>
  );
};

/** The invoice amount, with its RSD value underneath for foreign currencies */
const AmountCell = ({ invoice, align = "right" }: { invoice: IInvoiceResponse; align?: "left" | "right" }) => (
  <div className={cn("flex flex-col", align === "right" ? "items-end" : "items-start")}>
    <Money amount={invoice.totalAmount} currency={invoice.currency} className="font-medium" />
    {invoice.currency !== "RSD" && (
      <Money amount={invoice.totalRsd} currency="RSD" className="text-xs text-muted-foreground" />
    )}
  </div>
);

/** Due date, turning red with the number of days once the invoice is overdue */
const DueDate = ({ invoice }: { invoice: IInvoiceResponse }) => {
  const { t } = useTranslation();
  const days = getDaysOverdue(invoice);
  return (
    <span className={cn(days > 0 && "text-destructive-strong")}>
      {formatDate(invoice.dueDate)}
      {days > 0 && <span className="block text-xs">{t("invoices.overdueDays", { days })}</span>}
    </span>
  );
};

export const InvoicesPage = () => {
  const { t } = useTranslation();
  const { data: invoices = [], isLoading } = useInvoices();
  const { mutate: deleteInvoice, isPending: isDeleting } = useDeleteInvoice();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // The status filter lives in the URL, so dashboard links like /invoices?status=OVERDUE open pre-filtered
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get("status");
  const statusFilter = isDisplayStatus(statusParam) ? statusParam : null;
  const setStatusFilter = (status: InvoiceDisplayStatus | null) => {
    const next = new URLSearchParams(searchParams);
    if (status) next.set("status", status);
    else next.delete("status");
    setSearchParams(next, { replace: true });
  };

  const statusCounts = useMemo(() => {
    const counts = Object.fromEntries(DISPLAY_STATUSES.map((s) => [s, 0])) as Record<InvoiceDisplayStatus, number>;
    for (const inv of invoices) counts[getDisplayStatus(inv)] += 1;
    return counts;
  }, [invoices]);

  const filtered = useMemo(() => {
    let result = invoices;
    if (statusFilter) result = result.filter((inv) => getDisplayStatus(inv) === statusFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) => inv.clientName.toLowerCase().includes(q) || inv.displayNumber.toLowerCase().includes(q),
      );
    }
    return result;
  }, [invoices, statusFilter, search]);

  const totalRsd = useMemo(() => filtered.reduce((sum, inv) => sum + inv.totalRsd, 0), [filtered]);

  /** Per-currency totals across the filtered set, besides the RSD-equivalent grand total */
  const foreignTotals = useMemo(() => {
    const byCurrency = new Map<string, number>();
    for (const inv of filtered) {
      if (inv.currency === "RSD") continue;
      byCurrency.set(inv.currency, (byCurrency.get(inv.currency) ?? 0) + inv.totalAmount);
    }
    return Array.from(byCurrency.entries());
  }, [filtered]);

  const hasFilters = !!statusFilter || !!search.trim();

  const handleDownload = async (id: string, displayNumber: string) => {
    setDownloadingId(id);
    try {
      await invoiceApi.downloadPdf(id, `invoice-${displayNumber}.pdf`);
    } catch {
      toast.error(t("errors.downloadPdfFailed"));
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
        toast.error(axiosError.response?.data?.message || t("errors.deleteInvoiceFailed"));
        setDeleteId(null);
      },
    });
  };

  const rowActions = (invoice: IInvoiceResponse) => (
    <RowActions
      invoice={invoice}
      isDownloading={downloadingId === invoice.id}
      onDownload={() => handleDownload(invoice.id, invoice.displayNumber)}
      onDelete={() => setDeleteId(invoice.id)}
    />
  );

  const statusCell = (invoice: IInvoiceResponse) => (
    <div className="flex flex-col items-start gap-1">
      <InvoiceStatusSelect invoiceId={invoice.id} status={invoice.status} displayStatus={getDisplayStatus(invoice)} />
      {invoice.paidAt && (
        <span className="text-xs text-muted-foreground">
          {t("invoices.status.paidOn", { date: formatDate(invoice.paidAt) })}
        </span>
      )}
    </div>
  );

  const emptyState = (
    <div className="flex flex-col items-center gap-2 py-12 text-center text-sm text-muted-foreground">
      <FileText className="size-8" />
      {invoices.length === 0 ? t("invoices.empty") : t("invoices.noResults")}
    </div>
  );

  return (
    <PageContainer>
      <PageHeader title={t("nav.invoices")} description={t("invoices.subtitle")} actions={
          <Button className="gap-2" asChild>
            <Link to="/invoices/new">
              <Plus className="size-4" />
              {t("invoices.create.button")}
            </Link>
          </Button>
        }
      />

      <ProfileCompletenessAlert />

      {/* Filters: search, then status chips with counts (scroll sideways on phones) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("invoices.filter.search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 pl-8"
          />
        </div>
        <div className="-mx-4 flex items-center gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 lg:pb-0">
          {([null, ...DISPLAY_STATUSES] as const).map((s) => {
            const active = statusFilter === s;
            const count = s ? statusCounts[s] : invoices.length;
            return (
              <button
                key={s ?? "all"}
                type="button"
                onClick={() => setStatusFilter(active ? null : s)}
                className={cn(
                  "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-sm transition-colors",
                  active
                    ? "border-primary bg-accent font-medium text-accent-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground",
                  s === "OVERDUE" && count > 0 && !active && "text-destructive-strong",
                )}
              >
                {s ? t(`invoices.status.${s.toLowerCase()}`) : t("invoices.filter.all")}
                <span className="text-xs opacity-70">{count}</span>
              </button>
            );
          })}
          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              className="shrink-0 text-muted-foreground"
              onClick={() => { setSearch(""); setStatusFilter(null); }}
            >
              <X className="mr-1 size-3.5" />
              {t("invoices.filter.clearFilters")}
            </Button>
          )}
        </div>
      </div>

      {/* Desktop: table */}
      <Card className="hidden gap-0 py-0 md:flex">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-4">{t("invoices.table.number")}</TableHead>
              <TableHead>{t("invoices.table.client")}</TableHead>
              <TableHead>{t("invoices.table.date")}</TableHead>
              <TableHead>{t("invoices.table.dueDate")}</TableHead>
              <TableHead className="text-right">{t("invoices.table.amount")}</TableHead>
              <TableHead>{t("invoices.table.status")}</TableHead>
              <TableHead className="pr-4 text-right">
                <span className="sr-only">{t("invoices.table.actions")}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell colSpan={7} className="px-4"><Skeleton className="h-8" /></TableCell>
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7}>{emptyState}</TableCell>
              </TableRow>
            ) : (
              filtered.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="pl-4 font-medium">{invoice.displayNumber}</TableCell>
                  <TableCell className="max-w-56 truncate">{invoice.clientName}</TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(invoice.issueDate)}</TableCell>
                  <TableCell className="text-muted-foreground"><DueDate invoice={invoice} /></TableCell>
                  <TableCell><AmountCell invoice={invoice} /></TableCell>
                  <TableCell>{statusCell(invoice)}</TableCell>
                  <TableCell className="pr-4">{rowActions(invoice)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Phones: one card per invoice */}
      <div className="space-y-2 md:hidden">
        {isLoading ? (
          [1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : filtered.length === 0 ? (
          <Card>{emptyState}</Card>
        ) : (
          filtered.map((invoice) => (
            <Card key={invoice.id} className="gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{invoice.clientName}</p>
                  <p className="text-xs text-muted-foreground">
                    {invoice.displayNumber} · {formatDate(invoice.issueDate)}
                  </p>
                </div>
                <AmountCell invoice={invoice} />
              </div>
              <div className="flex items-center justify-between gap-2">
                {statusCell(invoice)}
                {rowActions(invoice)}
              </div>
              {getDaysOverdue(invoice) > 0 && (
                <p className="text-xs text-destructive-strong">
                  {t("invoices.dueOn", { date: formatDate(invoice.dueDate) })} · {t("invoices.overdueDays", { days: getDaysOverdue(invoice) })}
                </p>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Totals for the current filter */}
      {!isLoading && filtered.length > 0 && (
        <div className="flex flex-wrap items-baseline justify-end gap-x-6 gap-y-1 text-sm">
          {foreignTotals.map(([currency, amount]) => (
            <span key={currency} className="text-muted-foreground">
              <Money amount={amount} currency={currency} />
            </span>
          ))}
          <span>
            <span className="text-muted-foreground">{t("invoices.totalLabel")}: </span>
            <Money amount={totalRsd} currency="RSD" className="font-semibold" />
          </span>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("invoices.delete.title")}</AlertDialogTitle>
            <AlertDialogDescription>{t("invoices.delete.description")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("app.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Spinner className="mr-2" />}
              {t("invoices.delete.button")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};
