import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { format } from "date-fns";
import { INVOICE_STATUSES, type InvoiceStatus } from "@preduzetnik/shared";
import { useUpdateInvoiceStatus } from "@/entities/invoice/api/invoice.queries";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import type { InvoiceDisplayStatus } from "../lib/display-status";
import { ChevronDown } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface InvoiceStatusSelectProps {
  invoiceId: string;
  status: InvoiceStatus;
  /** Shown on the trigger; differs from status for overdue invoices */
  displayStatus?: InvoiceDisplayStatus;
}

const today = () => format(new Date(), "yyyy-MM-dd");

export const InvoiceStatusSelect = ({ invoiceId, status, displayStatus = status }: InvoiceStatusSelectProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useUpdateInvoiceStatus();
  const [paidDialogOpen, setPaidDialogOpen] = useState(false);
  const [paidAt, setPaidAt] = useState(today);

  const options = INVOICE_STATUSES.filter((s) => s !== status);

  const changeStatus = (newStatus: InvoiceStatus, paidAtDate?: string) => {
    mutate(
      { id: invoiceId, status: newStatus, paidAt: paidAtDate },
      {
        onSuccess: () => {
          toast.success(t("invoices.status.updateSuccess"));
          setPaidDialogOpen(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, t("invoices.status.updateError"))),
      },
    );
  };

  const handleSelect = (newStatus: InvoiceStatus) => {
    if (newStatus === "PAID") {
      setPaidAt(today());
      setPaidDialogOpen(true);
      return;
    }
    changeStatus(newStatus);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            aria-label={t("invoices.status.change")}
            className="h-auto gap-0.5 rounded-full p-0 hover:bg-transparent focus-visible:ring-2"
          >
            <InvoiceStatusBadge status={displayStatus} />
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          {options.map((s) => (
            <DropdownMenuItem key={s} onClick={() => handleSelect(s)}>
              <InvoiceStatusBadge status={s} />
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={paidDialogOpen} onOpenChange={setPaidDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t("invoices.status.markPaidTitle")}</DialogTitle>
            <DialogDescription>{t("invoices.status.markPaidDescription")}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`paid-at-${invoiceId}`}>{t("invoices.status.paidAt")}</Label>
            <Input
              id={`paid-at-${invoiceId}`}
              type="date"
              value={paidAt}
              max={today()}
              onChange={(e) => setPaidAt(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaidDialogOpen(false)} disabled={isPending}>
              {t("app.cancel")}
            </Button>
            <Button onClick={() => changeStatus("PAID", paidAt)} disabled={isPending || !paidAt}>
              {isPending && <Spinner className="mr-2" />}
              {t("app.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
