import { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import type { ITaxCalendarItem, ITaxCalendarMonth } from "@preduzetnik/shared";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Spinner } from "@/shared/ui/spinner";
import { QrCode } from "@/shared/ui/qr-code";
import { useFormatters } from "@/shared/lib/format";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { useMarkTaxPaid } from "@/entities/tax/api/tax.queries";
import { formatIsoDate, formatTaxPeriod } from "@/entities/tax/lib/period";

const CopyRow = ({ label, value }: { label: string; value: string }) => {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error(t("taxes.pay.copyFailed"));
    }
  };

  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-medium tabular-nums">{value}</dd>
      </div>
      <Button type="button" variant="ghost" size="icon" className="size-8 shrink-0" onClick={copy} aria-label={t("taxes.pay.copy", { field: label })}>
        {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
};

interface PayTaxDialogProps {
  month: ITaxCalendarMonth;
  item: ITaxCalendarItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PayTaxDialog = ({ month, item, open, onOpenChange }: PayTaxDialogProps) => {
  const { t } = useTranslation();
  const { locale, money, number } = useFormatters();
  const [paidAt, setPaidAt] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const { mutate, isPending } = useMarkTaxPaid();

  const markPaid = () => {
    mutate(
      { obligationId: item.obligationId, year: month.year, month: month.month, paidAt },
      {
        onSuccess: () => {
          toast.success(t("taxes.pay.marked"));
          onOpenChange(false);
        },
        onError: (error) => toast.error(getApiErrorMessage(error, t("taxes.errors.markFailed"))),
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{item.name}</DialogTitle>
          <DialogDescription>
            {t("taxes.pay.description", {
              period: formatTaxPeriod(month.year, month.month, locale),
              date: formatIsoDate(month.dueDate),
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 sm:grid-cols-[13rem_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-52 space-y-2">
            {item.ipsQr ? (
              <>
                <QrCode value={item.ipsQr} label={t("taxes.pay.qrLabel")} className="w-full border" />
                <p className="text-center text-xs text-muted-foreground">{t("taxes.pay.qrHint")}</p>
              </>
            ) : (
              <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{t("taxes.pay.noQr")}</p>
            )}
          </div>

          <div className="min-w-0 space-y-4">
            <div>
              <p className="text-xs text-muted-foreground">{t("taxes.pay.amount")}</p>
              <p className="text-2xl font-semibold tracking-tight">{money(item.amount, "RSD", { decimals: 2 })}</p>
            </div>
            <dl className="divide-y rounded-lg border px-3">
              <CopyRow label={t("taxes.form.recipientName")} value={item.recipientName} />
              <CopyRow label={t("taxes.form.recipientAccount")} value={item.recipientAccount} />
              <CopyRow label={t("taxes.pay.amount")} value={number(item.amount, 2)} />
              <CopyRow label={t("taxes.pay.modelReference")} value={`${item.model} ${item.reference}`} />
              <CopyRow label={t("taxes.form.paymentCode")} value={item.paymentCode} />
              <CopyRow label={t("taxes.form.purpose")} value={item.purpose} />
            </dl>
          </div>
        </div>

        <DialogFooter className="flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="grid gap-1.5">
            <Label htmlFor="tax-paid-at">{t("taxes.pay.paidAt")}</Label>
            <Input id="tax-paid-at" type="date" value={paidAt} onChange={(event) => setPaidAt(event.target.value)} className="sm:w-44" />
          </div>
          <Button onClick={markPaid} disabled={isPending || !paidAt}>
            {isPending && <Spinner className="mr-2" />}
            {t("taxes.pay.markPaid")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
