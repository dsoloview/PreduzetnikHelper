import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { ClientForm } from "./ClientForm";
import type { ClientFormValues } from "./ClientForm";
import { useUpdateClient } from "@/entities/client/api/client.queries";
import type { IClient } from "@preduzetnik/shared";

interface EditClientDialogProps {
  client: IClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EditClientDialog = ({ client, open, onOpenChange }: EditClientDialogProps) => {
  const { t } = useTranslation();
  const { mutate, isPending } = useUpdateClient(client.id);

  const onSubmit = (data: ClientFormValues) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(t("clients.edit.success"));
        onOpenChange(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to update client");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("clients.edit.title")}</DialogTitle>
          <DialogDescription>
            {t("clients.edit.description", { defaultValue: "Update the client's information." })}
          </DialogDescription>
        </DialogHeader>
        <ClientForm 
          onSubmit={onSubmit} 
          isLoading={isPending} 
          defaultValues={{
            ...client,
            email: client.email || "",
            phone: client.phone || "",
          }} 
        />
      </DialogContent>
    </Dialog>
  );
};
