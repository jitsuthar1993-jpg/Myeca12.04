import fs from "node:fs/promises";
import path from "node:path";
import {
  descriptionFromArticleBody,
  highlightsFromArticleBody,
  stepsFromArticleBody,
} from "./lib/public-blog-metadata.js";

type Frontmatter = Record<string, unknown> & {
  modifiedAt?: string;
  description?: string;
  excerpt?: string;
  seoDescription?: string;
  steps?: string[];
  keyHighlights?: string[];
  status?: string;
};

const rootDir = process.cwd();
const publishedDir = path.join(rootDir, "content", "blog");
const draftDir = path.join(rootDir, "content", "blog-drafts");
const checkedAt = "2026-06-07T00:00:00.000Z";
const frontmatterPattern = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

async function readArticle(filePath: string) {
  const raw = await fs.readFile(filePath, "utf8");
  const match = raw.match(frontmatterPattern);
  if (!match) throw new Error(`Missing JSON frontmatter in ${filePath}`);
  return {
    frontmatter: JSON.parse(match[1]) as Frontmatter,
    body: match[2].trim(),
  };
}

function render(frontmatter: Frontmatter, body: string) {
  return `---\n${JSON.stringify(frontmatter, null, 2)}\n---\n\n${body}\n`;
}

async function run() {
  const draftNames = (await fs.readdir(draftDir)).filter((name) => name.endsWith(".mdx")).sort();
  let updatedPublished = 0;
  let synchronizedDrafts = 0;

  for (const name of draftNames) {
    const publishedPath = path.join(publishedDir, name);
    const draftPath = path.join(draftDir, name);
    const published = await readArticle(publishedPath);
    const description = descriptionFromArticleBody(published.body);
    const steps = stepsFromArticleBody(published.body);
    const highlights = highlightsFromArticleBody(published.body);
    const nextPublished: Frontmatter = {
      ...published.frontmatter,
      description,
      modifiedAt: checkedAt,
      excerpt: description,
      seoDescription: description,
      steps,
      keyHighlights: highlights,
    };
    delete nextPublished.status;

    const publishedOutput = render(nextPublished, published.body);
    if (publishedOutput !== render(published.frontmatter, published.body)) {
      await fs.writeFile(publishedPath, publishedOutput, "utf8");
      updatedPublished += 1;
    }

    const draft = await readArticle(draftPath);
    const nextDraft = { ...nextPublished, status: "draft" };
    const draftOutput = render(nextDraft, published.body);
    if (draftOutput !== render(draft.frontmatter, draft.body)) {
      await fs.writeFile(draftPath, draftOutput, "utf8");
      synchronizedDrafts += 1;
    }
  }

  console.log(
    `Refreshed metadata for ${updatedPublished}/${draftNames.length} published articles and synchronized ${synchronizedDrafts}/${draftNames.length} draft staging copies.`,
  );
}

await run();
