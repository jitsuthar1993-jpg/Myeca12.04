import fs from "node:fs/promises";
import path from "node:path";

type Frontmatter = {
  title?: string;
  slug?: string;
  primaryKeyword?: string;
};

const rootDir = process.cwd();
const contentDirs = [
  path.join(rootDir, "content", "blog"),
  path.join(rootDir, "content", "blog-drafts"),
];
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

function render(frontmatter: Frontmatter, body: string) {
  return `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${body.trim()}\n`;
}

function topicFor(frontmatter: Frontmatter, fileName: string) {
  return frontmatter.primaryKeyword?.trim()
    || frontmatter.title?.trim()
    || frontmatter.slug?.replace(/-/g, " ")
    || fileName.replace(/\.mdx$/, "").replace(/-/g, " ");
}

function rewriteBody(body: string, topic: string) {
  const replacements: Array<[RegExp, string]> = [
    [
      /Then investigate an omission, duplicate, or classification difference\./g,
      `For ${topic}, investigate any omitted, duplicated, or wrongly classified portal entry.`,
    ],
    [
      /Use AIS to identify third-party-reported entries/g,
      `For ${topic}, read AIS as a third-party reporting signal`,
    ],
    [
      /Then review the correction route before claiming the credit\./g,
      `For ${topic}, review the applicable correction route before claiming that credit.`,
    ],
    [
      /Use the correction route if the credit shown in Form 16 is missing or inaccurate/g,
      `When ${topic} depends on Form 16 credit, use the correction route for a missing or inaccurate entry`,
    ],
    [
      /Use this transition guidance if completing this check raises a question about the governing period or law\./g,
      `Use the transition guidance to resolve any governing-period or applicable-law question raised by ${topic}.`,
    ],
    [
      /Use the AIS guidance when portal data differs from the supporting records\./g,
      `For ${topic}, follow the AIS guidance when portal data differs from the supporting records.`,
    ],
    [
      /Compare reported income and transactions with the taxpayer's own records\./g,
      `For ${topic}, compare each reported income or transaction entry with the taxpayer's own records.`,
    ],
    [
      /Retain proof that the return was submitted and later e-verified\./g,
      `Keep the submitted ${topic} return and its later e-verification proof together.`,
    ],
    [
      /Then choose the AY 2026-27 form and schedules\./g,
      `Choose the AY 2026-27 form and schedules that can report ${topic}.`,
    ],
    [
      /Explain the difference, give AIS feedback where relevant, and retain the reconciliation note\./g,
      `For ${topic}, explain the difference, submit relevant AIS feedback, and retain the reconciliation note.`,
    ],
    [
      /Retain the source statements and portal downloads used for that decision\./g,
      `Retain the ${topic} source statements and portal downloads used for the decision.`,
    ],
    [
      /Keep a dated note of the result and any assumption that still needs confirmation\./g,
      `Keep a dated ${topic} result note and identify every assumption that still needs confirmation.`,
    ],
    [
      /Record the next correction, response, payment, or review deadline left open\./g,
      `Record the next ${topic} correction, response, payment, or review deadline left open.`,
    ],
    [
      /Confirm AY 2026-27 is the correct assessment year for FY 2025-26 income\./g,
      `For ${topic}, confirm that AY 2026-27 is the correct assessment year for the FY 2025-26 income.`,
    ],
    [
      /Resolve an incomplete or inconsistent detail before submission\./g,
      `Resolve any incomplete or inconsistent ${topic} detail before submission.`,
    ],
    [
      /Save the checked copy with the final acknowledgement\./g,
      `Save the checked ${topic} evidence with the final acknowledgement.`,
    ],
    [
      /If the portal asks for a different format or issuing record, follow the current authority instruction\./g,
      `For ${topic}, use the format and issuing record named in the current authority instruction.`,
    ],
    [
      /Do not use either record for a fact it does not contain\./g,
      `For ${topic}, use each record only for the fact it actually contains.`,
    ],
    [
      /A conflict between them needs correction or written clarification\./g,
      `Resolve any ${topic} conflict through source-record correction or written clarification.`,
    ],
  ];

  return replacements.reduce(
    (rewritten, [pattern, replacement]) => rewritten.replace(pattern, replacement),
    body,
  );
}

async function run() {
  let updated = 0;

  for (const contentDir of contentDirs) {
    const names = (await fs.readdir(contentDir)).filter((name) => name.endsWith(".mdx")).sort();
    for (const name of names) {
      const filePath = path.join(contentDir, name);
      const raw = await fs.readFile(filePath, "utf8");
      const match = raw.match(frontmatterPattern);
      if (!match) throw new Error(`Missing JSON frontmatter in ${filePath}`);
      const frontmatter = JSON.parse(match[1]) as Frontmatter;
      const body = match[2].trim();
      const nextBody = rewriteBody(body, topicFor(frontmatter, name));
      if (nextBody === body) continue;
      await fs.writeFile(filePath, render(frontmatter, nextBody), "utf8");
      updated += 1;
    }
  }

  console.log(`Rewrote repeated structured copy in ${updated} blog and draft files.`);
}

await run();
