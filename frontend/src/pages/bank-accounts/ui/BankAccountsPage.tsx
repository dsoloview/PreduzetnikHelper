import { useTranslation } from "react-i18next";
import { useBankAccounts } from "@/entities/bank-account/api/bank-account.queries";
import { BankAccountCard } from "@/entities/bank-account/ui/BankAccountCard";
import { PageContainer, PageHeader } from "@/shared/ui/page-header";
import { CreateBankAccountDialog } from "@/features/bank-account-management/ui/CreateBankAccountDialog";

export const BankAccountsPage = () => {
  const { t } = useTranslation();
  const { data: accounts, isLoading, error } = useBankAccounts();

  return (
    <PageContainer>
      <PageHeader title={t("nav.bankAccounts")} description={t("bankAccounts.subtitle")} actions={<CreateBankAccountDialog />} />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border border-dashed rounded-xl">
          <p className="text-destructive">{t("bankAccounts.loadError")}</p>
        </div>
      ) : accounts?.length === 0 ? (
        <div className="text-center py-24 border border-dashed rounded-xl space-y-4">
          <p className="text-muted-foreground">{t("bankAccounts.empty")}</p>
          <CreateBankAccountDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts?.map((account) => (
            <BankAccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
