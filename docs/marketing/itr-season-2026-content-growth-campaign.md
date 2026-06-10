# AY 2026-27 ITR Season Content-Growth Campaign

## Campaign Spine

Primary goal: turn AY 2026-27 ITR season search and community demand into qualified filing starts, parser/tool usage, and scoped expert-review requests.

Primary audience: Indian taxpayers preparing FY 2025-26 income returns in AY 2026-27, especially salaried users, job switchers, capital-gains filers, refund seekers, AIS/Form 26AS mismatch cases, and notice-risk users.

Primary conversion routes:

- `/which-itr-form-to-file?source=paid_search`
- `/itr/form-selector` as the educational SEO guide
- `/form16-parser`
- `/calculators/income-tax`
- `/calculators/regime-comparator`
- `/capital-gains-import`
- `/expert-consultation`

Public campaign hub:

- `/itr-season-2026`
- `/itr-season-2026/ais-form-26as-mismatch-checklist`
- `/itr-season-2026/form-16-parser-guide`
- `/itr-season-2026/capital-gains-broker-statement-checklist`
- `/itr-season-2026/itr-deadline-refund-status-tracker`

## Hybrid Content and Paid Conversion Plan

Primary conversion event: `payment_success`.

Use `docs/marketing/itr-season-2026-paid-content-funnel.md` as the controlling strategy for the 90-day hybrid organic and paid funnel. It defines the paid ITR filing start goal, expert-consultation secondary route, content pillars, current official-source checks, and the split between repo-side readiness and owner-side performance proof.

Execution files:

- `docs/marketing/itr-season-2026-paid-media-plan.csv`: INR 200,000 monthly ceiling using a 75% Google Search, 20% retargeting, and 5% experiments allocation after the pilot gates pass.
- `docs/marketing/itr-season-2026-lead-nurture-sequence.csv`: day 0, 2, 4, 6, and 10 email/WhatsApp follow-up from checklist or tool engagement to paid filing.
- `docs/marketing/itr-season-2026-weekly-kpi-template.csv`: weekly reporting sheet for attract, engage, and convert metrics.
- `docs/marketing/itr-season-2026-daily-growth-ops-template.csv`: daily spend, conversion, capacity, backlog, SLA, cancellation, and completion controls.
- `docs/marketing/itr-season-2026-partner-capacity-roster.csv`: seasonal approved case types, daily capacity, agreement, SLA, and QA roster.
- `docs/marketing/itr-season-2026-paid-scale-gates.md`: INR 25,000 pilot, reconciliation, allowable CPA, capacity, and stop rules.

Paid amplification rules:

- Send conversion-focused high-intent search traffic to `/which-itr-form-to-file?source=paid_search`; retain `/itr/form-selector` as the educational SEO guide.
- Retarget blog, checklist, calculator, and parser visitors who have not started paid filing.
- Exclude completed paid filing users and consultation leads from reminder campaigns.
- Use negative keywords for free-only, government login-only, refund-promise, jobs, PDF-only, unrelated GST-only, and non-India searches.
- Keep ad copy educational and scope-led; do not imply refund certainty, notice avoidance, government affiliation, or processing speed.

## Backlink Policy

Allowed:

- Editorial mentions earned by useful checklists, expert quotes, calculators, and data-backed explainers.
- Community answers that solve the user question and link only when the MyeCA resource is directly useful.
- Partner/newsletter/resource-page links from relevant finance, HR, payroll, startup, student, and tax communities.
- Sponsored/paid placements only when the link is qualified with `rel="sponsored"` or `nofollow`.

Rejected:

- Paid dofollow links.
- Link farms, PBNs, spam directories, automated bookmark submissions, and unrelated guest posts.
- Exact-match anchor manipulation.
- Reciprocal link swaps done only for ranking benefit.
- Any claim that MyeCA guarantees refunds, outcomes, or government processing timelines.

## UTM Convention

Use this format for every promoted campaign link:

```text
https://myeca.in/<path>?utm_campaign=itr-season-2026&utm_medium=<medium>&utm_content=<asset-slug>
```

Allowed `utm_medium` values:

- `pr`
- `community`
- `partner`
- `newsletter`
- `outreach`

Examples:

```text
https://myeca.in/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026&utm_medium=outreach&utm_content=ais-form-26as-mismatch-checklist
https://myeca.in/form16-parser?utm_campaign=itr-season-2026&utm_medium=community&utm_content=form-16-parser-guide
https://myeca.in/capital-gains-import?utm_campaign=itr-season-2026&utm_medium=partner&utm_content=capital-gains-broker-statement-checklist
```

## 900-Prospect Build Plan

Build the list in a spreadsheet with these columns:

```text
segment,prospect_name,site_or_org,url,contact_name,contact_email,social_url,asset_to_pitch,utm_url,status,last_contacted,next_follow_up,notes
```

Use `docs/marketing/itr-season-2026-outreach-tracker.csv` as the starter tracker for the first backlink batch. Use `docs/marketing/itr-season-2026-outreach-kit.md` for the ready-to-send pitch copy. Replace `TBD` values as prospects are qualified and keep the row for every pitch, reply, earned mention, or rejected placement.

Segment quotas:

- Finance bloggers and personal finance sites: 150
- Tax journalists, business reporters, and finance editors: 75
- HR, payroll, employee-benefit, and salary communities: 125
- Colleges, student finance clubs, and placement cells: 100
- Startup, freelancer, and creator communities: 125
- CA, CS, finance student, and accounting communities: 100
- Newsletter writers and LinkedIn finance creators: 100
- Resource pages, calculators lists, and tax guide roundups: 100
- Partner/referral prospects already known to MyeCA: 25

Mandatory backlink channel coverage:

- CA blogs and independent CA practice resource pages: pitch expert quotes, checklist references, and client education links.
- StartupIndia-adjacent listings and founder resource pages: pitch startup planning, company-registration, and compliance calendar resources.
- Medium articles controlled by the owner or guest contributors: publish educational summaries that cite the canonical MyeCA guide, using conservative claims and canonical/UTM discipline.
- LinkedIn posts, newsletters, and creator collaborations: share short excerpts, charts, and filing-season checklists with tracked links.
- Finance forums and taxpayer communities: answer specific questions first; add a MyeCA link only when it directly solves the thread.

Record each placement with:

```text
date,channel,source_url,target_url,anchor_text,rel_attribute,utm_url,status,owner,notes
```

Quality bar:

- Prefer branded or natural anchors such as `MyeCA ITR checklist`, `income tax calculator`, or the exact article title.
- Mark paid/sponsored placements as `rel=sponsored` or `nofollow`.
- Reject any placement that requires refund guarantees, fake reviews, exact-match anchor stuffing, or unrelated content.
- Track earned referring domains separately from raw link count.

Weekly outreach target while paid acquisition is primary:

- Send 5-10 high-quality personalized pitches each week.
- Prioritize HR/payroll partners, finance editors, CA communities, and resources with a direct audience fit.
- Follow-up timing: day 4 and day 10 after the first pitch.

## Pitch Angles

AIS/Form 26AS mismatch checklist:

- "A practical pre-filing checklist for readers whose TDS, AIS, or refund numbers do not match."
- Best segments: finance bloggers, HR/payroll teams, tax journalists, community moderators.

Form 16 parser workflow:

- "A free Form 16 preparation workflow employees can use before starting ITR filing."
- Best segments: HR teams, salary communities, employee-benefit newsletters, LinkedIn finance creators.

Capital gains broker statement checklist:

- "A broker-statement preparation checklist for ITR-2/ITR-3 and capital-gains filers."
- Best segments: investor communities, finance bloggers, broker education pages, creator newsletters.

Deadline and refund status tracker:

- "A seasonal ITR filing and refund-status workflow that keeps users from guessing the next step."
- Best segments: journalists, newsletters, HR/payroll teams, student finance clubs.

## 90-Day Publishing Cadence

Launch weeks 1-2:

- Publish daily: 3 short ITR Q&A posts, 2 expert guides, 1 tool workflow, and 1 high-value refresh per week.
- Priority topics: ITR filing start, Form 16 release, AIS/Form 26AS mismatch, old vs new regime, salary plus capital gains, refunds, notices, freelancers, and foreign-asset edge cases.
- Each new piece must link to one tool, one conversion/service route, one related blog post, and one Learn guide.

Weeks 3-6:

- Continue 5 new or refreshed pieces per week, with one asset built for outreach every week.
- Refresh top impression pages from Search Console before creating lower-intent topics.
- Add comparison links only where user intent is genuinely evaluative.

Weeks 7-13:

- Shift to refreshes, quote-led PR, and conversion cleanup based on Search Console and UTM performance.
- Publish follow-up explainers for queries gaining impressions but low CTR.
- Consolidate thin or overlapping articles into stronger guides before promoting them.

## Technical SEO Launch Checklist

Before outreach starts:

- Run `npm run check:seo-outreach-readiness` and fix any active tracker row that still has placeholder source fields, missing UTM parameters, or missing required channel coverage.
- Generate and submit the sitemap.
- Inspect `/itr-season-2026`, all four campaign asset pages, and competitor-capture URLs in Search Console.
- Confirm priority URLs return `200`, have self-referencing canonicals, and are not `noindex`.
- Confirm stale private URLs such as authenticated filing workspaces do not appear in the public sitemap.
- Confirm `/compare/cleartax-alternative` and other compare URLs have unique titles and canonicals instead of homepage metadata.

## Content QA Workflow

Every ITR-season page needs:

- FY 2025-26 / AY 2026-27 context in the title, body, or review note.
- A CA/editor review note or explicit operational review owner before promotion.
- Official references checked against the Income Tax e-Filing portal, AIS FAQ, ITR status FAQ, e-Verify FAQ, and relevant AY 2026-27 form guidance.
- Clear educational disclaimer and no promises of guaranteed refund, fastest processing, or assured notice avoidance.
- A final read for conservative claims, especially on competitor and expert-review pages.

## Conversion Routing Matrix

- Awareness question: send users to `/itr-season-2026` or a specific checklist first.
- Document preparation: send users to `/form16-parser`, `/capital-gains-import`, or `/tds-refund-tracker`.
- Filing-ready user: send users to `/which-itr-form-to-file`.
- Regime or estimate intent: send users to `/calculators/income-tax` or `/calculators/regime-comparator`.
- Complex case: send users to `/expert-consultation`.
- Competitor/evaluation intent: send users to the relevant `/compare/...` page, then to pricing, filing path, or expert consultation.

## Outreach Templates

Expert quote pitch:

```text
Subject: Practical AY 2026-27 ITR checklist for your readers

Hi <name>,

I noticed your recent coverage of <topic>. MyeCA has published a concise AY 2026-27 checklist on <asset topic> that may help readers verify documents before filing.

Useful angle: <one specific reader problem>.
Resource: <tracked URL>

If useful, I can also share a short CA-reviewed quote on the most common mistake we are seeing in this area.
```

HR/payroll pitch:

```text
Subject: Employee pre-filing checklist for Form 16 season

Hi <name>,

As Form 16 season starts, this checklist can help employees organize Form 16, AIS/Form 26AS, deductions, bank validation, and refund-status steps before they file.

Resource: <tracked URL>

It is educational, free to share, and avoids refund or outcome promises.
```

## Weekly Reporting Template

Report every Monday with this structure:

```text
Week:
Campaign window:

Technical SEO:
- Indexed campaign URLs:
- URLs submitted/inspected in Search Console:
- Sitemap or canonical issues found:

Content:
- New assets published:
- Existing pages refreshed:
- Top queries gaining impressions:

Outreach:
- Pitches sent:
- Replies:
- Earned mentions:
- Qualified referring domains:
- Rejected/unsafe placements:

Conversions:
- ITR form-selector starts:
- Form 16 parser sessions:
- Capital gains import sessions:
- Expert consultation requests:
- Best converting asset:

Next week:
- Publishing:
- Outreach:
- Technical cleanup:
```

## QA Checklist

Before promotion:

- Confirm each promoted URL returns `200`.
- Confirm canonical points to the promoted URL, not the homepage.
- Confirm the page is not `noindex`.
- Confirm it appears in `client/public/sitemap.xml` after build/generation.
- Confirm every page links to a tool, a conversion route, a related blog, and a Learn guide.
- Confirm claims are conservative and educational, with expert review recommended for case-specific decisions.
