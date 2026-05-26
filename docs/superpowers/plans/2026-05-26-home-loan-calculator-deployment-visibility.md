# Home Loan Calculator Deployment Visibility Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the saved home-loan calculator layout changes visible on `https://myeca.in/calculators/home-loan` without merging unrelated feature-branch work.

**Architecture:** Start from latest `origin/main`, port only the calculator layout change from commit `3ff1575`, verify the Vite build and deployed page, then push the focused fix through the normal production path. Treat deployment visibility and public indexing headers as separate verification gates.

**Tech Stack:** React + Vite, Wouter routes, shared calculator components, Vercel production deployment, PowerShell, npm scripts.

---

### Task 1: Create a Clean Integration Branch

**Files:**
- No file edits in this task.

- [ ] **Step 1: Refresh remote refs**

Run:

```powershell
git fetch --all --prune
```

Expected: command exits with status `0`.

- [ ] **Step 2: Confirm no local-only commits are waiting**

Run:

```powershell
git status --short --branch
git log --oneline --decorate --branches --not --remotes --max-count=50
```

Expected:
- `git status` shows a clean working tree.
- The second command prints no commits.

- [ ] **Step 3: Create the focused production-fix branch from `origin/main`**

Run:

```powershell
git switch -c codex/home-loan-calculator-live-fix origin/main
```

Expected: Git switches to `codex/home-loan-calculator-live-fix`.

---

### Task 2: Port Only the Home-Loan Calculator Layout Fix

**Files:**
- Modify: `client/src/features/calculators/components/CalcGlassSidebar.tsx`
- Modify: `client/src/features/calculators/components/CalcHero.tsx`
- Modify: `client/src/features/calculators/components/CalcInputCard.tsx`
- Modify: `client/src/features/calculators/pages/loan-calculator.page.tsx`

- [ ] **Step 1: Apply the source commit without committing it**

Run:

```powershell
git cherry-pick -n 3ff1575
```

Expected: changes from `3ff1575` are staged/unstaged in the working tree, and no commit is created yet.

- [ ] **Step 2: Restore unrelated files from the cherry-pick**

Run:

```powershell
git restore --staged --worktree -- `
  client/src/features/calculators/pages/advance-tax.page.tsx `
  client/src/features/calculators/pages/fd-enhanced.page.tsx `
  client/src/features/calculators/pages/hsn-finder.page.tsx `
  client/src/features/calculators/pages/penalty-calculator.page.tsx `
  client/src/features/calculators/pages/sip.page.tsx `
  client/src/features/calculators/pages/tax-regime.page.tsx `
  client/src/features/calculators/pages/withdrawal-planner.page.tsx `
  client/src/pages/help/faq.page.tsx
```

Expected: only the four calculator layout files remain changed.

- [ ] **Step 3: Verify the scoped diff**

Run:

```powershell
git diff --name-status
git diff -- client/src/features/calculators/pages/loan-calculator.page.tsx
```

Expected:
- Changed files are only the four files listed above.
- `loan-calculator.page.tsx` includes `LoanBreakdownDonut`, compact hero usage, tighter input card spacing, and smaller sidebar/button spacing.

---

### Task 3: Verify Local Build Safety

**Files:**
- No additional file edits in this task unless verification exposes a compile error in the scoped files.

- [ ] **Step 1: Run type/check validation**

Run:

```powershell
npm.cmd run check
```

Expected: command exits with status `0`.

- [ ] **Step 2: Run production build**

Run:

```powershell
npm.cmd run build
```

Expected: command exits with status `0`.

- [ ] **Step 3: Remove incidental generated sitemap churn if build rewrites dates only**

Run:

```powershell
git diff -- client/public/sitemap.xml
```

Expected:
- If the diff only contains generated `lastmod` date churn unrelated to this fix, restore it:

```powershell
git restore -- client/public/sitemap.xml
```

- [ ] **Step 4: Check whitespace and final changed files**

Run:

```powershell
git diff --check
git diff --name-status
```

Expected:
- No whitespace errors.
- Only the four scoped calculator files remain changed.

---

### Task 4: Verify Runtime and Deployment Signals

**Files:**
- No file edits in this task unless verification exposes a real defect.

- [ ] **Step 1: Verify the built route locally when a production server is available**

Run the app using the repo's production-style server path, then inspect:

```powershell
npm.cmd run start
```

Open:

```text
http://127.0.0.1:5000/calculators/home-loan
```

Expected:
- The page renders the compact calculator layout.
- The EMI breakdown uses the inline SVG donut, not the old Recharts pie component.
- Home, car, personal, and education loan tabs still switch correctly.
- The layout has no visible mobile overflow.

- [ ] **Step 2: Commit the focused fix**

Run:

```powershell
git add client/src/features/calculators/components/CalcGlassSidebar.tsx `
  client/src/features/calculators/components/CalcHero.tsx `
  client/src/features/calculators/components/CalcInputCard.tsx `
  client/src/features/calculators/pages/loan-calculator.page.tsx

git commit -m "fix: publish home loan calculator layout"
```

Expected: a new focused commit is created on `codex/home-loan-calculator-live-fix`.

- [ ] **Step 3: Push the branch**

Run:

```powershell
git push -u origin codex/home-loan-calculator-live-fix
```

Expected: branch is uploaded to GitHub.

- [ ] **Step 4: Deploy or merge through the production path**

Use the existing production release path for this repo. The expected production source is `origin/main`, so either merge the focused branch into `main` and push, or use the Vercel project deployment flow that promotes this branch to production.

Expected: Vercel serves a deployment that includes the new commit.

- [ ] **Step 5: Verify the live page after deployment**

Run:

```powershell
curl.exe -I https://myeca.in/calculators/home-loan
$html = (Invoke-WebRequest -UseBasicParsing 'https://myeca.in/calculators/home-loan').Content
$html | Select-String -Pattern '/assets/index-[^" ]+\.js' -AllMatches
```

Expected:
- Response is `200 OK`.
- The HTML references a newly deployed hashed JS bundle, different from the stale bundle observed before this plan.
- `X-Robots-Tag` is `index, follow`; if it remains `noindex, nofollow`, track that as a separate production header bug before declaring SEO visibility fixed.

- [ ] **Step 6: Verify live UI fingerprint**

Fetch the live JS bundle printed by Step 5 and check for the new implementation marker:

```powershell
$bundleUrl = 'https://myeca.in/assets/<replace-with-current-index-bundle>.js'
$js = (Invoke-WebRequest -UseBasicParsing $bundleUrl).Content
$js.Contains('LoanBreakdownDonut')
```

Expected: command prints `True`.

---

### Task 5: Final Report

**Files:**
- No file edits in this task.

- [ ] **Step 1: Report the result**

Include:
- Branch and commit pushed.
- Verification commands that passed.
- Live `https://myeca.in/calculators/home-loan` status.
- Live bundle hash observed after deployment.
- Whether `X-Robots-Tag` is now `index, follow` or still needs a separate fix.
