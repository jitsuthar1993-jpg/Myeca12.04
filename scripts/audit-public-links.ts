const DEFAULT_ORIGIN = "https://myeca.in";
const PLACEHOLDER_PATTERN = /\b(page under construction|coming soon|page not available yet)\b/i;

export function containsPlaceholderCopy(html: string) {
  const visibleText = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  return PLACEHOLDER_PATTERN.test(visibleText);
}

async function fetchText(url: string) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "user-agent": "MyeCA public link audit" },
    signal: AbortSignal.timeout(20_000),
  });
  return { response, text: await response.text() };
}

export async function auditPublicLinks(origin = DEFAULT_ORIGIN) {
  const sitemap = await fetchText(`${origin}/sitemap.xml`);
  const seeds = [...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1].replaceAll("&amp;", "&"));
  const discovered = new Map<string, string>();

  for (const source of seeds) {
    const { text } = await fetchText(source);
    for (const match of text.matchAll(/href=["']([^"'#]+)["']/gi)) {
      const target = new URL(match[1], source);
      if (target.origin !== origin) continue;
      target.hash = "";
      target.search = "";
      discovered.set(target.href, source);
    }
  }

  const failures = [];
  for (const [url, source] of discovered) {
    try {
      const { response, text } = await fetchText(url);
      if (!response.ok || containsPlaceholderCopy(text)) {
        failures.push({ url, source, status: response.status, finalUrl: response.url, placeholder: containsPlaceholderCopy(text) });
      }
    } catch (error) {
      failures.push({ url, source, status: 0, error: error instanceof Error ? error.message : String(error) });
    }
  }

  return { sitemapPages: seeds.length, discoveredLinks: discovered.size, failures };
}

if (process.argv[1]?.endsWith("audit-public-links.ts")) {
  const origin = process.argv[2] ?? DEFAULT_ORIGIN;
  const report = await auditPublicLinks(origin);
  console.log(JSON.stringify(report, null, 2));
  if (report.failures.length > 0) process.exitCode = 1;
}
