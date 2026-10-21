import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLimits } from "@/entities/limits/api/limits.queries";
import { useInvoices } from "@/entities/invoice/api/invoice.queries";
import { summarizeInvoices } from "@/entities/invoice/lib/summary";
import { useTaxMonthsNeedingAttention } from "@/entities/tax/api/tax.queries";
import { LimitCard } from "@/entities/limits/ui/LimitCard";
import { RecentInvoicesList } from "@/entities/invoice/ui/RecentInvoicesList";
import { TopClientsList } from "@/entities/client/ui/TopClientsList";
import { DashboardStatsRow } from "@/widgets/dashboard/ui/DashboardStatsRow";
import { AttentionList } from "@/widgets/dashboard/ui/AttentionList";
import { ProfileCompletenessAlert } from "@/widgets/profile-completeness/ui/ProfileCompletenessAlert";
import { PageContainer, PageHeader } from "@/shared/ui/page-header";
import { SectionHeader } from "@/shared/ui/section-header";
import { Skeleton } from "@/shared/ui/skeleton";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const { data: limits, isLoading: limitsLoading } = useLimits();
  const { data: invoices = [], isLoading: invoicesLoading } = useInvoices();
  const summary = useMemo(() => summarizeInvoices(invoices), [invoices]);
  const taxes = useTaxMonthsNeedingAttention();

  return (
    <PageContainer>
      <PageHeader title={t("dashboard.title")} description={t("dashboard.subtitle")} />

      <ProfileCompletenessAlert />

      <DashboardStatsRow summary={summary} limits={limits} isLoading={invoicesLoading || limitsLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <AttentionList invoices={invoices} taxMonths={taxes.months} isLoading={invoicesLoading || taxes.isLoading} />
          <RecentInvoicesList invoices={invoices} isLoading={invoicesLoading} />
        </div>

        <div className="space-y-6">
          <section className="space-y-3">
            <SectionHeader title={t("dashboard.limits.title")} linkTo="/limits" linkLabel={t("dashboard.limits.viewAll")} />
            {limitsLoading ? (
              [1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)
            ) : limits ? (
              <div className="space-y-3">
                <LimitCard title={t("limits.pausal.title")} status={limits.pausalLimit} compact />
                <LimitCard title={t("limits.vat.title")} status={limits.vatLimit} compact />
              </div>
            ) : null}
          </section>
          <TopClientsList invoices={invoices} isLoading={invoicesLoading} />
        </div>
      </div>
    </PageContainer>
  );
};
