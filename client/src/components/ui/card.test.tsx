import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const cardSource = readFileSync(resolve(__dirname, "card.tsx"), "utf8");

describe("Card visual contract", () => {
  it("keeps the default card static and token-driven", () => {
    const defaultClasses =
      cardSource.match(/const Card =[\s\S]*?className=\{cn\(\s*"([^"]+)"/)?.[1] ??
      "";

    expect(defaultClasses).toContain("rounded-xl");
    expect(defaultClasses).toContain("bg-card");
    expect(defaultClasses).toContain("text-card-foreground");
    expect(defaultClasses).not.toContain("hover:-translate");
    expect(defaultClasses).not.toContain("gray-");
  });

  it("offers an explicit interactive card with hover motion", () => {
    expect(cardSource).toContain("const CardInteractive");
    expect(cardSource).toContain("hover:-translate-y-1");
  });
});
