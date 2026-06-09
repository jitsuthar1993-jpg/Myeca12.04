import fs from "node:fs";
import path from "node:path";

import { loadStaticMdxBlogPosts } from "../server/data/static-blog-content";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "client", "public");
const replaceLegacyTextCovers = process.argv.includes("--replace-legacy-text-covers");
const legacyCoverMarker = "MyeCA blog cover based on the article content";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function estimateWidth(text: string, fontSize: number) {
  return text.split("").reduce((sum, char) => {
    if (char === " ") return sum + fontSize * 0.32;
    if ("ilI1.,/'".includes(char)) return sum + fontSize * 0.24;
    if ("mwMW@#%&".includes(char)) return sum + fontSize * 0.82;
    if (/[A-Z]/.test(char)) return sum + fontSize * 0.64;
    return sum + fontSize * 0.53;
  }, 0);
}

function wrapText(text: string, fontSize: number, maxWidth: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (!current || estimateWidth(next, fontSize) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;

  const clipped = lines.slice(0, maxLines);
  clipped[maxLines - 1] = `${clipped[maxLines - 1].replace(/\s+\S*$/, "").trim()}...`;
  return clipped;
}

function titleCase(value: string) {
  return value
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function coverFor(post: ReturnType<typeof loadStaticMdxBlogPosts>[number]) {
  const isScheme = post.categoryId === "government-schemes";
  const palette = isScheme
    ? { bg: "#f3faf7", panel: "#ffffff", ink: "#12352f", accent: "#0f8a70", pale: "#dff7ef" }
    : { bg: "#f3f7ff", panel: "#ffffff", ink: "#10233f", accent: "#2563eb", pale: "#dbeafe" };
  const eyebrow = isScheme ? "Government scheme" : "Tax Year 2026-27";
  const subLabel = isScheme ? "Official-source guide" : "Source-first guide";
  const category = titleCase(post.categoryId || "Income Tax").slice(0, 26);
  const titleLines = wrapText(post.title, 48, 860, 4);
  const titleSvg = titleLines
    .map(
      (line, index) =>
        `<text x="96" y="${202 + index * 56}" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="900" fill="${palette.ink}">${escapeXml(line)}</text>`,
    )
    .join("\n  ");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(post.title)}</title>
  <desc id="desc">Standard MyeCA blog cover with safe title wrapping.</desc>
  <rect width="1200" height="630" fill="${palette.bg}"/>
  <rect x="30" y="30" width="1140" height="570" rx="24" fill="${palette.panel}" stroke="${palette.ink}" stroke-width="3"/>
  <rect x="60" y="60" width="1080" height="510" rx="18" fill="none" stroke="${palette.pale}" stroke-width="3"/>
  <rect x="74" y="140" width="10" height="250" rx="5" fill="${palette.accent}"/>
  <text x="84" y="92" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="900" letter-spacing="5" fill="${palette.ink}">MYECA INSIGHTS</text>
  <g transform="translate(802 66)">
    <rect x="0" y="0" width="294" height="76" rx="16" fill="${palette.pale}" stroke="${palette.ink}" stroke-width="3"/>
    <text x="24" y="32" font-family="Arial, Helvetica, sans-serif" font-size="21" font-weight="900" fill="${palette.accent}">${escapeXml(eyebrow)}</text>
    <text x="24" y="58" font-family="Arial, Helvetica, sans-serif" font-size="17" font-weight="800" fill="${palette.ink}">${escapeXml(subLabel)}</text>
  </g>
  <rect x="96" y="116" width="290" height="42" rx="21" fill="${palette.accent}"/>
  <text x="118" y="143" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="#ffffff">${escapeXml(category)}</text>
  ${titleSvg}
  <line x1="96" y1="438" x2="740" y2="438" stroke="${palette.pale}" stroke-width="4" stroke-linecap="round"/>
  <g transform="translate(96 492)">
    <rect x="0" y="0" width="190" height="48" rx="14" fill="${palette.pale}"/>
    <text x="22" y="31" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="${palette.ink}">Editorial guide</text>
  </g>
  <g transform="translate(306 492)">
    <rect x="0" y="0" width="244" height="48" rx="14" fill="#ffffff" stroke="${palette.pale}" stroke-width="3"/>
    <text x="22" y="31" font-family="Arial, Helvetica, sans-serif" font-size="19" font-weight="900" fill="${palette.ink}">Source-first guide</text>
  </g>
  <text x="96" y="565" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="900" fill="${palette.ink}">MyeCA.in</text>
</svg>
`;
}

const posts = loadStaticMdxBlogPosts();
const targetCoverPosts = posts.filter((post) => {
  if (!post.coverImage?.startsWith("/assets/blog/text-covers/")) return false;
  const coverPath = path.join(publicDir, post.coverImage);
  if (!fs.existsSync(coverPath)) return true;
  if (!replaceLegacyTextCovers) return false;
  return fs.readFileSync(coverPath, "utf8").includes(legacyCoverMarker);
});

for (const post of targetCoverPosts) {
  const target = path.join(publicDir, post.coverImage!);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, coverFor(post), "utf8");
}

console.log(`Wrote ${targetCoverPosts.length} blog text covers.`);
