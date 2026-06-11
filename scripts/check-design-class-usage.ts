import { readdirSync, readFileSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";

const clientSourceDirectory = resolve(process.cwd(), "client/src");
const sourceExtensions = new Set([".ts", ".tsx", ".css"]);
const forbiddenPatterns = [
  {
    label: "gray Tailwind neutral",
    pattern: /\b(?:text|bg|border|divide|ring|from|via|to|placeholder:text)-gray-/g,
  },
  { label: "dark variant", pattern: /(?<![-\w])dark:/g },
  {
    label: "legacy brand alias",
    pattern: /\b(?:navy|cta-primary|primary-hover)(?:-|\b)/g,
  },
  { label: "legacy primary hex", pattern: /#(?:315efb|2040d8|0646b2)/gi },
] as const;

function collectSourceFiles(directory: string): string[] {
  return readdirSync(directory)
    .flatMap((entry) => {
      const path = resolve(directory, entry);
      return statSync(path).isDirectory() ? collectSourceFiles(path) : [path];
    })
    .filter((path) => {
      const extension = path.slice(path.lastIndexOf("."));
      return sourceExtensions.has(extension);
    });
}

const violations: string[] = [];

for (const filePath of collectSourceFiles(clientSourceDirectory)) {
  const source = readFileSync(filePath, "utf8");

  for (const { label, pattern } of forbiddenPatterns) {
    const match = pattern.exec(source);
    pattern.lastIndex = 0;

    if (!match) {
      continue;
    }

    const line = source.slice(0, match.index).split(/\r?\n/).length;
    violations.push(
      `${relative(process.cwd(), filePath)}:${line} ${label}: ${match[0]}`,
    );
  }
}

if (violations.length > 0) {
  throw new Error(
    ["Design class usage audit failed:", ...violations.map((item) => `- ${item}`)].join(
      "\n",
    ),
  );
}

console.log("Design class usage audit passed.");
