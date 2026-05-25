import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const forbiddenDarkSectionClasses = [
  {
    file: "client/src/pages/services/audit-services.page.tsx",
    classes: ["bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0"],
  },
  {
    file: "client/src/pages/services/compliance-management.page.tsx",
    classes: ["bg-gradient-to-r from-green-600 to-emerald-600 text-white border-0"],
  },
  {
    file: "client/src/pages/services/fssai-registration.page.tsx",
    classes: ["bg-gradient-to-r from-orange-600 to-red-600 text-white"],
  },
  {
    file: "client/src/pages/services/gst-returns.page.tsx",
    classes: ["bg-gradient-to-r from-blue-600 to-indigo-600 text-white"],
  },
  {
    file: "client/src/pages/services/iso-certification.page.tsx",
    classes: ["bg-gradient-to-r from-blue-600 to-purple-600 text-white"],
  },
  {
    file: "client/src/pages/services/labour-law-compliance.page.tsx",
    classes: ["bg-gradient-to-r from-orange-600 to-red-600 text-white"],
  },
  {
    file: "client/src/pages/services/msme-udyam-registration.page.tsx",
    classes: ["bg-gradient-to-r from-green-600 to-blue-600 text-white"],
  },
  {
    file: "client/src/pages/services/startup-india-registration.page.tsx",
    classes: ["bg-gradient-to-r from-purple-600 to-blue-600 text-white"],
  },
  {
    file: "client/src/pages/services/tax-planning.page.tsx",
    classes: ["bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-0"],
  },
  {
    file: "client/src/pages/services/trade-license.page.tsx",
    classes: ["bg-gradient-to-r from-blue-600 to-green-600 text-white"],
  },
  {
    file: "client/src/pages/services/trademark-registration.page.tsx",
    classes: ["bg-gradient-to-r from-purple-600 to-indigo-600 text-white"],
  },
  {
    file: "client/src/pages/services/city-landing.page.tsx",
    classes: [
      "bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white",
      "bg-blue-600 text-white overflow-hidden relative",
    ],
  },
  {
    file: "client/src/pages/services/itr-for-salaried.page.tsx",
    classes: [
      "md:col-span-2 bg-blue-700 p-8 lg:p-10 text-white",
      "bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 lg:p-12 relative overflow-hidden shadow-2xl",
    ],
  },
];

describe("service section visual treatment", () => {
  it("keeps large services sections on light professional surfaces", () => {
    const matches = forbiddenDarkSectionClasses.flatMap(({ file, classes }) => {
      const source = readFileSync(file, "utf8");

      return classes
        .filter((className) => source.includes(className))
        .map((className) => `${file}: ${className}`);
    });

    expect(matches).toEqual([]);
  });
});
