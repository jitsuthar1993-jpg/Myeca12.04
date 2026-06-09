function cleanMarkdownText(value: string) {
  return value
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_`~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateSentence(value: string, maxLength: number) {
  const normalized = cleanMarkdownText(value);
  if (normalized.length <= maxLength) return normalized;

  const clipped = normalized.slice(0, maxLength + 1).replace(/\s+\S*$/, "").trim();
  const sentenceEnd = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf("?"), clipped.lastIndexOf("!"));
  if (sentenceEnd >= Math.floor(maxLength * 0.62)) return clipped.slice(0, sentenceEnd + 1);

  const clauseEnd = Math.max(clipped.lastIndexOf(","), clipped.lastIndexOf(";"), clipped.lastIndexOf(":"));
  const ending = clauseEnd >= Math.floor(maxLength * 0.7) ? clipped.slice(0, clauseEnd) : clipped;
  return `${ending.replace(/[,:;\s]+$/, "").trim()}.`;
}

function contentBlocks(body: string) {
  return body.replace(/\r\n/g, "\n").split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
}

export function descriptionFromArticleBody(body: string, maxLength = 190) {
  const opening = contentBlocks(body).find((block) =>
    !/^(?:#{1,6}\s|[-*+]\s|\d+[.)]\s|>|```|\|)/.test(block) &&
    cleanMarkdownText(block).length >= 70);
  if (!opening) throw new Error("Article body does not contain a usable opening paragraph.");

  const sentences = cleanMarkdownText(opening).split(/(?<=[.!?])\s+/).filter(Boolean);
  let description = "";
  for (const sentence of sentences) {
    const candidate = description ? `${description} ${sentence}` : sentence;
    if (candidate.length > maxLength) break;
    description = candidate;
  }
  return truncateSentence(description || sentences[0] || opening, maxLength);
}

function actionStepFromHeading(heading: string) {
  const cleaned = cleanMarkdownText(heading).replace(/[.!?]+$/, "");
  const [, suffix] = cleaned.match(/^[^:]{2,100}:\s*(.+)$/) ?? [];
  const candidate = suffix && /^(?:build|check|choose|compare|confirm|connect|create|decide|define|explain|handle|identify|keep|map|match|prepare|preserve|reconcile|resolve|review|separate|settle|trace|use|verify)\b/i.test(suffix)
    ? suffix
    : cleaned;
  const action = /^(?:build|check|choose|compare|confirm|connect|create|decide|define|explain|handle|identify|keep|map|match|prepare|preserve|reconcile|resolve|review|separate|settle|trace|use|verify)\b/i.test(candidate)
    ? candidate
    : `Review ${candidate.charAt(0).toLowerCase()}${candidate.slice(1)}`;
  return `${action.charAt(0).toUpperCase()}${action.slice(1)}.`;
}

export function stepsFromArticleBody(body: string, limit = 4) {
  const ignored = /\b(?:official sources?|official references?|related guides?|related routes?|related tools?|support)\b/i;
  const headings = [...body.matchAll(/^##\s+(.+?)\s*$/gm)]
    .map((match) => match[1])
    .filter((heading) => !ignored.test(heading))
    .map(actionStepFromHeading);
  return [...new Set(headings)].slice(0, limit);
}

export function highlightsFromArticleBody(body: string, limit = 3) {
  return stepsFromArticleBody(body, limit).map((step) => step.replace(/^Review\s+/i, ""));
}
