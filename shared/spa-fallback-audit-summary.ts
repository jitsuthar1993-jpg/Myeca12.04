export type SpaFallbackAuditCheck = {
  detail: string;
  label: string;
  ok: boolean;
};

export type SpaFallbackAuditSummary = {
  appOnlyNoindexFailures: number;
  appOnlyStatusFailures: number;
  checks: number;
  failures: number;
  hostileIndexHeaderFailures: number;
  hostileNoindexFailures: number;
  hostileStatusFailures: number;
  localPolicyFailures: number;
  passes: number;
  publicControlFailures: number;
  sitemapExclusionFailures: number;
  sitemapReachableFailures: number;
};

export type SpaFallbackAuditScope = {
  hostileRoutes: number;
  probeSlugs: readonly string[];
  publicRoutes: number;
};

export type SpaFallbackAuditFailureCategory =
  | "app_only_noindex"
  | "app_only_status"
  | "hostile_index_header"
  | "hostile_noindex"
  | "hostile_status"
  | "local_policy"
  | "public_control"
  | "sitemap_exclusion"
  | "sitemap_reachable";

export type SpaFallbackAuditFailureSample = {
  category: SpaFallbackAuditFailureCategory;
  check: SpaFallbackAuditCheck;
};

function countFailures(failures: SpaFallbackAuditCheck[], pattern: RegExp) {
  return failures.filter((check) => pattern.test(check.label)).length;
}

function failureCategory(label: string): SpaFallbackAuditFailureCategory | null {
  if (/ app-only control stays noindex$/.test(label)) return "app_only_noindex";
  if (/ app-only control returns 200$/.test(label)) return "app_only_status";
  if (/ is not marked indexable by header$/.test(label)) return "hostile_index_header";
  if (/ has noindex signal$/.test(label)) return "hostile_noindex";
  if (/ returns 404$/.test(label)) return "hostile_status";
  if (/^local fallback policy rejects /.test(label)) return "local_policy";
  if (/ public control /.test(label)) return "public_control";
  if (/^sitemap excludes /.test(label)) return "sitemap_exclusion";
  if (/^sitemap reachable$/.test(label)) return "sitemap_reachable";
  return null;
}

export function summarizeSpaFallbackAuditChecks(checks: readonly SpaFallbackAuditCheck[]): SpaFallbackAuditSummary {
  const failures = checks.filter((check) => !check.ok);

  return {
    appOnlyNoindexFailures: countFailures(failures, / app-only control stays noindex$/),
    appOnlyStatusFailures: countFailures(failures, / app-only control returns 200$/),
    checks: checks.length,
    failures: failures.length,
    hostileIndexHeaderFailures: countFailures(failures, / is not marked indexable by header$/),
    hostileNoindexFailures: countFailures(failures, / has noindex signal$/),
    hostileStatusFailures: countFailures(failures, / returns 404$/),
    localPolicyFailures: countFailures(failures, /^local fallback policy rejects /),
    passes: checks.length - failures.length,
    publicControlFailures: countFailures(failures, / public control /),
    sitemapExclusionFailures: countFailures(failures, /^sitemap excludes /),
    sitemapReachableFailures: countFailures(failures, /^sitemap reachable$/),
  };
}

export function getSpaFallbackAuditFailureSamples(
  checks: readonly SpaFallbackAuditCheck[],
  perCategoryLimit = 2,
): SpaFallbackAuditFailureSample[] {
  const samples: SpaFallbackAuditFailureSample[] = [];
  const counts = new Map<SpaFallbackAuditFailureCategory, number>();

  for (const check of checks) {
    if (check.ok) continue;

    const category = failureCategory(check.label);
    if (!category) continue;

    const count = counts.get(category) ?? 0;
    if (count >= perCategoryLimit) continue;

    samples.push({ category, check });
    counts.set(category, count + 1);
  }

  return samples;
}

export function formatSpaFallbackAuditSummary(baseUrl: string, summary: SpaFallbackAuditSummary) {
  return [
    `SPA fallback audit summary for ${baseUrl}`,
    `checks=${summary.checks}`,
    `passes=${summary.passes}`,
    `failures=${summary.failures}`,
    `hostile_status_failures=${summary.hostileStatusFailures}`,
    `hostile_noindex_failures=${summary.hostileNoindexFailures}`,
    `hostile_index_header_failures=${summary.hostileIndexHeaderFailures}`,
    `app_only_status_failures=${summary.appOnlyStatusFailures}`,
    `app_only_noindex_failures=${summary.appOnlyNoindexFailures}`,
    `public_control_failures=${summary.publicControlFailures}`,
    `local_policy_failures=${summary.localPolicyFailures}`,
    `sitemap_exclusion_failures=${summary.sitemapExclusionFailures}`,
    `sitemap_reachable_failures=${summary.sitemapReachableFailures}`,
  ].join("\n");
}

export function formatSpaFallbackAuditScope(scope: SpaFallbackAuditScope) {
  return [
    `public_routes=${scope.publicRoutes}`,
    `hostile_routes=${scope.hostileRoutes}`,
    `probe_slugs=${scope.probeSlugs.join(",")}`,
  ].join("\n");
}
