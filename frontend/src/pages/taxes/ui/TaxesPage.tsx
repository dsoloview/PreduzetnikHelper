import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarClock, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Pencil, Plus, QrCode, Trash2, Undo2, Wallet } from "lucide-react";
import { toast } from "sonner";
import type { ITaxCalendarItem, ITaxCalendarMonth, ITaxObligation } from "@preduzetnik/shared";

import { useTaxCalendar, useTaxObligations, useUnmarkTaxPaid } from "@/entities/tax/api/tax.queries";
import { getTaxMonthStatus, unpaidAmount } from "@/entities/tax/lib/tax-status";
import { formatIsoDate, formatTaxPeriod } from "@/entities/tax/lib/period";
import { TaxMonthStatusBadge } from "@/entities/tax/ui/TaxMonthStatusBadge";
import { ObligationDialog } from "@/features/tax-management/ui/ObligationDialog";
import { DeleteObligationDialog } from "@/features/tax-management/ui/DeleteObligationDialog";
import { PayTaxDialog } from "@/features/tax-management/ui/PayTaxDialog";
import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { StatTile } from "@/shared/ui/stat-tile";
import { SectionHeader } from "@/shared/ui/section-header";
import { PageContainer, PageHeader } from "@/shared/ui/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { useFormatters } from "@/shared/lib/format";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import { cn } from "@/shared/lib/utils";

const monthLabel = (year: number, month: number) => `${String(month).padStart(2, "0")}/${year}`;

const TaxItemRow = ({ item, onPay }: { item: ITaxCalendarItem; onPay: () => void }) => {
  const { t } = useTranslation();
  const { money } = useFormatters();
  const unmark = useUnmarkTaxPaid();

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.name}</p>
        <p className={cn("text-xs", item.payment ? "text-success-strong" : "text-muted-foreground")}>
          {item.payment ? t("taxes.month.paidOn", { date: formatIsoDate(item.payment.paidAt) }) : money(item.amount, "RSD", { decimals: 2 })}
        </p>
      </div>
      {item.payment ? (
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          disabled={unmark.isPending}
          aria-label={t("taxes.month.unmark")}
          title={t("taxes.month.unmark")}
          onClick={() =>
            unmark.mutate(item.payment!.id, {
              onError: (error) => toast.error(getApiErrorMessage(error, t("taxes.errors.markFailed"))),
            })
          }
        >
          <Undo2 className="size-4" />
        </Button>
      ) : (
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onPay}>
          <QrCode className="size-4" />
          {t("taxes.month.pay")}
        </Button>
      )}
    </li>
  );
};

interface MonthCardProps {
  month: ITaxCalendarMonth;
  defaultExpanded: boolean;
  onPay: (item: ITaxCalendarItem) => void;
}

const MonthCard = ({ month, defaultExpanded, onPay }: MonthCardProps) => {
  const { t } = useTranslation();
  const { locale, money } = useFormatters();
  const status = getTaxMonthStatus(month);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const total = month.items.reduce((sum, item) => sum + item.amount, 0);
  const period = formatTaxPeriod(month.year, month.month, locale);

  return (
    <Card className={cn("gap-0 py-0", status === "overdue" && "border-destructive/40")}>
      <button
        type="button"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
        className={cn(
          "flex items-start justify-between gap-2 rounded-t-xl px-4 py-3 text-left transition-colors hover:bg-muted/40",
          expanded ? "border-b" : "rounded-b-xl",
        )}
      >
        <div>
          <h3 className="font-semibold">{period.charAt(0).toUpperCase() + period.slice(1)}</h3>
          <p className="text-xs text-muted-foreground">
            {t("taxes.month.due", { date: formatIsoDate(month.dueDate) })} · {money(total, "RSD", { decimals: 2 })}
          </p>
        </div>
        <span className="flex items-center gap-1">
          <TaxMonthStatusBadge status={status} />
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", expanded && "rotate-180")} />
        </span>
      </button>
      {expanded && (
        <ul className="divide-y">
          {month.items.map((item) => (
            <TaxItemRow key={item.obligationId} item={item} onPay={() => onPay(item)} />
          ))}
        </ul>
      )}
    </Card>
  );
};

export const TaxesPage = () => {
  const { t } = useTranslation();
  const { money } = useFormatters();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [editing, setEditing] = useState<ITaxObligation | "new" | null>(null);
  const [deleting, setDeleting] = useState<ITaxObligation | null>(null);
  const [paying, setPaying] = useState<{ month: ITaxCalendarMonth; item: ITaxCalendarItem } | null>(null);

  const obligations = useTaxObligations();
  const calendar = useTaxCalendar(year);
  const months = useMemo(() => calendar.data?.months ?? [], [calendar.data]);

  const stats = useMemo(() => {
    const items = months.flatMap((month) => month.items);
    const paid = items.filter((item) => item.payment).reduce((sum, item) => sum + item.amount, 0);
    const unpaid = months.reduce((sum, month) => sum + unpaidAmount(month), 0);
    const overdue = months.filter((month) => getTaxMonthStatus(month) === "overdue");
    const next = months.find((month) => getTaxMonthStatus(month) !== "paid");
    return { paid, unpaid, overdue, next };
  }, [months]);

  const hasObligations = (obligations.data?.length ?? 0) > 0;
  const addButton = (
    <Button className="gap-2" onClick={() => setEditing("new")}>
      <Plus className="size-4" />
      {t("taxes.obligations.add")}
    </Button>
  );

  return (
    <PageContainer>
      <PageHeader title={t("taxes.title")} description={t("taxes.subtitle")} actions={hasObligations ? addButton : undefined} />

      {obligations.isLoading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : obligations.isError ? (
        <p className="text-sm text-destructive">{t("taxes.loadError")}</p>
      ) : !hasObligations ? (
        <div className="space-y-4 rounded-xl border border-dashed px-6 py-16 text-center">
          <CalendarClock className="mx-auto size-10 text-muted-foreground" />
          <div className="mx-auto max-w-md space-y-1">
            <p className="font-medium">{t("taxes.empty.title")}</p>
            <p className="text-sm text-muted-foreground">{t("taxes.empty.description")}</p>
          </div>
          {addButton}
        </div>
      ) : (
        <>
          <div className="flex items-center gap-1 self-start rounded-lg border bg-card p-1 w-fit">
            <Button variant="ghost" size="icon" className="size-8" onClick={() => setYear((y) => y - 1)} aria-label={t("kpo.previousYear")}>
              <ChevronLeft className="size-4" />
            </Button>
            <span className="w-14 text-center font-semibold">{year}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setYear((y) => y + 1)}
              disabled={year > currentYear}
              aria-label={t("kpo.nextYear")}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatTile
              label={t("taxes.stats.paid", { year })}
              value={money(stats.paid, "RSD")}
              icon={CheckCircle2}
              tone="success"
              isLoading={calendar.isLoading}
            />
            <StatTile
              label={t("taxes.stats.unpaid", { year })}
              value={money(stats.unpaid, "RSD")}
              hint={stats.overdue.length > 0 ? t("taxes.stats.overdueMonths", { count: stats.overdue.length }) : undefined}
              icon={Wallet}
              tone={stats.overdue.length > 0 ? "danger" : "default"}
              isLoading={calendar.isLoading}
            />
            <StatTile
              label={t("taxes.stats.next")}
              value={stats.next ? formatIsoDate(stats.next.dueDate) : "—"}
              hint={stats.next ? `${monthLabel(stats.next.year, stats.next.month)} · ${money(unpaidAmount(stats.next), "RSD")}` : t("taxes.stats.allPaid")}
              icon={CalendarClock}
              tone="info"
              isLoading={calendar.isLoading}
            />
          </div>

          {calendar.isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
            </div>
          ) : calendar.isError ? (
            <p className="text-sm text-destructive">{t("taxes.loadError")}</p>
          ) : months.length === 0 ? (
            <p className="rounded-xl border border-dashed py-12 text-center text-sm text-muted-foreground">{t("taxes.noMonths", { year })}</p>
          ) : (
            <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
              {months.map((month) => (
                <MonthCard
                  key={month.month}
                  month={month}
                  // Open what needs paying now: overdue and due-soon months, or else the next unpaid one
                  defaultExpanded={["overdue", "dueSoon"].includes(getTaxMonthStatus(month)) || month === stats.next}
                  onPay={(item) => setPaying({ month, item })}
                />
              ))}
            </div>
          )}

          <section className="space-y-3">
            <SectionHeader title={t("taxes.obligations.title")} />
            <Card className="gap-0 overflow-x-auto py-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-4">{t("taxes.form.name")}</TableHead>
                    <TableHead className="text-right">{t("taxes.form.amount")}</TableHead>
                    <TableHead>{t("taxes.form.recipientAccount")}</TableHead>
                    <TableHead>{t("taxes.obligations.period")}</TableHead>
                    <TableHead className="w-24 pr-4" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {obligations.data?.map((obligation) => (
                    <TableRow key={obligation.id}>
                      <TableCell className="pl-4 font-medium">{obligation.name}</TableCell>
                      <TableCell className="text-right whitespace-nowrap">{money(obligation.amount, "RSD", { decimals: 2 })}</TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{obligation.recipientAccount}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {monthLabel(obligation.startYear, obligation.startMonth)} –{" "}
                        {obligation.endYear && obligation.endMonth
                          ? monthLabel(obligation.endYear, obligation.endMonth)
                          : t("taxes.obligations.ongoing")}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditing(obligation)} aria-label={t("app.edit")}>
                            <Pencil className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="size-8" onClick={() => setDeleting(obligation)} aria-label={t("app.delete")}>
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </section>
        </>
      )}

      <ObligationDialog
        obligation={editing && editing !== "new" ? editing : undefined}
        open={editing !== null}
        onOpenChange={(open) => !open && setEditing(null)}
      />
      {deleting && <DeleteObligationDialog obligation={deleting} open onOpenChange={(open) => !open && setDeleting(null)} />}
      {paying && (
        <PayTaxDialog
          key={`${paying.month.month}-${paying.item.obligationId}`}
          month={paying.month}
          item={paying.item}
          open
          onOpenChange={(open) => !open && setPaying(null)}
        />
      )}
    </PageContainer>
  );
};
