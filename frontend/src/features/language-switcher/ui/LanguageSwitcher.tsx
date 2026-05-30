import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Globe, Check } from "lucide-react";

type Language = "en" | "ru" | "sr";

const LANGUAGES: { code: Language; nativeLabel: string }[] = [
  { code: "en", nativeLabel: "English" },
  { code: "ru", nativeLabel: "Русский" },
  { code: "sr", nativeLabel: "Српски" },
];

interface LanguageSwitcherProps {
  variant?: "ghost" | "outline";
  size?: "default" | "sm" | "icon";
}

export const LanguageSwitcher = ({ variant = "ghost", size = "icon" }: LanguageSwitcherProps) => {
  const { i18n, t } = useTranslation();
  const currentLanguage = (i18n.language || "en") as Language;

  const handleLanguageChange = (lang: Language) => {
    i18n.changeLanguage(lang);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          aria-label={t("app.language.switch")}
        >
          <Globe className="size-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGES.map(({ code, nativeLabel }) => (
          <DropdownMenuItem
            key={code}
            onClick={() => handleLanguageChange(code)}
            className="flex items-center justify-between gap-4"
          >
            <span>{nativeLabel}</span>
            {currentLanguage === code && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
