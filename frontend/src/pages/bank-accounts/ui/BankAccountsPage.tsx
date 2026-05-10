import { useTranslation } from "react-i18next";
import { useBankAccounts } from "@/entities/bank-account/api/bank-account.queries";
import { BankAccountCard } from "@/entities/bank-account/ui/BankAccountCard";
import { CreateBankAccountDialog } from "@/features/bank-account-management/ui/CreateBankAccountDialog";

export const BankAccountsPage = () => {
  const { t } = useTranslation();
  const { data: accounts, isLoading, error } = useBankAccounts();

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("nav.bankAccounts")}</h1>
          <p className="text-muted-foreground">{t("bankAccounts.subtitle")}</p>
        </div>
        <CreateBankAccountDialog />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-destructive">{t("bankAccounts.loadError")}</p>
        </div>
      ) : accounts?.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed rounded-lg space-y-4">
          <p className="text-muted-foreground">{t("bankAccounts.empty")}</p>
          <CreateBankAccountDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts?.map((account) => (
            <BankAccountCard key={account.id} account={account} />
          ))}
        </div>
      )}
    </div>
  );
};
