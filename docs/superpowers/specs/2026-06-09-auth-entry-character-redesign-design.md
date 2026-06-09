# Auth Entry Character Redesign

## Goal

Redesign the public MyeCA login and signup pages as a cohesive, illustration-led
authentication experience inspired by the approved reference. The pages should
feel professional, focused, and friendly without changing authentication
behavior.

## Approved Direction

Use a narrow vertical white card on a quiet light-gray page. Each card places a
top-only portrait of the supplied MyeCA caricature above a strong centered
heading, followed by the existing authentication controls.

The supplied source asset is:

`C:\Users\jitsu\OneDrive\Desktop\Myeca carriacature.png`

Create a repository-owned optimized copy for the application. Remove the baked
checkerboard background, preserve the character's appearance, and display a
consistent upper-body crop showing the face, glasses, hair, suit collar, and
crossed-arm pose.

## Login Page

- Show the MyeCA brand above the character portrait.
- Use the heading `Welcome back!`.
- Use concise supporting copy that explains the user can continue to the MyeCA
  tax workspace.
- Keep email, password, forgot-password, Google sign-in, and submit behavior.
- Place the email/password sign-in action before the Google alternative.
- Keep the create-account link as a quiet footer action.
- Add a restrained login-only greeting:
  - The portrait enters with a small fade and vertical movement.
  - A small `Hi` bubble appears briefly.
  - The animation pauses for most of its cycle and must not distract from form
    entry.
  - Respect `prefers-reduced-motion`.

## Signup Page

- Use the same MyeCA brand, character asset, portrait crop, halo, scale, and
  placement as login.
- Use the heading `Create your account`.
- Keep first name, last name, email, password, confirm-password, Google signup,
  confirmation resend, and submit behavior.
- Keep the character static so the longer form remains calm and task-focused.
- Keep the sign-in link as a quiet footer action.

## Shared Visual System

- Page background: quiet light gray.
- Card: white, narrow, lightly bordered, restrained shadow, minimal radius.
- Primary actions: MyeCA navy/blue, full width.
- Inputs: white, clear blue focus state, consistent height and icon treatment.
- Typography: centered, strong heading; compact supporting copy; readable form
  labels.
- Illustration frame: soft blue circular halo with a white lower fade to make
  the top-only crop feel intentional.
- Avoid finance labels, promotional panels, Facebook login, decorative metrics,
  or unrelated trust claims.

## Responsive Behavior

- Desktop and mobile use the same single-card composition.
- The card must fit without horizontal overflow at 390px width.
- The signup page may scroll vertically on short screens.
- Portrait size and crop remain consistent across responsive sizes.
- Links and controls remain keyboard accessible with visible focus states.

## Behavior That Must Not Change

- Safe `redirect_url` and `next` handling.
- Existing Supabase email/password and Google OAuth flows.
- Existing role-aware post-login routing.
- Password visibility behavior on login.
- Forgot-password route.
- Signup password matching and minimum length validation.
- Email confirmation and resend states.
- Temporary local test login behavior.

## Component Boundaries

- Extend `AuthPageShell` with the approved compact-card presentation and shared
  portrait treatment.
- Add a focused reusable auth character component for crop, halo, animation,
  accessible labeling, and reduced-motion behavior.
- Keep login and signup form logic within their current page modules.
- Store the optimized character asset under the existing public asset surface.

## Testing And Verification

- Add component tests covering:
  - Shared top-only character portrait on login and signup.
  - Login-only greeting animation marker.
  - No finance branding.
  - Existing headings and primary auth controls.
- Run focused auth tests, TypeScript checks, and production build.
- Browser-verify login and signup at the current viewport, `1280x800`, and
  `390x844`.
- Verify no horizontal overflow, framework overlay, or relevant console errors.
- Exercise password visibility and login/signup navigation links.
- Confirm the supplied character appears with the same crop and scale on both
  pages.
