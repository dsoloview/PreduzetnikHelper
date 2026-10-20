import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import i18n from "@/shared/config/i18n/i18n";

// Tests assert on Russian copy and number formatting; pin the language instead of detecting it from jsdom
await i18n.changeLanguage("ru");

afterEach(() => {
  cleanup();
});
