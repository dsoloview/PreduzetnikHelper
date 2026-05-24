import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";

import { useKpo } from "@/entities/kpo/api/kpo.queries";
import { kpoApi } from "@/shared/api/kpo.api";
import { Button } from "@/shared/ui/button";
import { Spinner } from "@/shared/ui/spinner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/skeleton";

const formatRsd = (amount: number) =>
  amount.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const KpoPage = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [downloading, setDownloading] = useState(false);

  const { data, isLoading, isError } = useKpo(year);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await kpoApi.downloadPdf(year);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("kpo.title")}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t("kpo.subtitle")}</p>
        </div>
        <Button
          variant="outline"
          disabled={downloading || isLoading || !data || data.entries.length === 0}
          onClick={handleDownload}
        >
          {downloading ? <Spinner className="mr-2" /> : <FileDown className="mr-2 size-4" />}
          {t("kpo.downloadPdf")}
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => setYear((y) => y - 1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <span className="text-lg font-semibold w-16 text-center">{year}</span>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setYear((y) => y + 1)}
          disabled={year >= currentYear}
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <p className="text-destructive text-sm">{t("kpo.loadError")}</p>
      )}

      {data && (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t("kpo.table.no")}</TableHead>
                  <TableHead>{t("kpo.table.date")}</TableHead>
                  <TableHead>{t("kpo.table.description")}</TableHead>
                  <TableHead className="text-right">{t("kpo.table.products")}</TableHead>
                  <TableHead className="text-right">{t("kpo.table.services")}</TableHead>
                  <TableHead className="text-right">{t("kpo.table.total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                      {t("kpo.empty")}
                    </TableCell>
                  </TableRow>
                ) : (
                  data.entries.map((entry) => (
                    <TableRow key={entry.sequenceNumber}>
                      <TableCell className="text-muted-foreground">{entry.sequenceNumber}</TableCell>
                      <TableCell>{format(new Date(entry.issueDate), "dd.MM.yyyy")}</TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRsd(entry.productAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {formatRsd(entry.serviceAmount)}
                      </TableCell>
                      <TableCell className="text-right font-mono font-medium">
                        {formatRsd(entry.totalAmount)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <Card className="ml-auto w-72">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t("kpo.yearlyTotal", { year })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatRsd(data.totalYearly)} RSD</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
