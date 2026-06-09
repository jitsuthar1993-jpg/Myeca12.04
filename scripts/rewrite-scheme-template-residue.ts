import fs from "node:fs/promises";
import path from "node:path";
import { cleanSchemeEditorialBody } from "./lib/scheme-editorial-cleanup.js";

type Frontmatter = Record<string, unknown> & {
  title?: string;
  primaryKeyword?: string;
  categoryId?: string;
  keyTopics?: string[];
  sourceLinks?: Array<{ label?: string; url?: string }>;
};

const rootDir = process.cwd();
const blogDir = path.join(rootDir, "content", "blog");
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

async function run() {
  const names = (await fs.readdir(blogDir)).filter((name) => name.endsWith(".mdx")).sort();
  let changed = 0;

  for (const name of names) {
    const filePath = path.join(blogDir, name);
    const raw = await fs.readFile(filePath, "utf8");
    const match = raw.match(frontmatterPattern);
    if (!match) throw new Error(`Missing JSON frontmatter in ${filePath}`);
    const frontmatter = JSON.parse(match[1]) as Frontmatter;
    if (frontmatter.categoryId !== "government-schemes") continue;

    const topics = frontmatter.keyTopics ?? [];
    const source = frontmatter.sourceLinks?.find((item) => item.label && !/myscheme/i.test(item.label))
      ?? frontmatter.sourceLinks?.find((item) => item.label);
    const body = match[2].trim();
    const nextBody = cleanSchemeEditorialBody(body, {
      title: frontmatter.title ?? name.replace(/\.mdx$/, ""),
      primaryKeyword: frontmatter.primaryKeyword ?? frontmatter.title ?? "scheme application",
      focus: topics[0] ?? "review the application records",
      documents: topics.slice(1),
      sourceLabel: source?.label ?? "the official authority page",
    });
    if (nextBody === body) continue;

    await fs.writeFile(
      filePath,
      `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${nextBody}\n`,
      "utf8",
    );
    changed += 1;
  }

  console.log(`Replaced generated scheme-workflow residue in ${changed} published articles.`);
}

await run();
