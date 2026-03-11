# Theming Guide (Light Mode)

Unified guide to standardize light mode across the platform.

## Objectives
- Enforce a single, consistent light theme.
- Improve readability, accessibility, and professional look.

## Palette
- Background: `#FFFFFF`, light gray `#F9FAFB`
- Text: primary `#111827`, secondary `#6B7280`
- Primary: blue `#3B82F6`; Success `#10B981`; Warning `#F59E0B`; Error `#EF4444`

## CSS Variables (root)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --primary: 217 91% 60%;
  --primary-foreground: 0 0% 100%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 217 91% 60%;
}
```

## Component Updates
- Replace `bg-gray-900` → `bg-white`, `bg-gray-800` → `bg-gray-50`.
- Replace `text-white` → `text-gray-900`, `text-gray-300` → `text-gray-600`.
- Replace `border-gray-700` → `border-gray-200`.

## Areas to Update
- Navigation: white backgrounds, subtle shadows; remove dark-mode toggles.
- Cards: white backgrounds, light borders, `shadow-sm/md`.
- Forms: white inputs, gray borders, blue focus.
- Tables: light header `#F3F4F6`, alternating row shades.

## Pages
- Admin: `/admin/*` (dashboard, settings, users, feedback, services, blog, analytics).
- User: dashboards, calculators, services, auth pages.
- Components: sidebar, dropdowns, modals, cards, forms, tables.

## Accessibility
- WCAG AA contrast, visible focus indicators, keyboard navigation.

## Global Overrides
```css
* { color-scheme: light !important; }
body { background-color: #fff !important; color: #111827 !important; }
```

## Testing
- Visual regression, cross-browser, mobile responsiveness.
- Remove `dark:` classes; verify consistent theme.