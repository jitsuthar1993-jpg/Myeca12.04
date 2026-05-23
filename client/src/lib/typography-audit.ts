export type TypographyRule = "arbitrary-pixel" | "sub-12px" | "oversized-title";

export type TypographyIssue = {
  classFragment: string;
  line: number;
  path: string;
  rule: TypographyRule;
};

export type TypographyAllowlistEntry = {
  classFragment: string;
  path: string;
  reason: string;
  rule: TypographyRule;
};

const arbitraryPixelPattern = /\b(?:[a-z]+:)?text-\[(\d+)px\]/g;
const oversizedTitlePattern = /\b(?:[a-z]+:)?text-(?:5xl|6xl|7xl|8xl|9xl)\b/g;
const inlinePixelPatterns = [
  /\bfontSize\s*=\s*\{\s*(\d+)\s*\}/g,
  /\bfontSize\s*=\s*["'](\d+)["']/g,
  /\bfontSize\s*:\s*["'](\d+)px["']/g,
] as const;

function normalizedPath(path: string) {
  return path.replaceAll("\\", "/");
}

function addIssue(
  issues: TypographyIssue[],
  path: string,
  line: number,
  rule: TypographyRule,
  classFragment: string,
) {
  issues.push({ classFragment, line, path: normalizedPath(path), rule });
}

export function analyzeTypographySource(path: string, source: string): TypographyIssue[] {
  const issues: TypographyIssue[] = [];
  let titleTagOpen = false;

  source.split(/\r?\n/).forEach((lineText, index) => {
    const line = index + 1;

    for (const match of lineText.matchAll(arbitraryPixelPattern)) {
      const classFragment = match[0];
      const pixelSize = Number(match[1]);
      addIssue(issues, path, line, "arbitrary-pixel", classFragment);

      if (pixelSize < 12) {
        addIssue(issues, path, line, "sub-12px", classFragment);
      }
    }

    for (const pattern of inlinePixelPatterns) {
      for (const match of lineText.matchAll(pattern)) {
        const classFragment = match[0];
        const pixelSize = Number(match[1]);
        addIssue(issues, path, line, "arbitrary-pixel", classFragment);

        if (pixelSize < 12) {
          addIssue(issues, path, line, "sub-12px", classFragment);
        }
      }
    }

    const beginsTitleTag = /<(?:[a-z]+\.)?(?:h[1-6]|CardTitle)\b/.test(lineText);
    const titleClassLine = beginsTitleTag || titleTagOpen;

    if (titleClassLine && !lineText.includes("type-hero-title")) {
      for (const match of lineText.matchAll(oversizedTitlePattern)) {
        addIssue(issues, path, line, "oversized-title", match[0]);
      }
    }

    titleTagOpen = titleClassLine && !lineText.includes(">");
  });

  return issues;
}

export function filterTypographyIssues(
  issues: TypographyIssue[],
  allowlist: TypographyAllowlistEntry[],
) {
  return issues.filter((issue) => {
    return !allowlist.some((entry) => {
      return normalizedPath(entry.path) === normalizedPath(issue.path)
        && entry.rule === issue.rule
        && issue.classFragment.includes(entry.classFragment);
    });
  });
}
