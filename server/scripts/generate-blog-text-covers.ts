import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { adminDb } from "../data-admin.js";
import { getDatabaseUrl } from "../db.js";
import { defaultBlogPosts } from "../data/default-blog-content.js";
import { blogTextCoverPath } from "../data/blog-cover-paths.js";

type CoverPost = {
  id: string;
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  categoryId?: string | null;
  keyHighlights?: string[];
  tags?: string[];
};

type VisualPlan = {
  headline: string;
  chip: string;
  cards: string[];
  motif: "calendar" | "chart" | "checklist" | "documents" | "gst" | "notice" | "refund" | "scale" | "vault";
  bg: string;
  panel: string;
  ink: string;
  accent: string;
  accent2: string;
};

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../client/public/assets/blog/text-covers",
);

const applyMode = process.argv.includes("--apply");

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeSlug(value: unknown, fallback: string) {
  const raw = typeof value === "string" && value.trim() ? value.trim() : fallback;
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || "blog-post";
}

function compactVisibleTitle(title: string) {
  const withoutYearNoise = (title.split(":")[0] ?? title)
    .replace(/\b(?:AY|FY)\s*\d{4}[-\u2013]\d{2}\b/gi, "")
    .replace(/\b\d{4}[-\u2013]\d{2}\b/g, "")
    .replace(/[?!.]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const withoutQuestionLead = withoutYearNoise
    .replace(/^(?:when|how|why|what|which|where)\s+(?:will|can|does|do|is|are|should)\s+/i, "")
    .replace(/^(?:should|can|could|will|does|do|is|are)\s+(?:i|you|we|my|your)?\s*/i, "")
    .replace(/^(?:the|a|an)\s+/i, "")
    .replace(/^i\s+(?:selected|have|need|want)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const compactWords = withoutQuestionLead.split(" ").filter(Boolean).slice(0, 7);
  const trailingSmallWords = new Set(["and", "for", "from", "in", "of", "the", "to", "under", "with"]);
  while (compactWords.length > 3 && trailingSmallWords.has(compactWords[compactWords.length - 1].toLowerCase())) {
    compactWords.pop();
  }

  const compact = compactWords.join(" ").trim();

  return compact || title;
}

function truncateText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  const clipped = normalized.slice(0, maxLength + 1).replace(/\s+\S*$/, "").trim();
  return clipped || normalized.slice(0, maxLength).trim();
}

function compactPhrase(value: string, maxWords = 5) {
  return truncateText(
    value
      .replace(/\b(?:AY|FY)\s*\d{4}[-\u2013]\d{2}\b/gi, "")
      .replace(/[?!.]+$/g, "")
      .replace(/^(?:how|when|why|what|which|should|can|does|do|is|are|will)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, maxWords)
      .join(" "),
    34,
  );
}

function keywordText(post: CoverPost) {
  return [
    post.title,
    post.excerpt,
    post.categoryId,
    ...(post.keyHighlights ?? []),
    ...(post.tags ?? []),
    post.content?.slice(0, 5000),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function defaultCardsForMotif(motif: VisualPlan["motif"]) {
  const defaults: Record<VisualPlan["motif"], string[]> = {
    calendar: ["Plan early", "Review mid-year", "File clean"],
    chart: ["Classify gains", "Match reports", "Check tax"],
    checklist: ["Avoid errors", "Review records", "File correctly"],
    documents: ["Collect records", "Reconcile data", "Preserve proof"],
    gst: ["Register right", "Match GSTR-2B", "Archive returns"],
    notice: ["Read notice", "Match records", "Reply on time"],
    refund: ["Match TDS", "Validate bank", "E-verify return"],
    scale: ["Compare regimes", "Check deductions", "Pick wisely"],
    vault: ["Name files", "Group proofs", "Keep records"],
  };
  return defaults[motif];
}

function cardLabelsFromContent(post: CoverPost, motif: VisualPlan["motif"]) {
  const labels = (post.keyHighlights ?? [])
    .map((highlight) => compactPhrase(highlight, 4))
    .filter((label) => label.length >= 8);

  if (labels.length >= 3) return labels.slice(0, 3);

  const excerptSentences = (post.excerpt ?? "")
    .split(/[.;:]/)
    .map((sentence) => compactPhrase(sentence, 4))
    .filter((label) => label.length >= 8);

  return [...labels, ...excerptSentences, ...defaultCardsForMotif(motif)].slice(0, 3);
}

function inferMotif(post: CoverPost): VisualPlan["motif"] {
  const text = keywordText(post);
  const category = post.categoryId ?? "";
  if (category === "tax-planning") return "calendar";
  if (category === "tax-regime") return "scale";
  if (category === "capital-gains") return "chart";
  if (category === "business-freelancers" && /(capital gain|mutual fund|equity|broker|crypto|f&o|intraday|trading)/.test(text)) return "chart";
  if (category === "business-freelancers") return "documents";
  if (category === "business-compliance") return "gst";
  if (category === "foreign-assets-nri-tax") return "documents";
  if (category === "mye-ca-guides" && /(document|vault|folder|upload|records)/.test(text)) return "vault";
  if (category === "refunds-notices" && /(refund|tds|form 16a|bank account)/.test(text)) return "refund";
  if (category === "refunds-notices") return "notice";
  if (/(capital gain|mutual fund|equity|broker|crypto|f&o|intraday|trading)/.test(text)) return "chart";
  if (/(refund|tds|form 16a|bank account|form 26as)/.test(text)) return "refund";
  if (/(gst|gstr|itc|invoice|registration|ecommerce)/.test(text)) return "gst";
  if (/(foreign|nri|schedule fa|form 67|foreign tax|rsu|espp)/.test(text)) return "documents";
  if (/(notice|defective|143\(1\)|demand|rectification|mismatch)/.test(text)) return "notice";
  if (/(old regime|new regime|87a|rebate|deduction|hra|80c|nps)/.test(text)) return "scale";
  if (/(document vault|documents|proof|records|folder|upload)/.test(text)) return "vault";
  if (/(calendar|month|advance tax|planning|march|april)/.test(text)) return "calendar";
  if (/(mistake|checklist|avoid|wrong form|error)/.test(text)) return "checklist";
  return "documents";
}

function themeForMotif(motif: VisualPlan["motif"]) {
  const themes: Record<VisualPlan["motif"], Pick<VisualPlan, "bg" | "panel" | "ink" | "accent" | "accent2">> = {
    calendar: { bg: "#f3f8ec", panel: "#fbfff6", ink: "#1f3a2d", accent: "#7aa95c", accent2: "#f0c66b" },
    chart: { bg: "#f2f7ff", panel: "#fbfdff", ink: "#102a4c", accent: "#2f6fed", accent2: "#77b7ff" },
    checklist: { bg: "#fff4df", panel: "#fffaf0", ink: "#10324a", accent: "#e19a44", accent2: "#1f8a70" },
    documents: { bg: "#f6f3ff", panel: "#fdfbff", ink: "#2b244d", accent: "#8c6bd8", accent2: "#f0b85a" },
    gst: { bg: "#edf8f6", panel: "#fbfffe", ink: "#0f3b37", accent: "#1f8a70", accent2: "#f0b85a" },
    notice: { bg: "#fff0ec", panel: "#fffaf7", ink: "#4a1f1a", accent: "#db654a", accent2: "#f0b85a" },
    refund: { bg: "#eef8ff", panel: "#fbfdff", ink: "#12304a", accent: "#2f8ed8", accent2: "#67c48b" },
    scale: { bg: "#fff5e8", panel: "#fffaf4", ink: "#3a2a17", accent: "#d28b36", accent2: "#5179c6" },
    vault: { bg: "#f4f6f8", panel: "#ffffff", ink: "#1e2f3d", accent: "#607d96", accent2: "#e0a84e" },
  };
  return themes[motif];
}

function visualPlanFor(post: CoverPost): VisualPlan {
  const motif = inferMotif(post);
  const theme = themeForMotif(motif);
  const highlight = post.keyHighlights?.[0] ?? post.excerpt ?? post.title;
  return {
    ...theme,
    motif,
    headline: compactVisibleTitle(post.title),
    chip: compactPhrase(highlight, 4),
    cards: cardLabelsFromContent(post, motif),
  };
}

function estimateLineWidth(text: string, fontSize: number) {
  return text.split("").reduce((width, char) => {
    if (char === " ") return width + fontSize * 0.32;
    if ("ilI1.,'".includes(char)) return width + fontSize * 0.24;
    if ("mwMW@#%&".includes(char)) return width + fontSize * 0.82;
    if (char === char.toUpperCase() && /[A-Z]/.test(char)) return width + fontSize * 0.68;
    return width + fontSize * 0.54;
  }, 0);
}

function wrapTitle(title: string, fontSize: number, maxWidth: number) {
  const words = title.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateLineWidth(candidate, fontSize) <= maxWidth || !current) {
      current = candidate;
      continue;
    }

    lines.push(current);
    current = word;
  }

  if (current) lines.push(current);
  return lines;
}

function clampLines(lines: string[], fontSize: number, maxWidth: number, maxLines: number) {
  if (lines.length <= maxLines) return lines;
  const visible = lines.slice(0, maxLines);
  let last = visible[maxLines - 1];
  while (last.length > 12 && estimateLineWidth(`${last}...`, fontSize) > maxWidth) {
    last = last.replace(/\s+\S*$/, "");
  }
  visible[maxLines - 1] = `${last.trim()}...`;
  return visible;
}

function titleLayout(title: string) {
  const candidates = [
    { fontSize: 88, maxLines: 2, lineHeight: 104 },
    { fontSize: 78, maxLines: 2, lineHeight: 94 },
    { fontSize: 68, maxLines: 3, lineHeight: 84 },
  ];

  for (const candidate of candidates) {
    const lines = wrapTitle(title, candidate.fontSize, 960);
    if (lines.length <= candidate.maxLines) return { ...candidate, lines };
  }

  const fallback = candidates[candidates.length - 1];
  return {
    ...fallback,
    lines: clampLines(wrapTitle(title, fallback.fontSize, 960), fallback.fontSize, 960, fallback.maxLines),
  };
}

function renderMotif(plan: VisualPlan) {
  const { ink, accent, accent2, motif } = plan;
  const documentLines = `
    <line x1="38" y1="70" x2="158" y2="70" stroke="${ink}" stroke-width="5"/>
    <line x1="38" y1="96" x2="182" y2="96" stroke="${ink}" stroke-width="5"/>
    <line x1="38" y1="122" x2="140" y2="122" stroke="${ink}" stroke-width="5"/>`;

  if (motif === "calendar") {
    return `<g transform="translate(416 252)">
    <rect x="0" y="0" width="320" height="238" rx="22" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <rect x="0" y="0" width="320" height="62" rx="22" fill="${accent}" stroke="${ink}" stroke-width="6"/>
    <text x="34" y="43" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="900" fill="#fff">TAX YEAR</text>
    ${[0, 1, 2].map((row) => [0, 1, 2, 3].map((col) => `<rect x="${34 + col * 66}" y="${88 + row * 45}" width="42" height="30" rx="7" fill="${row === 2 && col > 1 ? accent2 : "#fff8ec"}" stroke="${ink}" stroke-width="3"/>`).join("\n    ")).join("\n    ")}
  </g>`;
  }

  if (motif === "chart") {
    return `<g transform="translate(400 248)">
    <rect x="0" y="0" width="350" height="250" rx="24" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <line x1="58" y1="194" x2="298" y2="194" stroke="${ink}" stroke-width="5"/>
    <line x1="58" y1="54" x2="58" y2="194" stroke="${ink}" stroke-width="5"/>
    <path d="M70 174l54-48 48 28 58-76 56 28" fill="none" stroke="${accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="124" cy="126" r="12" fill="${accent2}" stroke="${ink}" stroke-width="4"/>
    <circle cx="230" cy="78" r="12" fill="${accent2}" stroke="${ink}" stroke-width="4"/>
  </g>`;
  }

  if (motif === "gst") {
    return `<g transform="translate(398 244)">
    <rect x="22" y="18" width="270" height="210" rx="16" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <rect x="58" y="0" width="270" height="210" rx="16" fill="#fffdfa" stroke="${ink}" stroke-width="6"/>
    <text x="94" y="62" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="900" fill="${accent}">GST</text>
    ${documentLines}
    <circle cx="250" cy="156" r="42" fill="${accent2}" stroke="${ink}" stroke-width="5"/>
    <text x="222" y="169" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="${ink}">2B</text>
  </g>`;
  }

  if (motif === "notice") {
    return `<g transform="translate(402 244)">
    <rect x="24" y="18" width="296" height="218" rx="20" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <path d="M44 52l128 86 128-86" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="260" cy="78" r="46" fill="${accent}" stroke="${ink}" stroke-width="6"/>
    <text x="248" y="97" font-family="Arial, Helvetica, sans-serif" font-size="56" font-weight="900" fill="#fff">!</text>
    <line x1="72" y1="168" x2="208" y2="168" stroke="${ink}" stroke-width="5"/>
    <line x1="72" y1="196" x2="174" y2="196" stroke="${ink}" stroke-width="5"/>
  </g>`;
  }

  if (motif === "refund") {
    return `<g transform="translate(390 246)">
    <rect x="20" y="50" width="336" height="190" rx="28" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <rect x="210" y="96" width="116" height="82" rx="18" fill="${accent}" stroke="${ink}" stroke-width="6"/>
    <circle cx="262" cy="137" r="14" fill="#fff"/>
    <circle cx="112" cy="48" r="48" fill="${accent2}" stroke="${ink}" stroke-width="6"/>
    <text x="82" y="64" font-family="Arial, Helvetica, sans-serif" font-size="44" font-weight="900" fill="${ink}">Rs</text>
    <line x1="70" y1="146" x2="172" y2="146" stroke="${ink}" stroke-width="5"/>
    <line x1="70" y1="178" x2="154" y2="178" stroke="${ink}" stroke-width="5"/>
  </g>`;
  }

  if (motif === "scale") {
    return `<g transform="translate(405 238)">
    <line x1="170" y1="46" x2="170" y2="230" stroke="${ink}" stroke-width="8"/>
    <line x1="72" y1="88" x2="268" y2="88" stroke="${ink}" stroke-width="8" stroke-linecap="round"/>
    <circle cx="170" cy="48" r="24" fill="${accent}" stroke="${ink}" stroke-width="6"/>
    <path d="M82 104l-50 86h100z" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <path d="M258 104l-50 86h100z" fill="${accent2}" stroke="${ink}" stroke-width="6"/>
    <rect x="98" y="230" width="144" height="34" rx="16" fill="${accent}" stroke="${ink}" stroke-width="6"/>
    <text x="48" y="174" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="900" fill="${ink}">OLD</text>
    <text x="222" y="174" font-family="Arial, Helvetica, sans-serif" font-size="27" font-weight="900" fill="${ink}">NEW</text>
  </g>`;
  }

  if (motif === "vault") {
    return `<g transform="translate(388 252)">
    <path d="M28 74h112l30 36h178v142H28z" fill="${accent2}" stroke="${ink}" stroke-width="6" stroke-linejoin="round"/>
    <rect x="58" y="28" width="234" height="168" rx="14" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <text x="92" y="86" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="900" fill="${ink}">DOCS</text>
    <line x1="92" y1="116" x2="230" y2="116" stroke="${ink}" stroke-width="5"/>
    <line x1="92" y1="146" x2="260" y2="146" stroke="${ink}" stroke-width="5"/>
    <path d="M28 128h320v124H28z" fill="${accent}" stroke="${ink}" stroke-width="6"/>
  </g>`;
  }

  if (motif === "checklist") {
    return `<g transform="translate(406 238)">
    <rect x="22" y="28" width="300" height="250" rx="24" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <rect x="108" y="0" width="128" height="50" rx="18" fill="${accent}" stroke="${ink}" stroke-width="6"/>
    ${[0, 1, 2].map((row) => `<path d="M72 ${95 + row * 54}l18 18 34-40" fill="none" stroke="${accent2}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
    <line x1="148" y1="${96 + row * 54}" x2="272" y2="${96 + row * 54}" stroke="${ink}" stroke-width="5"/>
    <line x1="148" y1="${120 + row * 54}" x2="236" y2="${120 + row * 54}" stroke="${ink}" stroke-width="5"/>`).join("\n    ")}
  </g>`;
  }

  return `<g transform="translate(398 244)">
    <rect x="28" y="24" width="248" height="210" rx="14" fill="#fff" stroke="${ink}" stroke-width="6"/>
    <rect x="82" y="0" width="248" height="210" rx="14" fill="#fffdfa" stroke="${ink}" stroke-width="6"/>
    <text x="118" y="58" font-family="Arial, Helvetica, sans-serif" font-size="38" font-weight="900" fill="${accent}">ITR</text>
    ${documentLines}
    <circle cx="284" cy="164" r="40" fill="${accent2}" stroke="${ink}" stroke-width="5"/>
    <path d="M264 164l16 16 30-42" fill="none" stroke="${ink}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

function renderContentBasedCoverSvg(post: CoverPost) {
  const plan = visualPlanFor(post);
  const escapedTitle = escapeXml(post.title);
  const headlineLines = titleLayout(plan.headline).lines.slice(0, 2);
  const chipY = headlineLines.length > 1 ? 306 : 246;
  const headlineText = headlineLines
    .map((line, index) => `<text x="72" y="${154 + index * 82}" font-family="Arial, Helvetica, sans-serif" font-size="74" font-weight="900" fill="${plan.ink}">${escapeXml(line)}</text>`)
    .join("\n  ");
  const cards = plan.cards
    .map((card, index) => {
      const y = 262 + index * 90;
      return `<g transform="translate(824 ${y})">
    <rect x="0" y="0" width="300" height="68" rx="18" fill="#fff" stroke="${plan.ink}" stroke-width="4"/>
    <circle cx="38" cy="34" r="16" fill="${index === 1 ? plan.accent2 : plan.accent}" stroke="${plan.ink}" stroke-width="3"/>
    <text x="70" y="43" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="${plan.ink}">${escapeXml(card)}</text>
  </g>`;
    })
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">${escapedTitle}</title>
  <desc id="desc">MyeCA blog cover based on the article content: ${escapeXml(plan.chip)}</desc>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${plan.bg}"/>
  <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="30" fill="${plan.panel}" stroke="${plan.ink}" stroke-width="3"/>
  <text x="72" y="88" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" letter-spacing="5" fill="${plan.ink}">MYECA INSIGHTS</text>
  ${headlineText}
  <rect x="72" y="${chipY}" width="330" height="48" rx="24" fill="#fff" stroke="${plan.ink}" stroke-width="3"/>
  <text x="98" y="${chipY + 32}" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="800" fill="${plan.ink}">${escapeXml(plan.chip)}</text>
  ${renderMotif(plan)}
  ${cards}
  <text x="72" y="574" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" fill="${plan.ink}">MyeCA.in</text>
</svg>
`;
}

function renderItrFilingStartSvg(post: CoverPost) {
  const escapedTitle = escapeXml(post.title);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="img" aria-labelledby="title desc">
  <title id="title">${escapedTitle}</title>
  <desc id="desc">Warm editorial MyeCA SVG diagram showing ITR form selection and filing-start readiness.</desc>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="#fff4df"/>
  <rect x="24" y="24" width="${WIDTH - 48}" height="${HEIGHT - 48}" rx="30" fill="#fff8ec" stroke="#10324a" stroke-width="3"/>
  <text x="72" y="88" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="800" letter-spacing="5" fill="#10324a">MYECA INSIGHTS</text>
  <text x="72" y="160" font-family="Arial, Helvetica, sans-serif" font-size="82" font-weight="900" fill="#10324a">ITR Filing Start</text>
  <rect x="72" y="184" width="616" height="44" rx="22" fill="#ffffff" stroke="#10324a" stroke-width="2"/>
  <text x="98" y="214" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" fill="#10324a">Form 16 + AIS + Form 26AS, then pick your ITR form</text>

  <g transform="translate(78 264) rotate(-7)">
    <rect x="0" y="0" width="192" height="142" rx="4" fill="#fffdfa" stroke="#10324a" stroke-width="5"/>
    <text x="24" y="48" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="#10324a">ITR-1</text>
    <line x1="24" y1="76" x2="150" y2="76" stroke="#10324a" stroke-width="4"/>
    <line x1="24" y1="98" x2="164" y2="98" stroke="#10324a" stroke-width="4"/>
    <line x1="24" y1="120" x2="128" y2="120" stroke="#10324a" stroke-width="4"/>
  </g>
  <g transform="translate(80 420) rotate(-5)">
    <rect x="0" y="0" width="192" height="118" rx="4" fill="#fffdfa" stroke="#10324a" stroke-width="5"/>
    <text x="24" y="45" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="#10324a">ITR-2</text>
    <line x1="24" y1="72" x2="154" y2="72" stroke="#10324a" stroke-width="4"/>
    <line x1="24" y1="94" x2="136" y2="94" stroke="#10324a" stroke-width="4"/>
  </g>
  <g transform="translate(930 264) rotate(7)">
    <rect x="0" y="0" width="192" height="142" rx="4" fill="#fffdfa" stroke="#10324a" stroke-width="5"/>
    <text x="24" y="48" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="#10324a">ITR-3</text>
    <line x1="24" y1="76" x2="150" y2="76" stroke="#10324a" stroke-width="4"/>
    <line x1="24" y1="98" x2="164" y2="98" stroke="#10324a" stroke-width="4"/>
    <line x1="24" y1="120" x2="118" y2="120" stroke="#10324a" stroke-width="4"/>
  </g>
  <g transform="translate(930 420) rotate(5)">
    <rect x="0" y="0" width="192" height="118" rx="4" fill="#fffdfa" stroke="#10324a" stroke-width="5"/>
    <text x="24" y="45" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="900" fill="#10324a">ITR-4</text>
    <line x1="24" y1="72" x2="154" y2="72" stroke="#10324a" stroke-width="4"/>
    <line x1="24" y1="94" x2="132" y2="94" stroke="#10324a" stroke-width="4"/>
  </g>

  <g transform="translate(430 250)">
    <circle cx="170" cy="118" r="84" fill="#d9823a" stroke="#10324a" stroke-width="5"/>
    <path d="M93 102c12-68 122-82 168-28 27 2 29 23 8 30 18 34-3 82-28 97-12-26-23-46-45-51-25-6-55 10-75 45-22-18-35-56-28-93z" fill="#071923"/>
    <circle cx="138" cy="126" r="7" fill="#071923"/>
    <circle cx="206" cy="126" r="7" fill="#071923"/>
    <path d="M154 166c17-12 36-12 53 0" fill="none" stroke="#071923" stroke-width="7" stroke-linecap="round"/>
    <path d="M96 214c28-42 118-50 150 0l28 126H68l28-126z" fill="#1f8a70" stroke="#10324a" stroke-width="5"/>
    <path d="M134 220l42 58 42-58" fill="none" stroke="#10324a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M112 238c30 28 78 30 126 0" fill="none" stroke="#10324a" stroke-width="5" stroke-linecap="round"/>
    <text x="302" y="110" font-family="Arial, Helvetica, sans-serif" font-size="98" font-weight="900" fill="#10324a">?</text>
    <text x="-44" y="110" font-family="Arial, Helvetica, sans-serif" font-size="98" font-weight="900" fill="#10324a">?</text>
  </g>

  <path d="M328 342c44-46 82-62 132-70" fill="none" stroke="#10324a" stroke-width="6" stroke-linecap="round"/>
  <path d="M432 248l34 21-31 25" fill="none" stroke="#10324a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M872 342c-44-46-82-62-132-70" fill="none" stroke="#10324a" stroke-width="6" stroke-linecap="round"/>
  <path d="M768 248l-34 21 31 25" fill="none" stroke="#10324a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>

  <text x="72" y="574" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="900" fill="#10324a">MyeCA.in</text>
</svg>
`;
}

function renderCoverSvg(post: CoverPost) {
  if (post.slug === "when-will-itr-filing-start-ay-2026-27") {
    return renderItrFilingStartSvg(post);
  }
  return renderContentBasedCoverSvg(post);
}

async function getDatabasePosts() {
  if (!getDatabaseUrl()) {
    console.warn("No database URL configured; generated fallback covers only.");
    return [];
  }

  try {
    const snapshot = await adminDb.collection("blog_posts").get();
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        title: typeof data.title === "string" && data.title.trim() ? data.title.trim() : "Untitled Post",
        slug: normalizeSlug(data.slug, doc.id),
        excerpt: typeof data.excerpt === "string" ? data.excerpt : null,
        content: typeof data.content === "string" ? data.content : null,
        categoryId: typeof data.categoryId === "string" ? data.categoryId : null,
        keyHighlights: Array.isArray(data.keyHighlights) ? data.keyHighlights.filter((item): item is string => typeof item === "string") : [],
        tags: Array.isArray(data.tags) ? data.tags.filter((item): item is string => typeof item === "string") : [],
      };
    });
  } catch (error) {
    console.warn("Could not load database blog posts; generated fallback covers only.");
    console.warn(error instanceof Error ? error.message : error);
    return [];
  }
}

async function updateDatabaseCoverImages(posts: CoverPost[]) {
  let updated = 0;

  for (const post of posts) {
    await adminDb.collection("blog_posts").doc(post.id).update({
      coverImage: blogTextCoverPath(post.slug),
    });
    updated += 1;
  }

  return updated;
}

async function run() {
  const databasePosts = await getDatabasePosts();
  const postsBySlug = new Map<string, CoverPost>();

  for (const post of defaultBlogPosts) {
    postsBySlug.set(post.slug, {
      id: post.id,
      title: post.title,
      slug: normalizeSlug(post.slug, post.id),
      excerpt: post.excerpt,
      content: post.content,
      categoryId: post.categoryId,
      keyHighlights: post.keyHighlights,
      tags: post.tags,
    });
  }

  for (const post of databasePosts) {
    postsBySlug.set(post.slug, post);
  }

  const posts = Array.from(postsBySlug.values()).sort((left, right) => left.slug.localeCompare(right.slug));

  if (!applyMode) {
    console.log(`Dry run: would generate ${posts.length} black-and-white blog covers.`);
    console.log("Run with --apply to write SVG files and update database coverImage values.");
    return;
  }

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  for (const post of posts) {
    await fs.writeFile(path.join(OUTPUT_DIR, `${post.slug}.svg`), renderCoverSvg(post), "utf8");
  }

  let updated = 0;
  if (databasePosts.length > 0) {
    updated = await updateDatabaseCoverImages(databasePosts);
  }

  console.log(`Generated ${posts.length} SVG covers in ${OUTPUT_DIR}`);
  console.log(`Updated ${updated} database blog_posts coverImage values.`);
}

run().catch((error) => {
  console.error("Blog text cover generation failed:", error);
  process.exit(1);
});
