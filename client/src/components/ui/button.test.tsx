import { describe, expect, it } from "vitest";
import { buttonVariants } from "./button";

describe("Button visual contract", () => {
  it("uses canonical tokens without default hover translation", () => {
    const defaultClasses = buttonVariants({ variant: "default" });

    expect(defaultClasses).toContain("bg-primary");
    expect(defaultClasses).toContain("hover:bg-brand-700");
    expect(defaultClasses).not.toContain("hover:-translate");
    expect(defaultClasses).not.toContain("hsl(226.63 96.19% 58.82%)");
    expect(defaultClasses).not.toContain("gray-");
  });

  it("keeps hover translation opt-in for the marketing variant", () => {
    expect(buttonVariants({ variant: "brand" })).toContain(
      "hover:-translate-y-0.5",
    );
  });
});
