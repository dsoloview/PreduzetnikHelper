import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { useAuthStore } from "@/entities/user/model/auth.store";

export const DashboardPage = () => {
  const { t } = useTranslation();
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p className="text-muted-foreground mb-8">Welcome to Preduzetnik Helper!</p>
      <Button onClick={logout} variant="destructive">
        Logout
      </Button>
    </div>
  );
};
