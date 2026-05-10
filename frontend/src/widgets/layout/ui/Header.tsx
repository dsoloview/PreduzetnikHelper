import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { useProfile } from "@/entities/user/api/user.queries";
import { authApi } from "@/features/auth/api/auth.api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { LogOut, UserCircle } from "lucide-react";

export const Header = () => {
  const { t } = useTranslation();
  const clearToken = useAuthStore((state) => state.clearToken);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearToken();
      navigate('/login');
    }
  };
  const { data: profile } = useProfile();

  const initials = profile?.name?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-8">
      <div className="flex-1" />
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar className="h-10 w-10">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{profile?.name ?? "..."}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile?.email ?? ""}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/profile")}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>{t("nav.profile")}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t("auth.logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
