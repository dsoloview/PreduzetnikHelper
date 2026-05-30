import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { ClientForm } from "./ClientForm";
import type { ClientFormValues } from "./ClientForm";
import { useCreateClient } from "@/entities/client/api/client.queries";
import { getApiErrorMessage } from "@/shared/lib/api-error";

export const CreateClientDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateClient();

  const onSubmit = (data: ClientFormValues) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(t("clients.create.success"));
        setOpen(false);
      },
      onError: (error) => {
        toast.error(getApiErrorMessage(error, t("errors.createClientFailed")));
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("clients.create.button")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("clients.create.title")}</DialogTitle>
          <DialogDescription>
            {t("clients.create.description")}
          </DialogDescription>
        </DialogHeader>
        <ClientForm onSubmit={onSubmit} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
};
