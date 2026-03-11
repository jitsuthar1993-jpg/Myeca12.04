# Light Theme Design System (MyeCA.in)

## Color Palette
- Background: #FFFFFF
- Surface (cards, popovers): #FFFFFF
- Border: #E0E0E0 (1px)
- Body Text: #333333
- Headings: #000000
- Muted Background: #FAFAF9
- Muted Text: #78716C
- Primary Accent: #3B82F6 (Blue)
- Secondary Accent: #334155 (Slate)
- Success: #059669 (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)

All text and UI elements meet WCAG AA contrast (≥4.5:1 for body text, ≥3:1 for large text).

## Typography
- Display: Plus Jakarta Sans, 700, letter-spacing -0.02em
- Body: Plus Jakarta Sans, 400–500
- Line-height: 1.6 for paragraphs, 1.4 for headings
- Type scale: xs, sm, base, lg, xl, 2xl, 3xl

## Spacing
- Minimum spacing: 16px between elements
- Utility: `.flow-16 > * + * { margin-top: 16px }`
- Container gutters: 16–24px

## Depth
- Borders: 1px #E0E0E0 on surfaces
- Shadows: subtle `0 2px 8px rgba(0,0,0,0.06)` via `.soft-shadow`

## Components
- Cards: white background, soft-border, soft-shadow, 16px padding
- Buttons: primary (blue), outline (neutral), accessible focus with blue ring
- Inputs: white background, #111827 text, focus ring #6366F1

## Homepage Rules
- Minimalist layout
- Maximum 3 complementary colors: Blue, Slate, Neutral Grays
- All text verified for WCAG AA contrast

## Implementation Notes
- CSS variables defined in `client/src/index.css`
- Tailwind colors read from CSS vars in `tailwind.config.ts`
- Print styles in `client/src/styles/print.css`

## Maintenance
- Add new colors via CSS vars; ensure contrast before usage
- Prefer semantic tokens over hard-coded colors in components
