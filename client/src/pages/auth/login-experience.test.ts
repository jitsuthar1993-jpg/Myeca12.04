import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/auth/login.page.tsx", "utf8");

describe("login customer handoff", () => {
  it("reassures customers who are continuing into ITR filing", () => {
    expect(source).toContain('requestedRedirectPath?.startsWith("/itr/filing")');
    expect(source).toContain("Create your secure workspace to continue filing.");
    expect(source).toContain("Open your secure tax workspace and continue where you left off.");
  });
});
