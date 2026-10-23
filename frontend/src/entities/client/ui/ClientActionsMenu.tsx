import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FilePlus, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { IClient } from "@preduzetnik/shared";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { EditClientDialog } from "@/features/client-management/ui/EditClientDialog";
import { DeleteClientDialog } from "@/features/client-management/ui/DeleteClientDialog";

/** New invoice / edit / delete menu with its dialogs */
export const ClientActionsMenu = ({ client }: { client: IClient }) => {
  const { t } = useTranslation();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8" aria-label={t("clients.actions.menu")}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link to={`/invoices/new?clientId=${client.id}`}>
              <FilePlus className="mr-2 size-4" />
              {t("clients.actions.createInvoice")}
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowEdit(true)}>
            <Pencil className="mr-2 size-4" />
            {t("clients.actions.edit")}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDelete(true)} className="text-destructive focus:text-destructive">
            <Trash2 className="mr-2 size-4" />
            {t("clients.actions.delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditClientDialog client={client} open={showEdit} onOpenChange={setShowEdit} />
      <DeleteClientDialog client={client} open={showDelete} onOpenChange={setShowDelete} />
    </>
  );
};
