import { describe, expect, it } from "vitest";
import {
  compareSeoDeploymentSignatures,
  createSeoDeploymentSignature,
} from "@shared/seo-deployment-parity";

const richShell = `
  <html>
    <head>
      <title>ITR Filing Services India AY 2026-27 | CA Help | myeca.in</title>
      <meta name="description" content="File ITR for FY 2025-26 and AY 2026-27 with CA-led review and Form 16 checks." />
      <link rel="canonical" href="https://myeca.in" />
    </head>
    <body>
      <main data-seo-static-shell="home">
        <h1>ITR Filing Services India AY 2026-27</h1>
        <p>Form 16 AIS Form 26AS salary deductions refund readiness ITR filing AY 2026-27.</p>
        <p>${Array.from({ length: 130 }, (_, index) => `filing-${index}`).join(" ")}</p>
        <a href="/itr/form-selector">Choose ITR form</a>
        <a href="/services/itr-for-salaried">Salaried ITR service</a>
      </main>
    </body>
  </html>
`;

const thinShell = `
  <html>
    <head>
      <title>ITR Filing Services India AY 2026-27 | CA Help | myeca.in</title>
      <meta name="description" content="File ITR for FY 2025-26 and AY 2026-27 with CA-led review and Form 16 checks." />
      <link rel="canonical" href="https://myeca.in" />
    </head>
    <body>
      <main data-seo-static-shell="home">
        <h1>ITR Filing Services India AY 2026-27</h1>
        <p>Short static shell.</p>
      </main>
    </body>
  </html>
`;

describe("SEO deployment parity", () => {
  it("passes when canonical and alias signatures match content depth and internal links", () => {
    const canonical = createSeoDeploymentSignature("/", richShell);
    const alias = createSeoDeploymentSignature("/", richShell);

    expect(compareSeoDeploymentSignatures(canonical, alias)).toEqual([]);
  });

  it("flags a stale canonical shell when the alias has richer SEO content", () => {
    const canonical = createSeoDeploymentSignature("/", thinShell);
    const alias = createSeoDeploymentSignature("/", richShell);

    expect(compareSeoDeploymentSignatures(canonical, alias)).toEqual([
      "word count differs by 146 words",
      "internal link count differs: canonical 0 vs alias 2",
      "visible text fingerprint differs",
    ]);
  });
});
