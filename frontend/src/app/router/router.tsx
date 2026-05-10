import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "@/pages/login/ui/LoginPage";
import { RegisterPage } from "@/pages/register/ui/RegisterPage";
import { DashboardPage } from "@/pages/dashboard/ui/DashboardPage";
import { ClientsPage } from "@/pages/clients/ui/ClientsPage";
import { InvoicesPage } from "@/pages/invoices/ui/InvoicesPage";
import { BankAccountsPage } from "@/pages/bank-accounts/ui/BankAccountsPage";
import { LimitsPage } from "@/pages/limits/ui/LimitsPage";
import { ProfilePage } from "@/pages/profile/ui/ProfilePage";
import { KpoPage } from "@/pages/kpo/ui/KpoPage";
import { SettingsPage } from "@/pages/settings/ui/SettingsPage";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { MainLayout } from "@/widgets/layout/ui/MainLayout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "clients",
        element: <ClientsPage />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
      {
        path: "bank-accounts",
        element: <BankAccountsPage />,
      },
      {
        path: "limits",
        element: <LimitsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },
      {
        path: "kpo",
        element: <KpoPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
]);
