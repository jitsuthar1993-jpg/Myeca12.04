## Objectives

* Establish a cohesive, accessible design system tailored to genealogical visualization.

* Implement modern CSS (variables, grid/flex) with Tailwind integration.

* Provide dark/light modes, interactive states, and print styles for reports.

* Document tokens, patterns, and reusable component styles in a living style guide.

## Tech Fit & Constraints

* Use existing Tailwind setup (`darkMode: "class"`, CSS variables mapped in `tailwind.config.ts`).

* Replace current light-only `ThemeProvider` with full mode support and persist user preference.

* Keep fonts performant (system fonts + one readable serif for genealogical headings).

## Design Tokens

* Colors (HSL vars):

  * Core: `--background`, `--foreground`, `--border`, `--muted`.

  * Brand: `--primary`, `--secondary`, `--accent`, `--ring`.

  * Genealogical: `--gen-1`..`--gen-6` (generation bands), `--relationship-marriage`, `--relationship-parent`, `--relationship-adoptive`, `--relationship-step`, `--relationship-sibling`.

  * Status: `--info`, `--success`, `--warning`, `--error`.

  * Dark mode counterparts via `.dark :root` overrides. 

* Typography:

  * Font families: `--font-sans` (Inter, system), `--font-serif` (Merriweather, Georgia), `--font-mono`.

  * Type scale: `{xs, sm, base, lg, xl, 2xl, 3xl}` with line-height tuned for trees.

* Spacing & Radius:

  * Spacing vars: `--space-1`..`--space-8` (4px, 8px... 32px).

  * Radii: `--radius-sm`, `--radius`, `--radius-lg` mapped to Tailwind.

* Z-index:

  * `--z-tree-lines`, `--z-profile`, `--z-tooltip` for layer control.

## Color Scheme (Accessible)

* Light: neutral background, readable dark foreground, cool brand (blue/teal) accents.

* Dark: near-black background, elevated neutrals, brand accents softened for contrast.

* Generation palette: sequential scale for generations (cool-to-warm), each passing WCAG 2.1 AA for text and line overlays.

* Relationship lines: distinct hues and dashed/solid variations to avoid color-only encoding.

## Typography

* Headings (serif) for names and generations; body (sans) for details.

* Responsive type ramp via clamp:

  * Name: `clamp(1rem, 2.5vw, 1.5rem)`

  * Generation labels: `clamp(0.875rem, 2vw, 1.25rem)`

  * Body: `clamp(0.875rem, 1.5vw, 1rem)`

* High legibility: 1.5–1.7 line-height, adequate letter-spacing for small text.

## Spacing & Layout Patterns

* Consistent spacing scale applied to paddings/margins and gaps.

* Layout primitives:

  * Grid: tree columns (`auto-fit, minmax(220px, 1fr)`), responsive wrap.

  * Flex: relationship lists, badges, legends.

  * Container: max-widths (`sm, md, lg, xl`) with readable gutters.

* Alignment rules: left-align text, avoid center for long details; center only in profile headings.

## Visual Hierarchy

* Generations: strong color bands or subtle background tints; elevation (shadow) increases for closer generations.

* Profiles: card tiers (ancestor, parent, child) with size/weight differences.

* Relationships: line thickness and style (solid/dashed/dotted) plus markers (icons) for type.

## Interactive States

* Hover: subtle elevation/underline, color shifts within contrast-safe bounds.

* Active: pressed shadows or inset borders.

* Focus: `:focus-visible` high-contrast 2–3px outline, offset 2px.

* Selected: persistent highlight for current profile and path.

* Keyboard/a11y: visible focus cycle, skip links support.

## Dark/Light Mode

* Implement `.dark` class toggling with localStorage persistence.

* Provide dark token overrides and test contrast (≥4.5:1 for text, ≥3:1 for large text/UI).

* Respect `prefers-color-scheme` for initial selection.

## Print-Friendly Styles

* `@media print` stylesheet:

  * High-contrast monochrome, remove backgrounds/shadows.

  * Page breaks for generations and sections.

  * Convert interactive elements to static; hide nav, chat, toasts.

  * Embed link URLs in text.

  * Tree layout optimized to multi-column or paginated vertical.

## Tailwind Integration

* Map new CSS vars to Tailwind theme (`colors.chart` already present; extend for generations/relationships).

* Utility classes:

  * `.gen-band-{n}`, `.relationship-line-{type}`, `.profile-card-{tier}`.

  * Gradient helpers for legends.

* Use `@layer` base/components/utilities\` to register tokens and patterns.

## Implementation Steps

1. Tokens & Base Styles

   * Add genealogical tokens to `:root` and `.dark :root` in `client/src/index.css` (or a dedicated `family-theme.css` imported there).

   * Register typography, spacing, and focus styles.
2. Tailwind Config

   * Extend `tailwind.config.ts` colors with generation and relationship namespaces using `var(--...)`.

   * Confirm content paths cover new components.
3. Theme Provider

   * Update `client/src/components/ThemeProvider.tsx` to support toggling, `prefers-color-scheme`, and persistence.

   * Ensure `ThemeToggle` reflects modes and is accessible.
4. Utilities & Classes

   * Add utility classes for hierarchy (`@layer utilities`): `.gen-band-*`, `.profile-card-*`, `.relationship-line-*`.
5. Print Styles

   * Create `client/src/styles/print.css` and import from `index.css`.
6. Component Styling

   * Profile card: size tiers, readable typography, badges.

   * Relationship visuals: line styles, markers, legend.

   * Generation headers: sticky bands in long trees.
7. Accessibility

   * Focus indicators, skip links, sufficient target size, reduced motion handling.

   * Non-color encodings (icons, patterns) for relationships.
8. Documentation

   * Add style guide (Markdown) describing tokens, components, usage patterns, dos/don’ts, and examples.

## Reusable Component Patterns

* ProfileCard (tiers: ancestor/parent/child) with slots: name, lifespan, photo, notes.

* RelationshipLine (types: marriage/parent/adoptive/step/sibling) with icon markers.

* GenerationBand (label, color index, sticky option).

* Legend (color/line mapping and accessibility notes).

## Accessibility & WCAG

* Contrast targets: AA for small text, AAA for critical labels (names).

* Focus order and skip links; `:focus-visible` only.

* Motion: respect `prefers-reduced-motion`; avoid parallax.

* Non-color cues for relationship types.

* Test with keyboard and screen readers.

## QA & Verification

* Visual tests: snapshot baseline in light/dark.

* Contrast checks via utility function and manual sampling.

* Responsive checks across breakpoints.

* Print preview checks (Chrome/Edge) for pagination, margins.

## Style Guide Contents

* Palette page: swatches and contrast table.

* Typography page: ramp and usage.

* Spacing/layout page: examples with grid/flex.

* Components page: ProfileCard, RelationshipLine, GenerationBand, Legend.

* Interaction page: hover/active/focus/selected.

* Modes page: dark/light tokens and examples.

* Print page: report appearance and tips.

## Rollout

* Introduce tokens and base utilities first; wire `ThemeProvider`.

* Style key components next; validate hierarchy in sample trees.

* Finalize print styles; complete documentation.

* Iterate from user feedback and analytics on readability and usage.

