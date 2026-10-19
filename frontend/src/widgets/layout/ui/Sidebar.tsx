import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, TrendingUp, Settings, Landmark, UserCircle, BookOpen, X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Brand } from "@/shared/ui/brand";
import { IncompleteDot } from "@/shared/ui/incomplete-dot";
import { useProfile } from "@/entities/user/api/user.queries";
import { isMissingProfileDetails } from "@/entities/user/lib/profile-completeness";

const navItems = [
  { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/clients", icon: Users, labelKey: "nav.clients" },
  { to: "/invoices", icon: FileText, labelKey: "nav.invoices" },
  { to: "/limits", icon: TrendingUp, labelKey: "nav.limits" },
  { to: "/bank-accounts", icon: Landmark, labelKey: "nav.bankAccounts" },
  { to: "/kpo", icon: BookOpen, labelKey: "nav.kpo" },
];

const linkClass = (isActive: boolean) =>
  cn(
    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-muted hover:text-foreground",
  );

interface SidebarProps {
  /** Whether the mobile drawer is open. */
  open: boolean;
  /** Closes the mobile drawer. */
  onClose: () => void;
}

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const showDot = !!profile && isMissingProfileDetails(profile);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "z-50 w-60 border-r bg-sidebar flex flex-col",
          // Mobile: fixed slide-in drawer
          "fixed inset-y-0 left-0 transform transition-transform duration-200 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full",
          // Desktop: static, always visible
          "md:static md:translate-x-0 md:h-full",
        )}
        aria-label={t("app.navAria")}
      >
        <div className="h-14 px-4 border-b flex items-center justify-between">
          <Brand />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onClose}
            aria-label={t("app.closeMenu")}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto" onClick={onClose}>
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => linkClass(isActive)}>
              <item.icon className="size-4" />
              {t(item.labelKey)}
              {item.to === "/" && showDot && <IncompleteDot />}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t space-y-0.5" onClick={onClose}>
          <NavLink to="/profile" className={({ isActive }) => linkClass(isActive)}>
            <UserCircle className="size-4" />
            {t("nav.profile")}
            {showDot && <IncompleteDot />}
          </NavLink>
          <NavLink to="/settings" className={({ isActive }) => linkClass(isActive)}>
            <Settings className="size-4" />
            {t("nav.settings")}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
