import { useTheme } from "@/app/providers/ThemeProvider";
import { Button } from "@/shared/ui/button";
import { Moon, Sun } from "lucide-react";

interface ThemeToggleProps {
  variant?: "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}

export const ThemeToggle = ({ variant = "ghost", size = "icon" }: ThemeToggleProps) => {
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      aria-label={resolvedTheme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {resolvedTheme === "light" ? (
        <Moon className="size-5" />
      ) : (
        <Sun className="size-5" />
      )}
    </Button>
  );
};
