# Public Content Editorial Review Workflow

This workflow separates automated content-quality evidence from human editorial approval. Passing automated checks does not approve a route.

## Review Queue

Run:

```powershell
npm.cmd run build
npm.cmd run report:content-review
npm.cmd run check:content-review-queue
```

The generated queue is `docs/marketing/public-content-editorial-review-queue.csv`. It is a read-only snapshot of the built `PublicContentContext` for every indexable route. Do not type approvals into the CSV because the strict gate reads the CMS or source context, not the report.

Priority meanings:

- `P0`: A held route that must remain noindex until the documented issue is resolved.
- `P1`: Homepage, trust, legal, and comparison routes with high brand or decision risk.
- `P2`: Services, calculators, hubs, help pages, and other public pages.
- `P3`: Blog articles.

## Human Review Checklist

The named human reviewer should verify the rendered desktop and mobile route, then confirm:

1. The opening and visible body answer the route's specific user job without template filler.
2. Material tax, compliance, eligibility, deadline, and process claims are supported by the listed route-relevant sources.
   Every indexable route needs a dated primary source. Regulated topics should cite the relevant authority; product, help, trust, and legal pages should cite the applicable MyeCA policy, scope, methodology, or support route.
3. Examples, limitations, caveats, and next steps are accurate for the stated audience.
4. Author and reviewer attribution are truthful. Do not claim CA review without a named reviewer and verified credential.
5. Internal links use descriptive anchors and lead to genuinely relevant next steps.
6. Metadata and schema match the visible content.
7. The CTA describes the actual MyeCA service scope without guarantees or unsupported superiority claims.

## Recording A Decision

- Blogs: record `qualityStatus`, `editorialApprovedBy`, and `editorialApprovedAt` in the CMS or MDX frontmatter.
- Non-blog routes: pass `qualityStatus` and `editorialApproval` through the route's `PublicContentContext` source when a named human has completed the review.
- Use `hold` only for materially inaccurate, near-duplicate, or unusably thin content. A held route must remain noindex and out of the sitemap and internal promotion.
- Never bulk-mark routes `approved` merely because automated checks pass.

After recording decisions, rebuild and regenerate the queue. Final approval is demonstrated only when:

```powershell
npm.cmd run check:content-quality:strict -- --verbose
```

passes with zero unapproved indexable routes.
