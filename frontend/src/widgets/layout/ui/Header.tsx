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
import { Menu, LogOut, UserCircle } from "lucide-react";
import { ThemeSwitcher } from "@/features/theme-switcher/ui/ThemeSwitcher";
import { LanguageSwitcher } from "@/features/language-switcher/ui/LanguageSwitcher";
import { Brand } from "@/shared/ui/brand";

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header = ({ onOpenSidebar }: HeaderProps) => {
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
    <header className="h-14 border-b bg-card flex items-center justify-between px-4 md:px-6 gap-4">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenSidebar}
          aria-label={t("app.openMenu")}
        >
          <Menu className="size-5" />
        </Button>
        <Brand className="md:hidden" />
      </div>
      <div className="flex items-center gap-1">
        <LanguageSwitcher />
        <ThemeSwitcher />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative ml-1 size-9 rounded-full p-0">
              <Avatar className="size-9">
                <AvatarFallback className="bg-accent text-accent-foreground text-sm font-medium">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {profile ? (
                  <>
                    <p className="text-sm font-medium leading-none">{profile.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">{t("app.loading")}…</p>
                )}
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
