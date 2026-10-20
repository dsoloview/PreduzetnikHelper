import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

describe("InvoiceStatusBadge", () => {
  it("shows the translated label for each status, including the derived OVERDUE", () => {
    render(
      <>
        <InvoiceStatusBadge status="PAID" />
        <InvoiceStatusBadge status="OVERDUE" />
      </>,
    );

    expect(screen.getByText("Оплачен")).toBeInTheDocument();
    expect(screen.getByText("Просрочен")).toHaveClass("text-destructive-strong");
  });
});
