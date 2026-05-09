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

export const CreateClientDialog = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { mutate, isPending } = useCreateClient();

  const onSubmit = (data: ClientFormValues) => {
    mutate(data, {
      onSuccess: () => {
        toast.success(t("clients.create.success", { defaultValue: "Client created successfully!" }));
        setOpen(false);
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || "Failed to create client");
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          {t("clients.create.button", { defaultValue: "Add Client" })}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{t("clients.create.title", { defaultValue: "Add New Client" })}</DialogTitle>
          <DialogDescription>
            {t("clients.create.description", { defaultValue: "Add a new client to your list to issue invoices." })}
          </DialogDescription>
        </DialogHeader>
        <ClientForm onSubmit={onSubmit} isLoading={isPending} />
      </DialogContent>
    </Dialog>
  );
};
