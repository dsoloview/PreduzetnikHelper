import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, FileText, TrendingUp, Settings, Landmark } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useTranslation } from "react-i18next";

const navItems = [
  { to: "/", icon: LayoutDashboard, labelKey: "nav.dashboard" },
  { to: "/clients", icon: Users, labelKey: "nav.clients" },
  { to: "/invoices", icon: FileText, labelKey: "nav.invoices" },
  { to: "/limits", icon: TrendingUp, labelKey: "nav.limits" },
  { to: "/bank-accounts", icon: Landmark, labelKey: "nav.bankAccounts" },
];

export const Sidebar = () => {
  const { t } = useTranslation();

  return (
    <div className="w-64 border-r bg-card flex flex-col h-full">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold tracking-tight text-primary">Preduzetnik</h2>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )
            }
          >
            <item.icon className="size-4" />
            {t(item.labelKey)}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )
          }
        >
          <Settings className="size-4" />
          {t("nav.settings")}
        </NavLink>
      </div>
    </div>
  );
};
