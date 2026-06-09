import fs from "node:fs/promises";
import path from "node:path";

type Frontmatter = Record<string, unknown> & {
  title?: string;
  slug?: string;
  categoryId?: string;
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  contentType?: string;
  modifiedAt?: string;
  publishedAt?: string;
  keyHighlights?: string[];
  keyTopics?: string[];
  tags?: string[];
  faqs?: Array<{ question?: string; answer?: string }>;
  sourceLinks?: Array<{ label?: string; url?: string; checkedAt?: string | null }>;
  relatedPostIds?: string[];
  ctaHref?: string | null;
  serviceSlug?: string | null;
  calculatorSlug?: string | null;
};

type BlogFile = {
  filePath: string;
  frontmatter: Frontmatter;
  body: string;
};

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

function isPlainLongParagraph(block: string) {
  const trimmed = block.trim();
  if (trimmed.length < 120) return false;
  if (/^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|\|)/.test(trimmed)) return false;
  return !trimmed.includes("\n|");
}

function splitBlocks(body: string) {
  return body.replace(/\r\n/g, "\n").split(/\n{2,}/);
}

function humanizeSlug(slug: string) {
  const acronyms: Record<string, string> = {
    ais: "AIS",
    ay: "AY",
    ca: "CA",
    gst: "GST",
    itr: "ITR",
    msme: "MSME",
    nps: "NPS",
    pan: "PAN",
    tcs: "TCS",
    tds: "TDS",
    vda: "VDA",
  };
  return slug
    .replace(/-/g, " ")
    .split(/\s+/)
    .map((word) => acronyms[word.toLowerCase()] ?? `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ")
    .replace(/\bMye CA\b/g, "MyeCA");
}

function shortTopicFor(meta: Frontmatter) {
  const keyword = meta.primaryKeyword?.trim() || meta.title?.trim() || "this topic";
  const ignored = /^(?:ay|fy|itr|guide|checklist|year|new|act|20\d{2}(?:-\d{2})?)$/i;
  const words = keyword
    .split(/\s+/)
    .filter(Boolean)
    .filter((word) => !ignored.test(word))
    .filter((word, index, values) => index === 0 || word.toLowerCase() !== values[index - 1].toLowerCase());
  if (words.length <= 2) return words.join(" ") || keyword;
  if (words.length === 3) return `${words[0]} ${words[1]}`;
  return `${words[0]} ${words[1]} ${words[words.length - 1]}`;
}

function sentenceCase(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

function disambiguateDuplicateHeadings(body: string, meta: Frontmatter) {
  const topic = sentenceCase(shortTopicFor(meta));
  const seen = new Map<string, number>();
  const followUpHeadings = [
    `Additional ${topic} evidence and checks`,
    `Complete the ${topic} review`,
    `Follow-up actions for ${topic}`,
  ];

  return body.replace(/^##[ \t]+(.+?)[ \t]*$/gim, (line, heading: string) => {
    const key = normalizeText(heading);
    const count = seen.get(key) ?? 0;
    seen.set(key, count + 1);
    return count === 0 ? line.trimEnd() : `## ${followUpHeadings[(count - 1) % followUpHeadings.length]}`;
  });
}

function normalizeMarkdownStructure(body: string) {
  return body
    .replace(/\r\n/g, "\n")
    .replace(/^(#{2,6}[ \t]+)(.+)$/gm, (_line, marker: string, heading: string) =>
      `${marker}${/^(?:eShram|myScheme|e-filing)\b/.test(heading) ? heading : sentenceCase(heading)}`)
    .replace(/^([-*+][ \t]+)(.+)$/gm, (_line, marker: string, item: string) =>
      `${marker}${/^(?:\[|eShram|myScheme|e-filing)\b/.test(item) ? item : sentenceCase(item)}`)
    .replace(/(^|\n\n)([a-z][^\n]*)/g, (_line, spacer: string, paragraph: string) =>
      `${spacer}${/^(?:eShram|myScheme|e-filing)\b/.test(paragraph) ? paragraph : sentenceCase(paragraph)}`)
    .replace(/([^\n])\n(#{2,6}[ \t]+)/g, "$1\n\n$2")
    .replace(/^(#{2,6}[^\n]*)\n(?!\n|$)/gm, "$1\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function chooseForRoute<T>(meta: Frontmatter, values: T[]) {
  const source = `${String(meta.slug ?? meta.title ?? "")}:${values.map(String).join("|")}`;
  let seed = 2166136261;
  for (const char of source) {
    seed ^= char.charCodeAt(0);
    seed = Math.imul(seed, 16777619);
  }
  return values[(seed >>> 0) % values.length];
}

function replaceRepeatedGenericHeadings(body: string, meta: Frontmatter) {
  const topic = shortTopicFor(meta);
  const replacements: Record<string, string[]> = {
    "step-by-step checklist": [
      `Complete ${topic} in sequence`,
      `Work through the ${topic} checks`,
      `A practical sequence for ${topic}`,
    ],
    "how myeca helps": [
      `When professional help is useful for ${topic}`,
      `Where ${topic} needs a document-based review`,
      `Escalation points for ${topic}`,
    ],
    "final checklist": [
      `Final checks for ${topic}`,
      `Before closing the ${topic} file`,
      `Last review before acting on ${topic}`,
    ],
    "documents and evidence to keep ready": [
      `Records that support ${topic}`,
      `Build the evidence file for ${topic}`,
      `Documents to reconcile for ${topic}`,
    ],
    "mistakes to avoid": [
      `Risks to resolve before ${topic}`,
      `Errors that can change ${topic}`,
      `What can go wrong with ${topic}`,
    ],
    "useful myeca paths": [
      `Tools and guides for ${topic}`,
      `Continue with the next ${topic} step`,
      `Related filing paths for ${topic}`,
    ],
    "facts that change the answer": [
      `Facts that decide ${topic}`,
      `What changes the ${topic} answer`,
      `Start with the facts behind ${topic}`,
    ],
    "choose the filing or correction route": [
      `Choose the right route for ${topic}`,
      `Filing and correction options for ${topic}`,
      `Match ${topic} to the current filing stage`,
    ],
    "common mistakes to avoid": [
      `${topic} mistakes that change the result`,
      `What usually goes wrong with ${topic}`,
      `Errors to fix before acting on ${topic}`,
    ],
    "key points": [
      `${topic}: points that change the filing`,
      `The practical position on ${topic}`,
      `What matters most for ${topic}`,
    ],
    "official position to keep in mind": [
      `Current rule behind ${topic}`,
      `Official position for ${topic}`,
      `Rule to confirm for ${topic}`,
    ],
    "practical example": [
      `${topic}: worked example`,
      `Example using ${topic} records`,
      `How ${topic} works in practice`,
    ],
    "filing checklist": [
      `${topic} filing checks`,
      `Before filing ${topic}`,
      `Checks that support ${topic}`,
    ],
    "what changed": [
      `What changed for ${topic}`,
      `The ${topic} change in context`,
      `How the rule changed for ${topic}`,
    ],
    "why it matters now": [
      `Why ${topic} matters now`,
      `Practical effect of ${topic}`,
      `Who needs to act on ${topic}`,
    ],
    "records to keep": [
      `Keep the ${topic} evidence trail`,
      `Archive the records behind ${topic}`,
      `Documents to retain for ${topic}`,
    ],
  };

  return body.replace(/^##[ \t]+(.+?)[ \t]*$/gim, (line, heading: string) => {
    const options = replacements[heading.trim().toLowerCase()];
    return options ? `## ${chooseForRoute(meta, options)}` : line;
  });
}

function replaceTemplateHeadingPrefixes(body: string, meta: Frontmatter) {
  const topic = shortTopicFor(meta);
  const replacements: Array<{ pattern: RegExp; options: string[] }> = [
    {
      pattern: /^related resources for\b/i,
      options: [
        `Useful links after reviewing ${topic}`,
        `${topic}: related records and guidance`,
        `Continue the work on ${topic}`,
        `Supporting pages for the ${topic} decision`,
        `Where to go after ${topic}`,
        `Related filing and compliance routes for ${topic}`,
        `${topic}: tools, services, and source material`,
        `Practical follow-up resources for ${topic}`,
      ],
    },
    {
      pattern: /^continue from the\b/i,
      options: [
        `Use the resolved ${topic} position`,
        `${topic}: move from review to action`,
        `Complete the next ${topic} task`,
        `Act on the ${topic} evidence`,
        `Carry the ${topic} decision forward`,
        `Choose the next route for ${topic}`,
        `Finish the ${topic} workflow`,
        `Turn the ${topic} review into action`,
      ],
    },
    {
      pattern: /^next step for\b/i,
      options: [
        `${topic}: practical next action`,
        `Move forward after reviewing ${topic}`,
        `Use the supported ${topic} route`,
        `Complete the next action for ${topic}`,
        `What to do after the ${topic} check`,
        `Act on the reconciled ${topic} position`,
        `From ${topic} review to filing`,
        `Close the open ${topic} question`,
      ],
    },
    {
      pattern: /^what changes the\b/i,
      options: [
        `Facts that decide ${topic}`,
        `${topic}: questions that change the answer`,
        `Start with the material ${topic} facts`,
        `The evidence behind the ${topic} position`,
        `What must be true for ${topic}`,
        `Resolve the first ${topic} question`,
        `How the records affect ${topic}`,
        `Decide ${topic} from the actual facts`,
      ],
    },
    {
      pattern: /^current rule for\b/i,
      options: [
        `The current rule behind ${topic}`,
        `${topic}: official position to confirm`,
        `Rule to verify before acting on ${topic}`,
        `How the notified rule applies to ${topic}`,
        `Authority guidance for ${topic}`,
        `The governing point for ${topic}`,
        `Confirm the live requirement for ${topic}`,
        `What the current rule means for ${topic}`,
      ],
    },
    {
      pattern: /^(?:records and checks|records that support)\b/i,
      options: [
        `Build the evidence file for ${topic}`,
        `${topic}: records to reconcile`,
        `Source documents behind the ${topic} answer`,
        `What belongs in the ${topic} working file`,
        `Evidence to verify before ${topic}`,
        `Keep the ${topic} position traceable`,
        `Documents that determine ${topic}`,
        `Record checks before acting on ${topic}`,
      ],
    },
    {
      pattern: /^worked example using\b/i,
      options: [
        `${topic}: a worked example`,
        `How ${topic} appears in a real file`,
        `Apply the rule to ${topic}`,
        `Example built from ${topic} records`,
        `From source documents to ${topic} answer`,
        `A practical scenario involving ${topic}`,
        `Test the ${topic} position with an example`,
        `Walk through the ${topic} evidence`,
      ],
    },
    {
      pattern: /^choose the return\b/i,
      options: [
        `Match ${topic} to the correct filing route`,
        `${topic}: form, correction, and response options`,
        `Choose the action supported by ${topic}`,
        `Use the right route for the ${topic} stage`,
        `Move from ${topic} facts to filing action`,
        `Which route fits the ${topic} issue`,
        `Select the defensible ${topic} action`,
        `Filing options after the ${topic} review`,
      ],
    },
    {
      pattern: /^choose the correct\b/i,
      options: [
        `${topic}: select the supported route`,
        `Match ${topic} to the available action`,
        `Use the facts to choose the ${topic} route`,
        `${topic}: decide the next filing step`,
        `Choose from the evidence behind ${topic}`,
        `Move ${topic} to the appropriate route`,
        `Select the defensible action for ${topic}`,
        `${topic}: form, correction, and response options`,
      ],
    },
    {
      pattern: /^evidence to verify\b/i,
      options: [
        `${topic}: records to verify before acting`,
        `Check the evidence behind ${topic}`,
        `Source records that determine ${topic}`,
        `${topic}: evidence and limitations`,
        `Verify the records needed for ${topic}`,
        `What the ${topic} evidence must support`,
        `Build a traceable ${topic} file`,
        `Resolve evidence gaps before ${topic}`,
      ],
    },
    {
      pattern: /^mistakes that change\b/i,
      options: [
        `${topic}: errors that change the result`,
        `Risks to resolve before acting on ${topic}`,
        `Where the ${topic} position can fail`,
        `Do not carry these ${topic} mistakes forward`,
        `Failure points in the ${topic} workflow`,
        `Check these ${topic} risks before submission`,
        `What commonly goes wrong with ${topic}`,
        `Correct these ${topic} errors first`,
      ],
    },
    {
      pattern: /^related actions for\b/i,
      options: [
        `${topic}: related filing and record tools`,
        `${topic}: useful routes after review`,
        `${topic}: nearest related action`,
        `${topic}: supporting calculators and services`,
        `Move from ${topic} guidance to action`,
        `${topic}: tools for the next step`,
        `Related compliance work after ${topic}`,
        `Where the ${topic} decision leads next`,
      ],
    },
    {
      pattern: /^archive records for\b/i,
      options: [
        `Keep the ${topic} evidence trail`,
        `${topic}: records to retain after submission`,
        `Preserve proof of the ${topic} position`,
        `Close the ${topic} file carefully`,
        `Save the working behind ${topic}`,
        `What to retain for later ${topic} review`,
        `Archive the completed ${topic} file`,
        `Keep ${topic} reconstructable`,
      ],
    },
    {
      pattern: /^when professional help\b/i,
      options: [
        `${topic}: when a document-based review is useful`,
        `Escalate unresolved ${topic} questions`,
        `Where the ${topic} checklist stops`,
        `Material ${topic} uncertainty needs review`,
        `Get help before finalising ${topic}`,
        `Questions that need closer ${topic} review`,
        `When ${topic} needs case-specific advice`,
        `Do not guess on unresolved ${topic} facts`,
      ],
    },
  ];

  return body.replace(/^##[ \t]+(.+?)[ \t]*$/gim, (line, heading: string) => {
    const replacement = replacements.find((candidate) => candidate.pattern.test(heading.trim()));
    return replacement ? `## ${chooseForRoute(meta, replacement.options)}` : line;
  });
}

function makeRepeatedHeadingPrefixesSpecific(body: string, meta: Frontmatter) {
  const topic = sentenceCase(shortTopicFor(meta));
  const repeatedPrefix = /^(?:questions to resolve|evidence behind the|close the file|act on the|archive the records|what to do|choose the next|records to retain|what belongs in|build the evidence|continue with the|start with the|documents to reconcile|related filing and|work through the|before closing the|tools and guides|move forward after|final checks for|what should be|useful links after|errors that can|escalation points for|related filing paths|checks that support|documents to keep|aadhaar evidence to)\b/i;

  return body.replace(/^##[ \t]+(.+?)[ \t]*$/gim, (line, heading: string) => {
    return repeatedPrefix.test(heading.trim()) ? `## ${topic}: ${heading.trim()}` : line;
  });
}

function replaceRepeatedProseStems(body: string, meta: Frontmatter) {
  const topic = shortTopicFor(meta);
  const organisedRecordOpening = chooseForRoute(meta, [
    `A defensible ${topic} file should organise records`,
    `For ${topic}, organise the relevant records`,
    `The working file for ${topic} should organise records`,
    `Before acting on ${topic}, organise records`,
    `${topic} decisions need organised records`,
    `Start the ${topic} review by organising records`,
    `Keep the ${topic} evidence organised`,
    `A traceable ${topic} position begins with organised records`,
  ]);
  const timingOpening = chooseForRoute(meta, [
    `For ${topic}, timing can change the correct route`,
    `The ${topic} answer may depend on timing`,
    `Dates can change the available ${topic} action`,
    `A time-sensitive ${topic} position needs dated evidence`,
    `Record the dates that affect ${topic}`,
    `The correct ${topic} route can change over time`,
    `For ${topic}, note every material deadline`,
    `Timing evidence belongs in the ${topic} working file`,
  ]);
  const periodOpening = chooseForRoute(meta, [
    `Preparing the AY 2026-27 return`,
    `Closing FY 2025-26 through the AY 2026-27 return`,
    `The AY 2026-27 filing workstream`,
    `Return preparation for AY 2026-27`,
    `Filing the FY 2025-26 return in AY 2026-27`,
    `The current AY 2026-27 return`,
    `AY 2026-27 filing activity`,
    `Work on the AY 2026-27 return`,
  ]);
  return body
    .replace(/\bTaxpayers and businesses should organise records\b/gi, organisedRecordOpening)
    .replace(/\bdocument the selected assessment year\b/gi, `For ${topic}, record the selected assessment year`)
    .replace(/\bWhere the position depends on timing\b/gi, timingOpening)
    .replace(/\bWhere timing matters\b/gi, timingOpening)
    .replace(/\bAY 2026-27 return work\b/g, periodOpening)
    .replace(/\bA revised return, a rectification request\b/gi, `For ${topic}, a revised return, a rectification request`)
    .replace(/\bA revised return, rectification request\b/gi, `For ${topic}, a revised return, rectification request`)
    .replace(/\bIt is an educational readiness note(?:\s*[—-]\s*not[^.]*|,\s*not[^.]*)?\./gi, "")
    .replace(/[^.!?\n]{1,180}\brequires current official instructions and the actual source records; the final treatment or outcome still depends on the facts\.\s*/gi, "")
    .replace(new RegExp(`(?:For ${escapeRegExp(topic)},\\s*){2,}`, "gi"), `For ${topic}, `)
    .replace(/\n{3,}/g, "\n\n");
}

function repairGeneratedLeadins(body: string, meta: Frontmatter) {
  const topic = shortTopicFor(meta);
  const escapedTopic = escapeRegExp(topic);

  return body
    .replace(/^##\s+(.+?\breconciliation):\s+(.+)$/gim, "## $1 - $2")
    .replace(/\bFor ([^,\n]{3,120}),\s+For ([^,\n]{3,120}),\s+/gi, "For $2, ")
    .replace(/\bFor ([^,\n]{3,120}),\s+aY 2026-27\b/g, "For $1, AY 2026-27")
    .replace(/\bWhen reviewing ([^,\n]{3,120}),\s+For ([^,\n]{3,120}),\s+/gi, "When reviewing $2, ")
    .replace(/\bBefore filing,\s+For ([^,\n]{3,120}),\s+/gi, "Before filing $1, ")
    .replace(/\bFor ([^,\n]{3,120}),\s+for any\b/gi, "For $1 and any")
    .replace(new RegExp(`^##\\s+${escapedTopic}:\\s+Act on the reconciled position:\\s*.+$`, "gim"), `## Use the resolved ${topic} position`)
    .replace(new RegExp(`^##\\s+${escapedTopic}:\\s+Documents to reconcile for ${escapedTopic}\\s*$`, "gim"), `## Records to verify for ${topic}`)
    .replace(new RegExp(`^##\\s+Related filing paths for ${escapedTopic}\\s*$`, "gim"), `## Where to continue after ${topic}`)
    .replace(/\n{3,}/g, "\n\n");
}

function replaceGenericLinkLabels(body: string) {
  return body
    .replace(/\[Related MyeCA guide\]\(\/blog\/([^)]+)\)/g, (_match, slug: string) => {
      return `[${humanizeSlug(slug)}](/blog/${slug})`;
    })
    .replace(/\[[^\]]+\]\(\/blog\/mye-ca-document-vault-guide\)/g, "[MyeCA document vault guide](/blog/mye-ca-document-vault-guide)")
    .replace(/\[[^\]]+\]\(\/blog\/mye-ca-complete-tax-filing-playbook\)/g, "[MyeCA complete tax filing playbook](/blog/mye-ca-complete-tax-filing-playbook)")
    .replace(/\[[^\]]+\]\(\/blog\/government-schemes-msme-startup-eligibility-document-checklist\)/g, "[Government scheme eligibility and document checklist](/blog/government-schemes-msme-startup-eligibility-document-checklist)");
}

function replaceBrandPromotion(value: string) {
  return value
    .replace(/\b15 ITR Filing Mistakes MyeCA Helps You Avoid\b/g, "15 ITR Filing Mistakes to Avoid")
    .replace(/\bMyeCA helps you avoid\b/gi, "A documented workflow can prevent")
    .replace(/\bMyeCA helps (taxpayers and businesses|taxpayers|businesses|founders|employers|individuals and businesses|startups|deductors)\s+/gi, (_match, audience: string) => {
      return `${audience.charAt(0).toUpperCase()}${audience.slice(1)} should `;
    })
    .replace(/\bMyeCA helps\s+/gi, "Use a documented workflow to ")
    .replace(/\bMyeCA works with (taxpayers and businesses|taxpayers|businesses|founders|employers|startups|deductors) to\s+/gi, (_match, audience: string) => {
      return `${audience.charAt(0).toUpperCase()}${audience.slice(1)} should `;
    })
    .replace(/\bMyeCA works alongside you on\b/gi, "A complete workflow covers")
    .replace(/\bthrough MyeCA\b/gi, "through a documented review");
}

function replaceGenericPhrases(body: string, primaryKeyword: string) {
  return replaceBrandPromotion(replaceGenericLinkLabels(body))
    .replace(/^Related reading:\s*$/gim, "Related reading.")
    .replace(/^(?:A\s+)?Reddit-style[^\n]*$/gim, "")
    .replace(/^(#{2,4})\s+Official source baseline\s*$/gim, `$1 Official references for ${primaryKeyword}`)
    .replace(/^(#{2,4})\s+Final takeaway\s*$/gim, `$1 Next step for ${primaryKeyword}`)
    .replace(/\bCA-reviewed guides\b/gi, "evidence-led guides")
    .replace(/\bCA-reviewed guidance\b/gi, "evidence-led guidance")
    .replace(/\bCA[- ]led review\b/gi, "document-based professional review")
    .replace(/\bCA review workflow\b/gi, "professional review workflow")
    .replace(/\bCA-led tax editorial team\b/gi, "tax and compliance editorial team")
    .replace(/\bCA MyeCA Review Desk\b/gi, "MyeCA Editorial Team")
    .replace(/^##\s+CA technical review note\s*$/gim, `## Records that support ${primaryKeyword}`)
    .replace(/^##\s+CA technical note\s*$/gim, `## Source records and filing risks for ${primaryKeyword}`)
    .replace(/^##\s+Reviewer handoff note\s*$/gim, `## When professional review helps with ${primaryKeyword}`)
    .replace(/^##\s+Internal review checklist before filing\s*$/gim, `## Final filing checks for ${primaryKeyword}`)
    .replace(/\bFor ([^,\n]{3,120}),\s+for this topic,\s+/gi, "For $1, ")
    .replace(/\bFor this topic,\s+/gi, "")
    .replace(/\bFor this topic,\s+the reviewer should\s+/gi, "For this topic, ")
    .replace(/\bFor ([^.\n]{3,90}),\s+the reviewer should\s+/gi, "For $1, ")
    .replace(/\bThe reviewer should\s+/gi, "Before filing, ")
    .replace(/\bThe reviewer must check\s+/gi, "Check ")
    .replace(/\bThe minimum evidence file should\s+/gi, "The working file should ")
    .replace(/\bThe minimum evidence file must\s+/gi, "The working file must ")
    .replace(/\bMyeCA helps taxpayers organise\b/gi, "Taxpayers should organise")
    .replace(/\breviewer initials\b/gi, "the name of the person who completed the check")
    .replace(/\btDS\b/g, "TDS")
    .replace(/\btCS\b/g, "TCS")
    .replace(/\baIS\b/g, "AIS")
    .replace(/\biTR\b/g, "ITR")
    .replace(/\bgST\b/g, "GST")
    .replace(/\bpAN\b/g, "PAN")
    .replace(/â‚¹/g, "\u20B9")
    .replace(/\n{3,}/g, "\n\n");
}

function replaceRepeatedListGuidance(body: string, meta: Frontmatter) {
  const topic = shortTopicFor(meta);

  return body
    .replace(/^[-*+]\s+Identify whether [^.\n]{3,180} affects AY 2026-27 filing, Tax Year 2026-27 compliance, or both\.\s*$/gim, "")
    .replace(/^([-*+]\s+)Read the official source and map the rule to your income head, taxpayer type, and dates\.$/gim,
      "")
    .replace(/^([-*+]\s+)Collect source records, computation notes, challans, statements, and (?:declarations|employer declarations) before [^.]+\.$/gim,
      "")
    .replace(/^([-*+]\s+)Check whether the position changes the ITR form, schedule, tax payment, TDS\/TCS, or disclosure route\.$/gim,
      "")
    .replace(/^([-*+]\s+)Preserve the final return, acknowledgement, e-verification proof, and supporting working papers\.$/gim,
      "")
    .replace(/^[-*+]\s+For [^.\n]{3,120}, open the current official source and map the rule to the relevant income head, taxpayer type, and dates\.\s*$/gim, "")
    .replace(/^[-*+]\s+Build the [^.\n]{3,120} file from source records, computation notes, challans, statements, and declarations before filing or payment\.\s*$/gim, "")
    .replace(/^[-*+]\s+Use the [^.\n]{3,120} working to determine whether the ITR form, schedule, tax payment, TDS\/TCS, or disclosure route changes\.\s*$/gim, "")
    .replace(/^[-*+]\s+Close the [^.\n]{3,120} file with the final return, acknowledgement, e-verification proof, and supporting working papers\.\s*$/gim, "")
    .replace(/^([-*+]\s+)Treating a headline slab, rebate, or threshold(?: announcement)? as (?:if it were )?(?:the finished|a final) computation(?: without checking the notified rules)?\.$/gim,
      `$1In the ${topic} review, do not treat a headline slab, rebate, or threshold as the completed computation.`)
    .replace(/^([-*+]\s+)(?:Using|Reaching for) a familiar old form number without (?:first )?checking (?:what )?the current (?:official|notified) form(?: on the portal)?(?: requires)?\.$/gim,
      `$1For ${topic}, confirm the current notified form instead of reusing a familiar form number.`)
    .replace(/^([-*+]\s+)Mixing AY 2026-27 filing records with Tax Year 2026-27 (?:payment or TDS|TDS or payment) records[^.]*\.$/gim,
      `$1Keep the ${topic} AY 2026-27 filing records separate from Tax Year 2026-27 payment and TDS records.`)
    .replace(/^([-*+]\s+)(?:Filing or paying|Paying or filing) before reconciling AIS, Form 26AS, challans, books, and certificates(?: against each other| have been reconciled)?\.$/gim,
      `$1Before completing ${topic}, reconcile AIS, Form 26AS, challans, books, and certificates.`)
    .replace(/^([-*+]\s+)Confirm (?:the )?(?:correct )?assessment year is AY 2026-27 for FY 2025-26 income(?: before proceeding)?\.$/gim,
      `$1For ${topic}, confirm AY 2026-27 is the correct assessment year for FY 2025-26 income.`)
    .replace(/^([-*+]\s+)Compare Form 16 or Form 16A (?:against|with) AIS, TIS, Form 26AS,([^.]*)\.$/gim,
      `$1In the ${topic} working, compare Form 16 or Form 16A with AIS, TIS, Form 26AS,$2.`)
    .replace(/^([-*+]\s+)File only after the figures are (?:fully )?supportable,?(.*)$/gim,
      `$1Complete ${topic} filing only after the figures are supportable,$2`);
}

function reduceKeywordScaffolding(body: string, meta: Frontmatter) {
  const primaryKeyword = meta.primaryKeyword?.trim();
  if (!primaryKeyword) return body;
  const shortTopic = shortTopicFor(meta);
  const primaryPattern = new RegExp(escapeRegExp(primaryKeyword), "gi");
  return body
    .replace(/^#{2,4}\s+.+$/gim, (heading) => heading.replace(primaryPattern, shortTopic))
    .replace(/\[([^\]]+)\]\((\/[^)]+)\)/g, (_match, label: string, href: string) => {
      return `[${label.replace(primaryPattern, shortTopic)}](${href})`;
    });
}

function replaceUnsupportedReviewClaimText(value: string) {
  return value
    .replace(/\b(?:A\s+)?Reddit-style\s+/gi, "")
    .replace(/\bCA[- ]led review\b/gi, "document-based professional review")
    .replace(/\bCA review workflow\b/gi, "professional review workflow");
}

function isGeneratedFaqQuestion(value: string) {
  return /^(?:what should i (?:check|verify) first for|which official source (?:supports this|should i check for)|what mismatch can delay|when should i get help with|when does .+ need case-specific review)/i.test(
    value.trim(),
  );
}

function makeFaqQuestionSpecific(value: string, meta: Frontmatter) {
  return value.replace(/^What should be\s+/i, `For ${shortTopicFor(meta)}, what should be `);
}

function hasVerifiedReviewer(meta: Frontmatter) {
  return Boolean(meta.reviewerName && meta.reviewerCredentialName && meta.reviewerCredentialId);
}

function normalizeFrontmatter(meta: Frontmatter, repeatedFaqs: Set<string>) {
  const checkedAt = String(meta.modifiedAt || meta.publishedAt || "2026-06-06").slice(0, 10);
  const primaryKeyword = meta.primaryKeyword?.trim() || meta.title?.trim() || "";
  const keyTopics = (meta.keyHighlights?.length ? meta.keyHighlights : meta.tags ?? []).filter(Boolean).slice(0, 8);
  const faqs = meta.faqs ?? [];
  const usesRepeatedFaq = faqs.some((faq) =>
    repeatedFaqs.has(normalizeText(faq.question ?? "")) ||
    repeatedFaqs.has(normalizeText(faq.answer ?? "")) ||
    isGeneratedFaqQuestion(faq.question ?? "") ||
    /start with the records that support|confirm that its current page, form, eligibility rule, or deadline applies|\.;|;\s*;|(^|[^.])\.\.($|[^.])/i.test(faq.answer ?? ""),
  );

  meta.userIntent = meta.contentType === "comparison" ? "commercial" : "informational";
  meta.keyTopics = keyTopics.length ? keyTopics : [primaryKeyword];
  meta.qualityStatus = "needs_revision";
  delete meta.editorialApprovedBy;
  delete meta.editorialApprovedAt;

  for (const field of ["title", "description", "excerpt", "seoTitle", "seoDescription", "authorRole", "authorBio"] as const) {
    if (typeof meta[field] === "string") {
      meta[field] = replaceBrandPromotion(replaceUnsupportedReviewClaimText(meta[field] as string));
    }
  }
  for (const field of ["keyHighlights", "keyTopics", "tags", "steps"] as const) {
    if (Array.isArray(meta[field])) {
      meta[field] = (meta[field] as unknown[]).map((value) =>
        typeof value === "string" ? replaceUnsupportedReviewClaimText(value) : value,
      ) as never;
    }
  }
  meta.faqs = (meta.faqs ?? [])
    .map((faq) => ({
      question: makeFaqQuestionSpecific(replaceUnsupportedReviewClaimText(faq.question ?? ""), meta),
      answer: replaceUnsupportedReviewClaimText(faq.answer ?? ""),
    }))
    .filter((faq) =>
      faq.question.trim() &&
      faq.answer.trim() &&
      !isGeneratedFaqQuestion(faq.question) &&
      !repeatedFaqs.has(normalizeText(faq.question)) &&
      !repeatedFaqs.has(normalizeText(faq.answer)),
    );

  meta.sourceLinks = (meta.sourceLinks ?? []).map((source) => ({
    label: source.label ?? "",
    url: source.url ?? "",
    checkedAt: source.checkedAt || checkedAt,
  }));

  if (!hasVerifiedReviewer(meta)) {
    delete meta.reviewedBy;
    delete meta.reviewedAt;
    delete meta.reviewerName;
    delete meta.reviewerRole;
    delete meta.reviewerCredentialName;
    delete meta.reviewerCredentialId;
    delete meta.reviewerCredentialAuthority;
  }

  if (typeof meta.authorRole === "string" && /\bca[- ]led\b/i.test(meta.authorRole)) {
    meta.authorRole = "Tax and Compliance Editorial Desk";
  }
  if (typeof meta.authorBio === "string" && /\bca[- ]reviewed\b/i.test(meta.authorBio)) {
    meta.authorBio = "The MyeCA Editorial Team prepares evidence-led guides for Indian taxpayers, freelancers, founders, and small businesses.";
  }
  return usesRepeatedFaq;
}

function reusableFragments(body: string) {
  return body
    .replace(/\r\n/g, "\n")
    .split(/\n+/)
    .filter((line) => !/^\s*(?:#{1,6}\s+|[-*+]\s+|\d+[.)]\s+|\|)/.test(line))
    .flatMap((line) => line.split("|"))
    .flatMap((fragment) => fragment.split(/(?<=[.!?])\s+/))
    .map((fragment) => fragment
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/^\s*(?:[-*+]|\d+[.)]|>)\s*/, "")
      .replace(/[*_`]/g, "")
      .replace(/\s+/g, " ")
      .trim())
    .filter((fragment) => fragment.length >= 55 && fragment.length <= 420)
    .filter((fragment) => fragment.split(/\s+/).length >= 8);
}

function renderFaqs(faqs: Frontmatter["faqs"]) {
  return (faqs ?? [])
    .filter((faq) => faq.question?.trim() && faq.answer?.trim())
    .map((faq) => `### ${faq.question?.trim()}\n\n${faq.answer?.trim()}`)
    .join("\n\n");
}

function synchronizeVisibleFaqs(body: string, faqs: Frontmatter["faqs"]) {
  const rendered = renderFaqs(faqs);
  if (!rendered) return body;
  const section = `## Frequently asked questions\n\n${rendered}`;
  const existing = body.match(/^## Frequently asked questions\s*$[\s\S]*?(?=^##\s|(?![\s\S]))/im);
  if (existing) return body.replace(existing[0], `${section}\n\n`);
  return `${body.trim()}\n\n${section}`;
}

function removeGeneratedFaqSections(body: string, repeatedFaqs: Set<string>) {
  return body.replace(/^## Frequently asked questions\s*$[\s\S]*?(?=^##\s|(?![\s\S]))/gim, (section) => {
    const normalized = normalizeText(section);
    const containsRepeatedFaq = [...repeatedFaqs].some((faq) => faq && normalized.includes(faq));
    return containsRepeatedFaq || /what should i (?:check|verify) first for|which official source (?:supports this|should i check for)|what mismatch can delay|when should i get help with|need case-specific review/i.test(section)
      ? ""
      : section;
  });
}

function internalLinks(body: string) {
  return [...body.matchAll(/\]\((\/[^)#? ]+)/g)].map((match) => match[1]);
}

function addRelatedLinks(body: string, meta: Frontmatter) {
  const existing = new Set(internalLinks(body));
  if (existing.size >= 4) return body;
  const keyword = shortTopicFor(meta);
  const related = (meta.relatedPostIds ?? []).slice(0, 2).map((slug) => ({
    label: humanizeSlug(slug),
    href: `/blog/${slug}`,
  }));
  const categoryFallbacks: Record<string, Array<{ label: string; href: string }>> = {
    "government-schemes": [
      { label: "Government scheme eligibility and document checklist", href: "/blog/government-schemes-msme-startup-eligibility-document-checklist" },
      { label: "Build a reusable document vault", href: "/blog/mye-ca-document-vault-guide" },
      { label: "Review a tax or compliance consequence", href: "/expert-consultation" },
      { label: "Browse current taxpayer guides", href: "/blog" },
    ],
    "business-compliance": [
      { label: "Compare business compliance services", href: "/all-services" },
      { label: "Prepare a business document vault", href: "/blog/business-document-vault-registrations-certificates-renewals" },
      { label: "Review GST registration scope", href: "/services/gst-registration" },
      { label: "Get document-based compliance help", href: "/expert-consultation" },
    ],
    "foreign-assets-nri-tax": [
      { label: "Choose the correct ITR form", href: "/itr/form-selector" },
      { label: "Review AIS before filing", href: "/ais-viewer" },
      { label: "Prepare foreign-asset filing records", href: "/blog/schedule-fa-foreign-bank-rsu-espp-us-stocks" },
      { label: "Get document-based filing help", href: "/expert-consultation" },
    ],
    "capital-gains": [
      { label: "Estimate capital-gains tax", href: "/calculators/capital-gains" },
      { label: "Choose the correct ITR form", href: "/itr/form-selector" },
      { label: "Review AIS before filing", href: "/ais-viewer" },
      { label: "Get document-based filing help", href: "/expert-consultation" },
    ],
  };
  const fallbacks = [
    ...(meta.serviceSlug ? [{
      label: `Review ${humanizeSlug(meta.serviceSlug)} service scope`,
      href: `/services/${meta.serviceSlug}`,
    }] : []),
    ...(meta.calculatorSlug ? [{
      label: `Use the ${humanizeSlug(meta.calculatorSlug)} calculator`,
      href: `/calculators/${meta.calculatorSlug}`,
    }] : []),
    ...(categoryFallbacks[String(meta.categoryId ?? "")] ?? []),
    { label: `Choose the filing route for ${keyword}`, href: "/itr/form-selector" },
    { label: `Review source records for ${keyword}`, href: "/ais-viewer" },
    { label: `Get document-based help with ${keyword}`, href: meta.ctaHref || "/expert-consultation" },
    { label: "Browse MyeCA tax and compliance guides", href: "/blog" },
  ];
  const links = [...related, ...fallbacks]
    .filter((item, index, items) => items.findIndex((candidate) => candidate.href === item.href) === index)
    .filter((item) => !existing.has(item.href))
    .slice(0, Math.max(0, 4 - existing.size));
  if (!links.length) return body;

  const sectionHeading = chooseForRoute(meta, [
    `${keyword}: related filing and record tools`,
    `${keyword}: useful routes after review`,
    `${keyword}: nearest related action`,
    `${keyword}: supporting calculators and services`,
    `Move from ${keyword} guidance to action`,
    `${keyword}: tools for the next step`,
    `Related compliance work after ${keyword}`,
    `Where the ${keyword} decision leads next`,
  ]);
  return `${body.trim()}\n\n## ${sectionHeading}\n\n${links.map((link) => `- [${link.label}](${link.href})`).join("\n")}`;
}

async function loadBlogs(): Promise<BlogFile[]> {
  const names = (await fs.readdir(blogDir)).filter((name) => name.endsWith(".mdx")).sort();
  return Promise.all(names.map(async (name) => {
    const filePath = path.join(blogDir, name);
    const raw = await fs.readFile(filePath, "utf8");
    const match = raw.match(frontmatterPattern);
    if (!match) throw new Error(`Missing JSON frontmatter in ${filePath}`);
    return {
      filePath,
      frontmatter: JSON.parse(match[1]) as Frontmatter,
      body: match[2].trim(),
    };
  }));
}

async function main() {
  const blogs = await loadBlogs();
  const paragraphRoutes = new Map<string, Set<string>>();
  const faqCounts = new Map<string, number>();
  const fragmentOccurrences = new Map<string, { fragment: string; routes: Set<string> }>();

  for (const blog of blogs) {
    const route = `/blog/${blog.frontmatter.slug ?? path.basename(blog.filePath, ".mdx")}`;
    for (const block of splitBlocks(blog.body).filter(isPlainLongParagraph)) {
      const key = normalizeText(block);
      const routes = paragraphRoutes.get(key) ?? new Set<string>();
      routes.add(route);
      paragraphRoutes.set(key, routes);
    }
    for (const fragment of reusableFragments(blog.body)) {
      const key = normalizeText(fragment);
      const occurrence = fragmentOccurrences.get(key) ?? { fragment, routes: new Set<string>() };
      occurrence.routes.add(route);
      fragmentOccurrences.set(key, occurrence);
    }
    for (const faq of blog.frontmatter.faqs ?? []) {
      for (const value of [faq.question ?? "", faq.answer ?? ""]) {
        const key = normalizeText(value);
        faqCounts.set(key, (faqCounts.get(key) ?? 0) + 1);
      }
    }
  }

  const repeatedFaqs = new Set(
    [...faqCounts.entries()].filter(([, count]) => count >= 3).map(([faq]) => faq),
  );
  const repeatedFragments = new Map(
    [...fragmentOccurrences.entries()]
      .filter(([, occurrence]) => occurrence.routes.size >= 3)
      .map(([key, occurrence]) => [key, occurrence.fragment]),
  );

  let changed = 0;
  for (const blog of blogs) {
    const before = JSON.stringify(blog.frontmatter) + blog.body;
    normalizeFrontmatter(blog.frontmatter, repeatedFaqs);
    const primaryKeyword = blog.frontmatter.primaryKeyword?.trim() || blog.frontmatter.title?.trim() || "this topic";
    const withoutGeneratedFaqs = removeGeneratedFaqSections(blog.body, repeatedFaqs);
    const withFaqs = synchronizeVisibleFaqs(withoutGeneratedFaqs, blog.frontmatter.faqs);
    blog.body = normalizeMarkdownStructure(
      disambiguateDuplicateHeadings(
        addRelatedLinks(
          reduceKeywordScaffolding(
            replaceRepeatedProseStems(
              repairGeneratedLeadins(
                makeRepeatedHeadingPrefixesSpecific(
                  replaceTemplateHeadingPrefixes(
                      replaceRepeatedListGuidance(
                        replaceGenericPhrases(
                          replaceRepeatedGenericHeadings(withFaqs, blog.frontmatter),
                          primaryKeyword,
                        ),
                        blog.frontmatter,
                      ),
                    blog.frontmatter,
                  ),
                  blog.frontmatter,
                ),
                blog.frontmatter,
              ),
              blog.frontmatter,
            ),
            blog.frontmatter,
          ).replace(/\n{3,}/g, "\n\n").trim(),
          blog.frontmatter,
        ),
        blog.frontmatter,
      ),
    );

    const after = JSON.stringify(blog.frontmatter) + blog.body;
    if (before === after) continue;
    changed += 1;
    await fs.writeFile(
      blog.filePath,
      `---\n${JSON.stringify(blog.frontmatter, null, 2)}\n---\n\n${blog.body}\n`,
      "utf8",
    );
  }

  console.log(
    `Normalized ${changed}/${blogs.length} blogs; removed generated artifacts and replaced ${repeatedFaqs.size} repeated FAQ families without keyword-prefixing repeated prose.`,
  );
}

await main();
