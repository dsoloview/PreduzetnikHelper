import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { useKpo } from "@/entities/kpo/api/kpo.queries";
import { kpoApi } from "@/shared/api/kpo.api";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Card } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";
import { PageContainer, PageHeader } from "@/shared/ui/page-header";
import { useFormatters } from "@/shared/lib/format";

export const KpoPage = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useKpo(year);
  const { number, money } = useFormatters();
  const formatRsd = (amount: number) => number(amount, 2);
  // A paušalac selling only services has nothing in the products column; hide it instead of a column of zeros
  const hasProducts = !!data?.entries.some((entry) => entry.productAmount !== 0);
  const columnCount = hasProducts ? 6 : 5;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await kpoApi.downloadPdf(year);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title={t("kpo.title")}
        description={t("kpo.subtitle")}
        actions={
          <Button
            variant="outline"
            disabled={downloading || isLoading || !data || data.entries.length === 0}
            onClick={handleDownload}
          >
            {downloading ? <Spinner className="mr-2" /> : <FileDown className="mr-2 size-4" />}
            {t("kpo.downloadPdf")}
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-lg border bg-card p-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => setYear((y) => y - 1)} aria-label={t("kpo.previousYear")}>
            <ChevronLeft className="size-4" />
          </Button>
          <span className="w-14 text-center font-semibold">{year}</span>
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= currentYear}
            aria-label={t("kpo.nextYear")}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        {data && (
          <div className="flex items-baseline gap-4 text-sm">
            <span className="text-muted-foreground">{t("kpo.entriesCount", { count: data.entries.length })}</span>
            <span>
              <span className="text-muted-foreground">{t("kpo.yearlyTotal", { year })}: </span>
              <span className="text-lg font-semibold">{money(data.totalYearly, "RSD", { decimals: 2 })}</span>
            </span>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && <p className="text-sm text-destructive">{t("kpo.loadError")}</p>}

      {data && (
        <Card className="gap-0 overflow-x-auto py-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-12 pl-4">{t("kpo.table.no")}</TableHead>
                <TableHead>{t("kpo.table.date")}</TableHead>
                <TableHead>{t("kpo.table.description")}</TableHead>
                {hasProducts && <TableHead className="text-right">{t("kpo.table.products")}</TableHead>}
                <TableHead className="text-right">{t("kpo.table.services")}</TableHead>
                <TableHead className="pr-4 text-right">{t("kpo.table.total")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.entries.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columnCount} className="py-12 text-center text-muted-foreground">
                    {t("kpo.empty")}
                  </TableCell>
                </TableRow>
              ) : (
                data.entries.map((entry) => (
                  <TableRow key={entry.sequenceNumber}>
                    <TableCell className="pl-4 text-muted-foreground">{entry.sequenceNumber}</TableCell>
                    <TableCell className="whitespace-nowrap">{format(new Date(entry.date), "dd.MM.yyyy")}</TableCell>
                    <TableCell className="min-w-64">{entry.description}</TableCell>
                    {hasProducts && <TableCell className="text-right">{formatRsd(entry.productAmount)}</TableCell>}
                    <TableCell className="text-right">{formatRsd(entry.serviceAmount)}</TableCell>
                    <TableCell className="pr-4 text-right font-medium">{formatRsd(entry.totalAmount)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      )}
    </PageContainer>
  );
};
