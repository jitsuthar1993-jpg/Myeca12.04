# Component: Button

## Description

The `Button` component is the primary interactive element used to trigger actions, submit forms, or navigate. Use a Button when you need a clear, tappable call-to-action. Choose the variant based on the action's importance — reserve `primary` for the single most important action per view.

---

## Variants

| Variant | Use When |
|---------|----------|
| `primary` | The main CTA — one per screen/section (e.g. "Save", "Submit", "Confirm") |
| `secondary` | Supporting actions that complement primary (e.g. "Cancel", "Back") |
| `ghost` | Low-emphasis actions in dense UIs, toolbars, or alongside primary content |
| `destructive` | Irreversible or high-risk actions (e.g. "Delete", "Remove", "Revoke") |
| `link` | Inline actions styled like text — best in body copy or footers |

---

## Sizes

| Size | Token | Use When |
|------|-------|----------|
| `sm` | `size-sm` | Compact UIs, toolbars, table row actions |
| `md` | `size-md` | Default — most dialogs, forms, and page actions |
| `lg` | `size-lg` | Hero sections, onboarding flows, marketing CTAs |
| `icon` | — | Icon-only button (requires `aria-label`) |

---

## Props

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'destructive' \| 'link'` | `'primary'` | Visual style of the button |
| `size` | `'sm' \| 'md' \| 'lg' \| 'icon'` | `'md'` | Size of the button |
| `isLoading` | `boolean` | `false` | Shows a spinner and disables interaction |
| `isDisabled` | `boolean` | `false` | Prevents interaction and dims the button |
| `leftIcon` | `ReactNode` | `undefined` | Icon rendered to the left of the label |
| `rightIcon` | `ReactNode` | `undefined` | Icon rendered to the right of the label |
| `fullWidth` | `boolean` | `false` | Stretches button to fill its container |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type attribute |
| `onClick` | `(e: MouseEvent) => void` | — | Click handler |
| `children` | `ReactNode` | — | Button label content |
| `aria-label` | `string` | — | Required for icon-only buttons |
| `aria-busy` | `boolean` | auto | Set to `true` when `isLoading` is active |

---

## States

| State | Visual | Behavior |
|-------|--------|----------|
| **Default** | Solid fill or outlined, full opacity | Ready to receive interaction |
| **Hover** | Background darkens / lightens by one step; subtle scale (1.01) | Cursor changes to `pointer` |
| **Active / Pressed** | Background steps further; slight scale-down (0.98) | Fires `onClick` on pointer release |
| **Focus-visible** | 2px offset focus ring using `color.focus` token | Keyboard focus only (not shown on click) |
| **Disabled** | 40% opacity, `cursor: not-allowed` | Pointer events disabled; not focusable via Tab |
| **Loading** | Label hidden or faded; spinner centered; button width locked | `pointer-events: none`; `aria-busy="true"` announced to screen readers |
| **Loading + Disabled** | Same as loading | Combined when a form is submitting and further interaction is blocked |

---

## Accessibility

- **Role:** `button` (native `<button>` element — do not use `<div>` or `<a>` with `role="button"` unless absolutely necessary)
- **Keyboard:**
  - `Tab` / `Shift+Tab` — move focus to/from the button
  - `Enter` or `Space` — activate the button
  - Disabled buttons should **not** receive focus (use `disabled` attribute, not just `aria-disabled`)
- **Screen reader:**
  - Announced as: *"[Label], button"*
  - Loading state announced as: *"[Label], button, busy"* (via `aria-busy="true"`)
  - Icon-only buttons **must** have an `aria-label` — the icon alone is not sufficient
  - Destructive actions should communicate risk in the label itself (e.g. *"Delete account"* not just *"Delete"*) or via an `aria-describedby` pointing to explanatory text
- **Color contrast:** All variants must meet WCAG 2.1 AA — minimum 4.5:1 for text on background
- **Touch target:** Minimum 44×44px tap target even if the visual size is smaller (use padding or `min-height`)

---

## Do's and Don'ts

| ✅ Do | ❌ Don't |
|------|---------|
| Use `primary` for the single most important action per view | Use multiple `primary` buttons in the same section |
| Keep labels short, action-oriented verbs ("Save changes", "Add item") | Use vague labels like "Click here" or "Submit" without context |
| Show a loading spinner while async actions are in progress | Remove the button or replace with text during loading — this causes layout shift |
| Include `aria-label` on icon-only buttons | Rely on tooltips alone for icon-only button meaning |
| Use `type="submit"` inside forms | Omit `type` inside a form (browser defaults may cause unintended submissions) |
| Use `destructive` variant for delete/remove actions | Use `primary` for destructive actions — it masks the risk |
| Maintain button width during loading state | Allow the button to resize when the spinner replaces the label |

---

## Code Example

```tsx
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';

// Primary — default usage
<Button variant="primary" onClick={handleSave}>
  Save changes
</Button>

// Secondary — supporting action
<Button variant="secondary" onClick={handleCancel}>
  Cancel
</Button>

// Destructive with left icon
<Button variant="destructive" leftIcon={<Trash2 size={16} />} onClick={handleDelete}>
  Delete account
</Button>

// Loading state
<Button variant="primary" isLoading onClick={handleSubmit}>
  Save changes
</Button>

// Icon-only with aria-label
<Button variant="ghost" size="icon" aria-label="Delete item" onClick={handleDelete}>
  <Trash2 size={16} />
</Button>

// Full-width for mobile/modal contexts
<Button variant="primary" fullWidth>
  Confirm
</Button>
```

---

## TypeScript Interface

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  children: React.ReactNode;
}
```

---

## Token Reference

| Property | Token |
|----------|-------|
| Primary background | `color.action.primary` |
| Primary text | `color.text.on-primary` |
| Hover overlay | `color.action.primary-hover` |
| Destructive background | `color.action.destructive` |
| Focus ring | `color.focus` |
| Disabled opacity | `opacity.disabled` (0.4) |
| Border radius | `radius.button` |
| Font size (md) | `text.sm` |
| Font weight | `font.weight.medium` |
| Padding (md) | `spacing.3` (vertical) × `spacing.5` (horizontal) |
| Min touch target | `44px` |
