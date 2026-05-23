# Homepage Inter Font Design

## Goal

Match the Cricbuzz reference typography family on the MyeCA homepage by using `Inter, sans-serif` across the full `/` route view.

## Scope

- Apply Inter only while the public homepage route is mounted.
- Include shared homepage chrome visible on `/`, including header and footer, by applying the route hook at the document body level.
- Keep existing typography unchanged on non-homepage routes.
- Reuse the existing Google Fonts loading pattern instead of adding a new app-wide font system.

## Approach

The homepage will add a body class during mount and remove it during unmount. Global CSS will map that class to the Inter stack, and the app font stylesheet will request Inter alongside the existing Plus Jakarta Sans weights so the route-specific stack has a webfont available after boot.

This keeps the global default font behavior intact while allowing lazy homepage sections and shared layout elements on `/` to inherit Inter naturally.

## Verification

- Add a release-smoke regression that proves `/` uses the homepage font hook and a non-homepage public route does not keep it.
- Run type checking and the focused release-smoke coverage.
- Verify the rendered homepage in the browser by reading the computed `font-family` on `document.body`.
