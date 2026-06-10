import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("client/src/pages/expert-consultation.page.tsx", "utf8");

describe("expert consultation layout contract", () => {
  it("keeps authenticated support inside the shared workspace shell", () => {
    expect(source).toContain("const { user, isAuthenticated, isLoading: authLoading } = useAuth();");
    expect(source).toContain('<Layout title="Support Request">');
    expect(source).toContain('data-testid="authenticated-support-workspace"');
    expect(source).toContain('className="mx-auto w-full max-w-4xl');
    expect(source).toContain('className="rounded-lg border border-slate-200 bg-white');
  });

  it("uses account details without repeating the public intake page", () => {
    expect(source).toContain("const accountName =");
    expect(source).toContain("email: current.email || user.email ||");
    expect(source).toContain("phone: current.phone || user.phoneNumber ||");
    expect(source).toContain("if (isAuthenticated) {");
    expect(source).toContain("Request expert support");
  });

  it("does not flash the signed-out consultation page while authentication resolves", () => {
    expect(source).toContain("const { user, isAuthenticated, isLoading: authLoading } = useAuth();");
    expect(source).toContain("if (authLoading) {");
    expect(source).toContain("return <PageSkeleton />;");
  });

  it("keeps the selected support area and service profile in sync", () => {
    expect(source).toContain("const handleServiceChange = (service: string) =>");
    expect(source).toContain("setServiceKey(nextServiceKey);");
    expect(source).toContain("onValueChange={handleServiceChange}");
  });

  it("preserves the full public consultation page for signed-out visitors", () => {
    expect(source).toContain('data-testid="public-consultation-page"');
    expect(source).toContain('<Label htmlFor="public-email">Email *</Label>');
    expect(source).toContain("Trusted expert support");
    expect(source).toContain("What we check");
  });
});
