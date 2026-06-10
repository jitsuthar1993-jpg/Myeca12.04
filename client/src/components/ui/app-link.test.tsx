import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppLink } from "./app-link";

describe("AppLink", () => {
  it("normalizes same-site absolute links into internal navigation", () => {
    render(<AppLink href="https://myeca.in/pricing">Pricing</AppLink>);

    const link = screen.getByRole("link", { name: "Pricing" });
    expect(link).toHaveAttribute("href", "/pricing");
    expect(link).not.toHaveAttribute("target");
    expect(link).not.toHaveAttribute("rel");
  });

  it("opens external links with a safe new-tab policy", () => {
    render(<AppLink href="https://eportal.incometax.gov.in">Income Tax Portal</AppLink>);

    const link = screen.getByRole("link", { name: "Income Tax Portal" });
    expect(link).toHaveAttribute("href", "https://eportal.incometax.gov.in/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
    expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
  });

  it("keeps public document-generator routes public even when a fallback is supplied", () => {
    render(
      <AppLink href="/documents/generator" publicFallbackHref="/auth/login?next=%2Fdocuments%2Fgenerator">
        Document generator
      </AppLink>,
    );

    expect(screen.getByRole("link", { name: "Document generator" })).toHaveAttribute(
      "href",
      "/documents/generator",
    );
  });
});
