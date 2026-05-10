import { useState } from "react";
import type { IClient } from "@preduzetnik/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { MapPin, Mail, Building2, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { EditClientDialog } from "@/features/client-management/ui/EditClientDialog";
import { DeleteClientDialog } from "@/features/client-management/ui/DeleteClientDialog";

interface ClientCardProps {
  client: IClient;
  onClick?: () => void;
}

export const ClientCard = ({ client, onClick }: ClientCardProps) => {
  const { t } = useTranslation();
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  return (
    <>
      <Card 
        className="cursor-pointer hover:border-primary transition-colors relative group"
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">{client.name}</CardTitle>
              <span className="text-xs px-2 py-1 rounded bg-secondary text-secondary-foreground">
                {t(`clients.type.${client.type.toLowerCase()}`)}
              </span>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowEdit(true)}>
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("clients.actions.edit")}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDelete(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("clients.actions.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Building2 className="size-4" />
            <span>{client.taxId}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="size-4" />
            <span>{client.city}, {client.country}</span>
          </div>
          {client.email && (
            <div className="flex items-center gap-2">
              <Mail className="size-4" />
              <span>{client.email}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <EditClientDialog 
        client={client} 
        open={showEdit} 
        onOpenChange={setShowEdit} 
      />
      <DeleteClientDialog 
        client={client} 
        open={showDelete} 
        onOpenChange={setShowDelete} 
      />
    </>
  );
};
