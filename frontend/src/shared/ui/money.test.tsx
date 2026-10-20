import { afterEach, describe, expect, it } from "vitest";
import { act, render } from "@testing-library/react";
import i18n from "@/shared/config/i18n/i18n";
import { Money } from "./money";

describe("Money", () => {
  afterEach(async () => {
    await act(() => i18n.changeLanguage("ru"));
  });

  it("formats by the interface language and follows language switches", async () => {
    await act(() => i18n.changeLanguage("sr"));
    const { container, rerender } = render(<Money amount={1234567} currency="RSD" />);
    expect(container.textContent).toBe("1.234.567 RSD");

    await act(() => i18n.changeLanguage("en"));
    rerender(<Money amount={1234567} currency="RSD" />);
    expect(container.textContent).toBe("1,234,567 RSD");
  });
});
