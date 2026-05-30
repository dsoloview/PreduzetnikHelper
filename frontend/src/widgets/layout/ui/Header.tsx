import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
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

/**
 * Maps a pathname to the matching i18n key used to render the page title
 * in the header. The first matching entry wins, so order from most specific
 * to least specific.
 */
const ROUTE_TITLE_KEYS: ReadonlyArray<readonly [RegExp, string]> = [
  [/^\/clients/, "nav.clients"],
  [/^\/invoices/, "nav.invoices"],
  [/^\/limits/, "nav.limits"],
  [/^\/bank-accounts/, "nav.bankAccounts"],
  [/^\/kpo/, "nav.kpo"],
  [/^\/profile/, "nav.profile"],
  [/^\/settings/, "nav.settings"],
  [/^\/$/, "nav.dashboard"],
];

interface HeaderProps {
  onOpenSidebar: () => void;
}

export const Header = ({ onOpenSidebar }: HeaderProps) => {
  const { t } = useTranslation();
  const clearToken = useAuthStore((state) => state.clearToken);
  const navigate = useNavigate();
  const location = useLocation();

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
  const titleKey = ROUTE_TITLE_KEYS.find(([re]) => re.test(location.pathname))?.[1];

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4 md:px-8 gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onOpenSidebar}
          aria-label={t("app.openMenu")}
        >
          <Menu className="size-5" />
        </Button>
        {titleKey && (
          <h1 className="text-lg font-semibold truncate">{t(titleKey)}</h1>
        )}
      </div>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <ThemeSwitcher />
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
