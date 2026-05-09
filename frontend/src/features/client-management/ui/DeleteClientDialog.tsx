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
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to delete client");
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
            {isPending ? "..." : t("clients.delete.button")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
