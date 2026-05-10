import { useState } from "react";
import type { IBankAccount } from "@preduzetnik/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { MoreVertical, Pencil, Trash2, Landmark } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { EditBankAccountDialog } from "@/features/bank-account-management/ui/EditBankAccountDialog";
import { DeleteBankAccountDialog } from "@/features/bank-account-management/ui/DeleteBankAccountDialog";

interface BankAccountCardProps {
  account: IBankAccount;
}

export const BankAccountCard = ({ account }: BankAccountCardProps) => {
  const { t } = useTranslation();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <Card className="relative">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <Landmark className="size-5 text-muted-foreground" />
              <div>
                <CardTitle className="text-base font-semibold">{account.bankName}</CardTitle>
                <p className="text-sm text-muted-foreground font-mono">{account.accountNumber}</p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("bankAccounts.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("bankAccounts.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{account.currency}</Badge>
            {account.isDefault && (
              <Badge variant="default">{t("bankAccounts.default")}</Badge>
            )}
          </div>
          {account.swiftCode && (
            <p className="text-xs text-muted-foreground">
              SWIFT: <span className="font-mono">{account.swiftCode}</span>
            </p>
          )}
          {account.iban && (
            <p className="text-xs text-muted-foreground">
              IBAN: <span className="font-mono">{account.iban}</span>
            </p>
          )}
        </CardContent>
      </Card>

      <EditBankAccountDialog
        account={account}
        open={showEdit}
        onOpenChange={setShowEdit}
      />
      <DeleteBankAccountDialog
        account={account}
        open={showDelete}
        onOpenChange={setShowDelete}
      />
    </>
  );
};
