# MyeCA.in Design System v3.0

A comprehensive design system for consistent UI/UX across the MyeCA.in platform.

> **Source of Truth**: All CSS custom properties are defined in `client/src/styles/design-tokens.css`. This document provides usage guidelines - refer to the CSS file for exact token values.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing](#spacing)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Component Guidelines](#component-guidelines)
7. [Responsive Breakpoints](#responsive-breakpoints)
8. [Accessibility Standards](#accessibility-standards)
9. [Naming Conventions](#naming-conventions)
10. [Error Handling Patterns](#error-handling-patterns)

---

## Color Palette

> See `client/src/styles/design-tokens.css` for complete color scale (50-900 for each palette).

### Primary Colors (Slate - Professional)

| Token Range | Usage |
|-------------|-------|
| `--color-primary-50` to `--color-primary-200` | Light backgrounds, hover states, borders |
| `--color-primary-300` to `--color-primary-400` | Disabled states, placeholder text |
| `--color-primary-500` to `--color-primary-600` | Secondary text, body text |
| `--color-primary-700` | **Primary brand color** |
| `--color-primary-800` to `--color-primary-900` | Dark backgrounds |

### Accent Colors (Blue)

| Token Range | Usage |
|-------------|-------|
| `--color-accent-50` to `--color-accent-200` | Light accent backgrounds |
| `--color-accent-500` | CTAs, links, highlights |
| `--color-accent-600` to `--color-accent-700` | Hover/active states |

### Neutral Gray Scale

Full gray scale available from `--color-gray-50` to `--color-gray-900`.

### Semantic Colors

| Type | Token | Usage |
|------|-------|-------|
| Success | `--color-success-*` | Confirmations, success messages |
| Warning | `--color-warning-*` | Warnings, cautions |
| Error | `--color-error-*` | Errors, destructive actions |
| Info | `--color-info-*` | Informational messages |

### Usage Rules

```tsx
// DO: Use semantic color tokens via Tailwind classes
<Badge variant="success">Verified</Badge>
<Button variant="destructive">Delete</Button>

// DON'T: Use hardcoded colors
<div className="bg-red-500">Error</div>
```

---

## Typography

### Font Family

- **Primary**: Plus Jakarta Sans
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Monospace**: JetBrains Mono, Fira Code, Consolas

### Type Scale

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 0.75rem (12px) | Captions, labels |
| `--text-sm` | 0.875rem (14px) | Secondary text, table cells |
| `--text-base` | 1rem (16px) | Body text |
| `--text-lg` | 1.125rem (18px) | Emphasized body |
| `--text-xl` | 1.25rem (20px) | Section headers |
| `--text-2xl` | 1.5rem (24px) | Card titles |
| `--text-3xl` | 1.875rem (30px) | Page section headers |
| `--text-4xl` | 2.25rem (36px) | Page titles |
| `--text-5xl` | 3rem (48px) | Hero headings |
| `--text-6xl` | 3.75rem (60px) | Large hero text |

### Font Weights

| Token | Weight | Usage |
|-------|--------|-------|
| `--font-light` | 300 | Decorative text |
| `--font-normal` | 400 | Body text |
| `--font-medium` | 500 | Emphasized text |
| `--font-semibold` | 600 | Subheadings |
| `--font-bold` | 700 | Headings |
| `--font-extrabold` | 800 | Hero text |

### Usage Rules

```tsx
// DO: Use consistent heading hierarchy
<h1 className="text-4xl font-bold">Page Title</h1>
<h2 className="text-2xl font-semibold">Section Title</h2>
<h3 className="text-xl font-medium">Subsection</h3>
<p className="text-base">Body text</p>

// DON'T: Skip heading levels or use inconsistent weights
<h1 className="text-lg font-normal">Wrong</h1>
```

---

## Spacing

Based on 4px/8px grid system. Full scale available in `design-tokens.css`.

| Scale | Range | Usage |
|-------|-------|-------|
| Minimal | `--space-1` to `--space-2` | Icon gaps, tight inline spacing |
| Standard | `--space-3` to `--space-4` | Component padding, inline spacing |
| Comfortable | `--space-6` to `--space-8` | Card padding, section spacing |
| Large | `--space-10` to `--space-24` | Page sections, hero areas |

### Usage Rules

```tsx
// DO: Use Tailwind spacing classes (based on design tokens)
<div className="p-4 space-y-4">
  <Card className="p-6">...</Card>
</div>

// DON'T: Use arbitrary values
<div className="p-[13px]">Inconsistent</div>
```

---

## Border Radius

> Full scale: `--radius-none`, `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-3xl`, `--radius-full`

| Usage | Recommended |
|-------|-------------|
| Small elements, badges | `rounded-sm` |
| Buttons, inputs | `rounded-md` to `rounded-lg` |
| Cards, modals | `rounded-lg` to `rounded-xl` |
| Large containers | `rounded-2xl` to `rounded-3xl` |
| Circular elements, pills | `rounded-full` |

---

## Shadows

> Full scale: `--shadow-xs`, `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl`, `--shadow-2xl`, `--shadow-inner`

| Shadow | Usage |
|--------|-------|
| `shadow-xs` to `shadow-sm` | Subtle elevation for inputs, small elements |
| `shadow-md` | Cards, dropdowns |
| `shadow-lg` | Modals, popovers |
| `shadow-xl` to `shadow-2xl` | Floating elements, hero cards |
| `--shadow-primary` | Primary action CTAs (colored shadow) |
| `--shadow-accent` | Accent highlights (colored shadow) |
| `--shadow-success` | Success elements (colored shadow) |

---

## Component Guidelines

### Buttons

Use the Shadcn `<Button>` component with variants:

| Variant | Usage |
|---------|-------|
| `default` | Primary actions |
| `secondary` | Secondary actions |
| `outline` | Tertiary actions |
| `ghost` | Subtle/inline actions |
| `destructive` | Delete, remove actions |
| `link` | Text links |

```tsx
// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### Cards

Use the Shadcn `<Card>` component:

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>Content here</CardContent>
  <CardFooter>Actions here</CardFooter>
</Card>
```

### Forms

Always use `react-hook-form` with Zod validation:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters'),
});

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { email: '', password: '' },
});
```

### Toast Notifications

Use the `useToast` hook consistently:

```tsx
import { useToast } from '@/hooks/use-toast';

const { toast } = useToast();

// Success
toast({ title: 'Success', description: 'Action completed' });

// Error
toast({ title: 'Error', description: 'Something went wrong', variant: 'destructive' });
```

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile-First Approach

```tsx
// DO: Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  ...
</div>

// DON'T: Desktop-first or mixed approaches
<div className="grid grid-cols-3 sm:grid-cols-1">Wrong</div>
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

1. **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
2. **Focus States**: All interactive elements must have visible focus indicators
3. **Keyboard Navigation**: All functionality accessible via keyboard
4. **ARIA Labels**: Provide labels for interactive elements without visible text
5. **Alt Text**: All images must have descriptive alt text

### Required Patterns

```tsx
// Buttons with icons only
<Button size="icon" aria-label="Close modal">
  <X className="h-4 w-4" />
</Button>

// Interactive cards
<Card
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  onClick={handleClick}
>
  ...
</Card>

// Form labels
<Label htmlFor="email">Email</Label>
<Input id="email" type="email" aria-describedby="email-error" />
```

---

## Naming Conventions

### Files & Components

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `TaxCalculator.tsx` |
| Pages | kebab-case.page.tsx | `tax-calculator.page.tsx` |
| Hooks | camelCase with use prefix | `useTaxCalculation.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `TaxReturn.ts` |

### CSS Classes

- Use Tailwind utilities
- Custom classes: kebab-case (e.g., `hero-gradient`, `card-elevated`)
- BEM for complex custom styles: `block__element--modifier`

### Variables & Functions

- Variables: camelCase (`taxAmount`, `userProfile`)
- Functions: camelCase verb+noun (`calculateTax`, `submitForm`)
- Constants: SCREAMING_SNAKE_CASE (`MAX_FILE_SIZE`, `API_BASE_URL`)
- Types/Interfaces: PascalCase (`UserProfile`, `TaxCalculation`)

---

## Error Handling Patterns

### API Errors

```tsx
try {
  const response = await apiRequest('POST', '/api/submit', data);
  toast({ title: 'Success', description: 'Form submitted successfully' });
} catch (error) {
  toast({
    title: 'Error',
    description: error.message || 'Something went wrong',
    variant: 'destructive',
  });
}
```

### Form Validation

```tsx
// Display field-level errors
{form.formState.errors.email && (
  <p className="text-sm text-destructive" role="alert">
    {form.formState.errors.email.message}
  </p>
)}
```

### Loading States

```tsx
// Use consistent loading patterns
{isLoading ? (
  <Skeleton className="h-10 w-full" />
) : (
  <ActualContent />
)}
```

---

## Quick Reference Checklist

Before submitting code, verify:

- [ ] Using design tokens (not hardcoded values)
- [ ] Components from Shadcn UI library
- [ ] Responsive design with mobile-first breakpoints
- [ ] Accessible focus states and ARIA labels
- [ ] Consistent spacing (4px/8px grid)
- [ ] Form validation with Zod
- [ ] Toast notifications for user feedback
- [ ] Loading/skeleton states
- [ ] Error boundaries for error handling
- [ ] Follows naming conventions

---

*Last Updated: January 2026*
*Version: 3.0*
