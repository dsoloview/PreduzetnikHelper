import { useTranslation } from "react-i18next";
import { toast } from "sonner";

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
import { useDeleteClient } from "@/entities/client/api/client.queries";
import { Spinner } from "@/shared/ui/spinner";
import { getApiErrorMessage } from "@/shared/lib/api-error";
import type { IClient } from "@preduzetnik/shared";

interface DeleteClientDialogProps {
  client: IClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DeleteClientDialog = ({ client, open, onOpenChange }: DeleteClientDialogProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useDeleteClient();

  const onDelete = () => {
    mutate(client.id, {
      onSuccess: () => {
        toast.success(t("clients.delete.success"));
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, "Failed to delete client"));
      },
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("clients.delete.title")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("clients.delete.description", { name: client.name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{t("app.cancel", { defaultValue: "Cancel" })}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending && <Spinner className="mr-2" />}
            {t("clients.delete.button")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
