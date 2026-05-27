import {
  DEFAULT_ALIAS_SEO_HOST,
  DEFAULT_CANONICAL_SEO_HOST,
  SEO_DEPLOYMENT_PARITY_ROUTES,
  compareSeoDeploymentSignatures,
  createSeoDeploymentSignature,
} from "../shared/seo-deployment-parity.js";

type Check = {
  detail: string;
  label: string;
  ok: boolean;
};

const canonicalHost = normalizeHost(process.argv[2] || process.env.MYECA_CANONICAL_SEO_HOST || DEFAULT_CANONICAL_SEO_HOST);
const aliasHost = normalizeHost(process.argv[3] || process.env.MYECA_ALIAS_SEO_HOST || DEFAULT_ALIAS_SEO_HOST);

function normalizeHost(value: string) {
  return value.replace(/\/+$/, "");
}

function routeUrl(host: string, route: string) {
  return route === "/" ? host : `${host}${route}`;
}

async function fetchHtml(host: string, route: string) {
  const url = routeUrl(host, route);
  const response = await fetch(url, {
    headers: {
      "user-agent": "MyeCA SEO deployment parity check",
    },
  });

  return {
    response,
    text: await response.text(),
    url,
  };
}

function printCheck(check: Check) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.label}: ${check.detail}`);
}

async function validateRoute(route: (typeof SEO_DEPLOYMENT_PARITY_ROUTES)[number]) {
  const checks: Check[] = [];
  const [canonical, alias] = await Promise.all([
    fetchHtml(canonicalHost, route),
    fetchHtml(aliasHost, route),
  ]);

  checks.push({
    label: `${route} canonical host reachable`,
    ok: canonical.response.ok,
    detail: `${canonical.response.status} ${canonical.response.statusText} ${canonical.url}`,
  });
  checks.push({
    label: `${route} alias host reachable`,
    ok: alias.response.ok,
    detail: `${alias.response.status} ${alias.response.statusText} ${alias.url}`,
  });

  if (!canonical.response.ok || !alias.response.ok) return checks;

  const canonicalSignature = createSeoDeploymentSignature(route, canonical.text);
  const aliasSignature = createSeoDeploymentSignature(route, alias.text);
  const issues = compareSeoDeploymentSignatures(canonicalSignature, aliasSignature);

  checks.push({
    label: `${route} SEO shell parity`,
    ok: issues.length === 0,
    detail: issues.length === 0
      ? `words ${canonicalSignature.wordCount}, links ${canonicalSignature.internalLinkCount}, fingerprint ${canonicalSignature.contentFingerprint}`
      : issues.join("; "),
  });

  return checks;
}

async function main() {
  console.log(`SEO deployment parity: canonical=${canonicalHost} alias=${aliasHost}`);

  const checks = (await Promise.all(SEO_DEPLOYMENT_PARITY_ROUTES.map((route) => validateRoute(route)))).flat();
  checks.forEach(printCheck);

  if (checks.some((check) => !check.ok)) {
    console.error("\nSEO deployment parity check failed.");
    process.exit(1);
  }

  console.log("\nSEO deployment parity check passed.");
}

main().catch((error) => {
  console.error("\nSEO deployment parity check failed.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
