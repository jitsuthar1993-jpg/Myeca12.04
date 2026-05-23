# User-Page Typography Standard

MyeCA user-facing web pages use one balanced type ladder. The standard keeps public pages readable, tools dense enough to operate, and reading pages comfortable without letting each route invent its own title scale.

## Roles

Use semantic role utilities from `client/src/styles/typography.css`.

| Role | Use |
| --- | --- |
| `type-hero-title` | True first-viewport hero titles and blog article titles. |
| `type-page-title` | Default page title for services, tools, auth, account, and dashboard pages. |
| `type-section-title` | Major sections below a page title. |
| `type-card-title` | Cards, panels, and compact summary blocks. |
| `type-body` | Meaningful body copy. |
| `type-support` | Helper copy, secondary explanations, control-adjacent text. |
| `type-meta` | Badges, labels, timestamps, and uppercase metadata. |
| `type-article-prose` | Blog, help, and legal long-form content. |

The token foundation stays in `client/src/styles/design-tokens.css`. Role classes should consume those tokens instead of hard-coded pixel font sizes.

## Defaults

- Body copy is `16px`.
- Support and control copy is `14px`.
- User-facing meta text is `12px`.
- Reading prose uses the article role so its body and heading ladder can be relaxed without inflating calculators, forms, or dashboards.
- `type-hero-title` is an exception tier. A normal service, calculator, account, or dashboard page should start with `type-page-title`.

## Page Families

Public pages can use one hero title at the first viewport when the route is an offer, brand, or article entry point. Lower sections should step down to section and card roles.

Calculators, ITR flows, parsers, auth pages, and signed-in user workspaces should use page, section, card, body, support, and meta roles. They should not inherit marketing-sized titles for operational panels.

Blog, help, and legal pages should use the reading role for prose. Keep badges and table helpers on meta or support roles.

Admin, analytics, editors, and dense operations tables are not part of this user-page standardization pass. Review them separately before changing their density rules.

## Patterns

Preferred:

```tsx
<h1 className="type-page-title text-slate-950">Income Tax Calculator</h1>
<p className="type-body text-slate-600">Estimate tax and compare regimes.</p>
<span className="type-meta font-semibold uppercase text-blue-700">AY 2026-27</span>
```

Avoid on migrated user-page surfaces:

```tsx
<h1 className="text-4xl md:text-6xl">Service title</h1>
<p className="text-[15px]">One-off body size</p>
<span className="text-[10px]">Tiny helper</span>
```

Run `npm.cmd run check:typography` after changing migrated user-page typography. The audit derives user-route coverage from `client/src/Routes.tsx` and adds shared public/workspace components that render across those routes. Admin, CA, team-operations, and analytics surfaces stay explicitly excluded for a separate density review. If a retained exception is still necessary, add the narrowest path, rule, class fragment, and reason to the audit allowlist.
