import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";

const publicDirectory = resolve(process.cwd(), "dist/public");
const rawHslSemanticTokens = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "destructive-foreground",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar-background",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
] as const;

if (!existsSync(publicDirectory)) {
  throw new Error(
    `Built public directory is missing: ${publicDirectory}. Run the production build first.`,
  );
}

function collectCssFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      return collectCssFiles(path);
    }

    return path.endsWith(".css") ? [path] : [];
  });
}

const cssFiles = collectCssFiles(publicDirectory)
  .sort();

if (cssFiles.length === 0) {
  throw new Error(`No built CSS assets found in ${publicDirectory}.`);
}

const bareSemanticDeclarations: string[] = [];

for (const filePath of cssFiles) {
  const css = readFileSync(filePath, "utf8");
  const builtPath = relative(process.cwd(), filePath).replace(/\\/g, "/");

  for (const token of rawHslSemanticTokens) {
    const declaration = new RegExp(
      String.raw`(?:color|background-color|border-color|fill|stroke)\s*:\s*var\(--${token}\)`,
      "g",
    );

    if (declaration.test(css)) {
      bareSemanticDeclarations.push(`${builtPath}: var(--${token})`);
    }
  }
}

if (bareSemanticDeclarations.length > 0) {
  throw new Error(
    [
      "Built CSS contains bare raw-HSL semantic color declarations.",
      "These variables must be wrapped with hsl(...) before use as a color:",
      ...bareSemanticDeclarations.map((declaration) => `- ${declaration}`),
    ].join("\n"),
  );
}

console.log(
  `Built semantic color audit passed across ${cssFiles.length} CSS asset(s).`,
);
