# Homepage Inter Font Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Use the Cricbuzz reference font family on the entire public MyeCA homepage without changing the rest of the site.

**Architecture:** The homepage owns a route-scoped body class that is attached while `/` is mounted and removed during cleanup. Shared CSS maps that hook to `Inter, sans-serif`, while `client/index.html` extends the existing deferred Google Fonts stylesheet to make Inter available without changing the default Plus Jakarta Sans stack.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Playwright release smoke.

---

### Task 1: Guard The Homepage Font Hook

**Files:**
- Modify: `tests/e2e/release-smoke.spec.ts`

- [ ] **Step 1: Write the failing test**

```ts
test("homepage uses its Inter route font hook", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => document.body.classList.contains("home-inter-font"))).toBe(true);
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).fontFamily)).toContain("Inter");

  await page.goto("/calculators/regime-comparator");
  await expect.poll(() => page.evaluate(() => document.body.classList.contains("home-inter-font"))).toBe(false);
});
```

- [ ] **Step 2: Run the focused release smoke test to verify it fails**

Run:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:5019'; npx.cmd playwright test tests/e2e/release-smoke.spec.ts --grep "homepage uses its Inter route font hook"
```

Expected: FAIL because the homepage does not yet add the `home-inter-font` class.

### Task 2: Apply The Route-Scoped Font

**Files:**
- Modify: `client/src/pages/home.page.tsx`
- Modify: `client/src/index.css`
- Modify: `client/index.html`

- [ ] **Step 1: Add the homepage body class lifecycle**

```ts
useEffect(() => {
  document.body.classList.add("home-inter-font");

  return () => {
    document.body.classList.remove("home-inter-font");
  };
}, []);
```

- [ ] **Step 2: Add the CSS route hook**

```css
body.home-inter-font {
  font-family: 'Inter', sans-serif;
}
```

- [ ] **Step 3: Extend the deferred app font request**

```html
<link id="app-font-css" rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" media="print">
```

Use the same Inter-inclusive URL inside the matching `noscript` link.

- [ ] **Step 4: Re-run the focused release smoke test**

Run:

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:5019'; npx.cmd playwright test tests/e2e/release-smoke.spec.ts --grep "homepage uses its Inter route font hook"
```

Expected: PASS.

### Task 3: Verify The Change

**Files:**
- Verify: `client/src/pages/home.page.tsx`
- Verify: `client/src/index.css`
- Verify: `client/index.html`
- Verify: `tests/e2e/release-smoke.spec.ts`

- [ ] **Step 1: Run type checking**

```powershell
npm.cmd run check
```

Expected: PASS.

- [ ] **Step 2: Run release smoke**

```powershell
$env:PLAYWRIGHT_BASE_URL='http://127.0.0.1:5019'; npx.cmd playwright test tests/e2e/release-smoke.spec.ts
```

Expected: PASS.

- [ ] **Step 3: Verify the homepage computed font**

Open `/` in the in-app browser and confirm `getComputedStyle(document.body).fontFamily` begins with `Inter`.
