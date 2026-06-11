# MyeCA Design System

This document is the canonical visual contract for MyeCA. The product uses one light theme with a single semantic color pipeline.

## Source Of Truth

- `client/src/index.css` owns all runtime semantic color values as raw HSL channels.
- `tailwind.config.ts` maps semantic colors with the alpha-capable form `hsl(var(--token) / <alpha-value>)`.
- `client/src/styles/design-tokens.css` owns non-color foundation scales and named utilities that still have consumers.
- Shared UI primitives should express this contract before page-level components add local styling.

Do not define a second semantic palette in another stylesheet or bypass semantic colors with hardcoded brand values.

## Light-Only Policy

Dark mode is not enabled.

- Do not add new `dark:` Tailwind variants.
- Do not add `.dark` token blocks or dark-theme overrides.
- Do not add theme toggles unless the design system is intentionally revised as a separate project.
- Use the light semantic tokens for every shared surface and state.

## Brand Scale

Use `brand-*` for explicit brand-blue styling. `brand.DEFAULT` and the primary action color are `brand-600`.

| Token | Value |
| --- | --- |
| `brand-50` | `#f0f3ff` |
| `brand-100` | `#e0e7ff` |
| `brand-200` | `#bdcbff` |
| `brand-300` | `#8fa7ff` |
| `brand-400` | `#5c7fff` |
| `brand-500` | `#3d67ff` |
| `brand-600` | `#315efb` |
| `brand-700` | `#1f48db` |
| `brand-800` | `#203da7` |
| `brand-900` | `#1d327c` |
| `brand-950` | `#142252` |

Legacy aliases such as `navy`, `cta-primary`, and `primary-hover` are compatibility-only during migration. Do not use them in new work.

## Semantic Color Pipeline

Semantic tokens are raw HSL channels in `client/src/index.css`. Tailwind consumers must wrap them with `hsl(...)`; a bare value such as `var(--primary)` is not a valid color.

```ts
background: "hsl(var(--background) / <alpha-value>)",
primary: {
  DEFAULT: "hsl(var(--primary) / <alpha-value>)",
  foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
},
```

### Canonical Semantic Matrix

| Semantic token | Raw HSL value | Role |
| --- | --- | --- |
| `--background` | `0 0% 100%` | Main canvas |
| `--foreground` | `222.2 47.4% 11.2%` | Slate-900 body text |
| `--card`, `--popover` | `0 0% 100%` | Elevated surfaces |
| `--card-foreground`, `--popover-foreground` | `222.2 47.4% 11.2%` | Surface text |
| `--primary`, `--ring` | `226.63 96.19% 58.82%` | Exact `#315efb` primary and focus color |
| `--primary-foreground` | `0 0% 100%` | Text on primary |
| `--secondary`, `--muted` | `210 40% 96.1%` | Slate-100 surface |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | Slate-900 text |
| `--muted-foreground` | `215.4 16.3% 46.9%` | Slate-500 text |
| `--accent` | `224 100% 97%` | Light brand hover or selection surface |
| `--accent-foreground` | `226.63 96.19% 40%` | Dark brand accent text |
| `--border`, `--input` | `214.3 31.8% 91.4%` | Slate-200 border |
| `--destructive` | `0 72.2% 50.6%` | Destructive and error action |
| `--destructive-foreground` | `0 0% 100%` | Text on destructive |

Green is reserved for success and trust, amber for warnings and deadlines, and red for destructive or error states. Teal is not a general-purpose second accent.

## Slate Neutrals

Use Tailwind's `slate-*` ramp for explicit neutral styling. Do not introduce `gray-*` as a competing neutral ramp.

- `slate-50` and `slate-100`: subtle page and control surfaces
- `slate-200`: borders and dividers
- `slate-400` and `slate-500`: placeholders and secondary text
- `slate-600` and `slate-700`: supporting text and controls
- `slate-800` and `slate-900`: strong text and high-emphasis surfaces

Prefer semantic utilities such as `bg-background`, `text-foreground`, `text-muted-foreground`, and `border-border` when the role is semantic rather than decorative.

## Radius Roles

Use radius by component role, not by page preference.

| Role | Class |
| --- | --- |
| Inputs and buttons | `rounded-lg` |
| Cards and popovers | `rounded-xl` |
| Dialogs and hero panels | `rounded-2xl` |
| Pills and circular controls | `rounded-full` |

## Motion

Motion is opt-in and must communicate interaction or state.

- Static primitives do not lift or translate on hover.
- Do not apply global `transition: all`.
- Add hover translation only to genuinely interactive cards or an explicitly marketing-oriented button variant.
- Keep reduced-motion handling centralized in one `prefers-reduced-motion: reduce` foundation block.
- Motion must not be required to understand or complete an action.

## Focus

The application uses one global keyboard-focus indicator:

```css
:focus-visible {
  outline: 2px solid hsl(var(--ring));
  outline-offset: 2px;
}
```

Do not add competing global `:focus` rules, component focus rings, or `!important` form-focus overrides that create double indicators. Never remove the visible outline without providing the same single accessible indicator.

## Usage Contract

Before adding or changing visual styles:

- Use semantic color utilities for semantic roles.
- Use `brand-*` only for explicit brand-blue treatment.
- Use `slate-*` for explicit neutrals.
- Follow the radius role table.
- Keep motion opt-in and reduced-motion safe.
- Rely on the single global `:focus-visible` outline.
- Add no `dark:` variants or dark-theme token blocks.
