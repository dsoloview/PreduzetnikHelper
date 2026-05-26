import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useProfile } from "@/entities/user/api/user.queries";
import { isMissingProfileDetails } from "@/entities/user/lib/profile-completeness";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Button } from "@/shared/ui/button";

export const ProfileCompletenessAlert = () => {
  const { t } = useTranslation();
  const { data: profile, isLoading } = useProfile();

  if (isLoading || !profile || !isMissingProfileDetails(profile)) return null;

  return (
    <Alert variant="destructive">
      <AlertTriangle />
      <AlertTitle>{t("profileCompleteness.title")}</AlertTitle>
      <AlertDescription>{t("profileCompleteness.description")}</AlertDescription>
      <AlertAction className="top-1/2 -translate-y-1/2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/profile">{t("profileCompleteness.action")}</Link>
        </Button>
      </AlertAction>
    </Alert>
  );
};
