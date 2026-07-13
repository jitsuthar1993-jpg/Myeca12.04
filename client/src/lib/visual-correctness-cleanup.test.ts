import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readWorkspaceFile = (filePath: string) =>
  readFileSync(resolve(process.cwd(), filePath), "utf8");

const remoteTexturePages = [
  "client/src/pages/analytics.page.tsx",
  "client/src/pages/analytics-dashboard.page.tsx",
  "client/src/pages/dashboard.page.tsx",
  "client/src/pages/user-dashboard.page.tsx",
  "client/src/pages/export-center.page.tsx",
  "client/src/pages/referrals.page.tsx",
  "client/src/pages/reports.page.tsx",
  "client/src/pages/teams.page.tsx",
  "client/src/pages/workflows.page.tsx",
  "client/src/pages/learn/index.page.tsx",
] as const;

const remainingDynamicTonePages = [
  "client/src/pages/learn/videos.page.tsx",
  "client/src/pages/learn/guides.page.tsx",
  "client/src/pages/services/audit-services.page.tsx",
  "client/src/pages/services/fssai-registration.page.tsx",
  "client/src/pages/startup/funding.page.tsx",
  "client/src/pages/services/gst-returns.page.tsx",
  "client/src/pages/services/iso-certification.page.tsx",
  "client/src/pages/services/labour-law-compliance.page.tsx",
  "client/src/pages/services/msme-udyam-registration.page.tsx",
  "client/src/pages/services/startup-india-registration.page.tsx",
  "client/src/pages/services/tax-planning.page.tsx",
  "client/src/pages/services/trade-license.page.tsx",
] as const;

const brightMetricGradients = [
  "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
  "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
  "bg-gradient-to-br from-purple-500 to-violet-600 text-white",
  "bg-gradient-to-br from-orange-500 to-amber-600 text-white",
  "bg-gradient-to-br from-red-500 to-rose-600 text-white",
  "bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg",
] as const;

const dynamicTailwindPages = [
  "client/src/pages/analytics.page.tsx",
  "client/src/pages/analytics-dashboard.page.tsx",
  "client/src/pages/workflows.page.tsx",
  "client/src/pages/teams.page.tsx",
  "client/src/pages/reports.page.tsx",
  "client/src/pages/referrals.page.tsx",
  "client/src/pages/services/trademark-registration.page.tsx",
] as const;

describe("visual correctness cleanup", () => {
  it("keeps clipped gradient text visible when decorative backgrounds are removed for print", () => {
    const source = readWorkspaceFile("client/src/styles/print.css");

    expect(source).toMatch(/\.text-transparent\.bg-clip-text\s*\{/);
    expect(source).toContain("-webkit-text-fill-color: #0f172a !important;");
    expect(source).toContain("color: #0f172a !important;");
  });

  it("uses accessible solid surfaces for high-risk calculator and analysis metrics", () => {
    const sources = [
      "client/src/pages/ais-viewer.page.tsx",
      "client/src/pages/bank-analyzer.page.tsx",
      "client/src/pages/tax-loss-harvesting.page.tsx",
    ].map(readWorkspaceFile);

    for (const source of sources) {
      for (const gradient of brightMetricGradients) {
        expect(source, gradient).not.toContain(gradient);
      }
    }

    const taxRegimeSource = readWorkspaceFile(
      "client/src/features/calculators/pages/tax-regime.page.tsx",
    );
    expect(taxRegimeSource).not.toMatch(
      /recommendation\.regime === ['"](?:new|old)['"][^\n]+bg-gradient-to-br/,
    );
  });

  it("does not fetch third-party textures for first-party workspace decoration", () => {
    for (const filePath of remoteTexturePages) {
      const source = readWorkspaceFile(filePath);

      expect(source, filePath).not.toMatch(
        /(?:transparenttextures\.com|grainy-gradients\.vercel\.app)/,
      );
    }
  });

  it("uses statically discoverable startup service color classes", () => {
    const source = readWorkspaceFile(
      "client/src/pages/startup-services.page.tsx",
    );

    expect(source).not.toMatch(
      /(?:bg|text|from|to)-\$\{(?:service|advantage|factor)\.color\}/,
    );
  });

  it("uses statically discoverable color classes across remaining public pages", () => {
    for (const filePath of remainingDynamicTonePages) {
      const source = readWorkspaceFile(filePath);

      expect(source, filePath).not.toMatch(/(?:bg|text|border|from|to|via)-\$\{/);
    }
  });

  it("uses complete Tailwind class literals for data-driven page tones", () => {
    for (const filePath of dynamicTailwindPages) {
      const source = readWorkspaceFile(filePath);

      expect(source, filePath).not.toMatch(
        /\b(?:bg|text|border(?:-[lrtbxy])?|from|to|ring|shadow)-\$\{/,
      );
    }
  });

  it("maps emerald startup service tones to complete Tailwind classes", () => {
    const source = readWorkspaceFile("client/src/utils/colorClasses.ts");

    expect(source).toContain('border: "border-l-emerald-500"');
    expect(source).toContain('bg: "bg-emerald-100"');
    expect(source).toContain('text: "text-emerald-600"');
    expect(source).toContain('emerald: "from-emerald-500 to-emerald-600"');
  });

  it("keeps homepage situation accent borders from being overridden by the neutral border", () => {
    const source = readWorkspaceFile("client/src/components/Testimonials.tsx");

    expect(source).toContain("border-x border-b border-t-4 border-x-slate-200 border-b-slate-200");
    expect(source).not.toContain("border border-t-4 border-slate-200");
    expect(source).not.toContain("hover:border-slate-300");
  });
});
