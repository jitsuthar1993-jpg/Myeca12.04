# Changelog – Link Updates and SIP Calculator Fix

## Summary
- Consolidated updates to UI links to align with valid client-side routes.
- Fixed SIP calculator state handling to resolve runtime errors and incorrect slider bindings.
- Verified routes and pages using the Vite dev server (`http://localhost:5173/`).

## Link Updates
- Auth: Updated "Forgot password?" link from `/auth/forgot-password` to `/help`.
  - File: `client/src/pages/auth/login.page.tsx`
- AI Assistant: Updated links from `/ai-assistant` to `/advanced-features`.
  - Files: `client/src/pages/enhanced-search.page.tsx`, `client/src/components/ui/quick-actions.tsx`, `client/src/components/ui/notification-center.tsx`, `client/src/data/all-services.ts`
- Help Center: Updated `/support` to `/help`.
  - File: `client/src/pages/user-dashboard.page.tsx`
- Expert Consultation: Updated `/contact` to `/expert-consultation`.
  - Files: `client/src/components/search/GlobalSearch.tsx`, `client/src/components/ui/collapsible-faq.tsx`

## SIP Calculator Fix
- Replaced incorrect `inputs` state references with direct state variables.
  - File: `client/src/pages/calculators/sip.page.tsx`
  - Correctly uses: `years`, `expectedReturn`, `monthlyAmount` across sliders and display fields.
- Verification: Searched the calculators directory to confirm no lingering `inputs` references in `sip.page.tsx`.

## How to Verify
1. Start the dev server:
   - Command: `npx vite` (runs at the project root)
   - Preview: `http://localhost:5173/`
2. Validate routes:
   - Help Center: `http://localhost:5173/help`
   - Advanced Features: `http://localhost:5173/advanced-features`
   - Expert Consultation: `http://localhost:5173/expert-consultation`
   - Login Forgot Password link: open `Login` page and confirm it points to `/help`.
3. Validate SIP calculator:
   - Navigate: `http://localhost:5173/calculators/sip`
   - Adjust sliders and confirm values and computed results update correctly without errors.

## Notes
- On Windows, the root `npm run dev` script uses Unix-style env setting (`NODE_ENV=development`). For compatibility, prefer `npx vite` for client UI development, or update the script to use `cross-env`.