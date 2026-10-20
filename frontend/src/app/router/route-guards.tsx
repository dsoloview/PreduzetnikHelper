import { useEffect, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/entities/user/model/auth.store";
import { restoreSession } from "@/entities/user/model/session";
import { Spinner } from "@/shared/ui/spinner";

const useSessionStatus = () => {
  const status = useAuthStore((state) => state.status);
  useEffect(() => {
    if (status === "unknown") void restoreSession();
  }, [status]);
  return status;
};

const SessionCheck = () => (
  <div className="flex h-screen items-center justify-center">
    <Spinner className="size-6 text-muted-foreground" />
  </div>
);

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const status = useSessionStatus();

  if (status === "unknown") return <SessionCheck />;
  if (status === "anonymous") return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const status = useSessionStatus();

  if (status === "unknown") return <SessionCheck />;
  if (status === "authenticated") return <Navigate to="/" replace />;
  return <>{children}</>;
};
