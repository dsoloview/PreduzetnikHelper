import { useTheme } from "@/app/providers/ThemeProvider";
import { Button } from "@/shared/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ThemeSwitcherProps {
  variant?: "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}

export const ThemeSwitcher = ({ variant = "ghost", size = "icon" }: ThemeSwitcherProps) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label={resolvedTheme === "light" ? t("app.theme.dark") : t("app.theme.light")}
    >
      {resolvedTheme === "light" ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5" />
      )}
    </Button>
  );
};
