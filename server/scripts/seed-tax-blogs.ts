import "dotenv/config";
import { adminDb } from "../neon-admin.js";

async function seed() {
  console.log("Seeding core tax guide blogs...");

  // 1. Get or create "Direct Tax" category
  const catSnapshot = await adminDb.collection("categories").where("slug", "==", "direct-tax").limit(1).get();
  let categoryId: string;
  if (catSnapshot.empty) {
    const catRef = await adminDb.collection("categories").add({
      name: "Direct Tax",
      slug: "direct-tax",
      description: "Guides on income tax, ITR filing, deductions, and direct taxation in India.",
      id: Date.now(),
    });
    categoryId = catRef.id;
    console.log("Created category: Direct Tax");
  } else {
    categoryId = catSnapshot.docs[0].id;
    console.log("Category exists: Direct Tax");
  }

  // 2. Get admin user
  let authorId = "";
  const adminSnapshot = await adminDb.collection("users").where("role", "==", "admin").limit(1).get();
  if (!adminSnapshot.empty) {
    authorId = adminSnapshot.docs[0].id;
  } else {
    const anyUser = await adminDb.collection("users").limit(1).get();
    if (!anyUser.empty) authorId = anyUser.docs[0].id;
  }
  console.log(`Using author: ${authorId || "none"}`);

  // ─────────────────────────────────────────────
  // BLOG POSTS
  // ─────────────────────────────────────────────
  const taxBlogs = [
    // ─── 1. Income Tax in India ───────────────────────────────────────────
    {
      title: "Income Tax in India: The Complete Guide for FY 2025-26",
      slug: "income-tax-india-complete-guide",
      excerpt:
        "Understand what income tax is, how the Old and New Tax Regime slabs work for FY 2025-26, and how to calculate your liability step by step. A one-stop guide for every Indian taxpayer.",
      featuredImage: "🧾",
      readTime: "12 min read",
      tags: JSON.stringify(["Income Tax", "Tax Slabs", "Tax Calculation", "Deductions", "FY 2025-26"]),
      content: `## What Is Income Tax?

Income tax is a direct tax levied by the Central Government of India on the income earned by individuals, Hindu Undivided Families (HUFs), companies, and other entities during a financial year. It is governed by the **Income Tax Act, 1961**, and administered by the **Central Board of Direct Taxes (CBDT)**.

The tax you pay funds public services — roads, defence, healthcare, and education — making it one of the most important civic obligations for every earning Indian.

> **Key Terms to Know:** Financial Year (FY) is the year you earn income (April 1 to March 31). Assessment Year (AY) is the year you file your returns for that income. FY 2025-26 income is reported in AY 2026-27.

---

## Who Is Required to Pay Income Tax?

You must file an Income Tax Return (ITR) if any of the following apply:

- Your gross total income exceeds the basic exemption limit (₹2.5 lakh under Old Regime, ₹3 lakh under New Regime)
- You have deposited more than ₹1 crore in a bank account in a year
- You have incurred more than ₹2 lakh on foreign travel
- You have paid electricity bills exceeding ₹1 lakh
- Your TDS / TCS amount is ₹25,000 or more (₹50,000 for senior citizens)
- You are a company or firm, regardless of profit or loss

---

## The Two Tax Regimes: Old vs New

India currently offers taxpayers a choice between two regimes. Understanding the difference is critical before calculating your tax.

### Old Tax Regime

The Old Regime has been in place for decades and allows a wide range of deductions and exemptions to reduce your taxable income.

**Old Regime Tax Slabs (FY 2025-26)**

| Income Slab | Tax Rate |
|---|---|
| Up to ₹2,50,000 | NIL |
| ₹2,50,001 – ₹5,00,000 | 5% |
| ₹5,00,001 – ₹10,00,000 | 20% |
| Above ₹10,00,000 | 30% |

Additional surcharges apply for income above ₹50 lakh, and a **4% Health & Education Cess** applies on all tax amounts.

### New Tax Regime (Default from FY 2024-25 onwards)

The New Regime offers lower slab rates but **removes most deductions and exemptions**. It became the default regime from FY 2023-24.

**New Regime Tax Slabs (FY 2025-26)**

| Income Slab | Tax Rate |
|---|---|
| Up to ₹3,00,000 | NIL |
| ₹3,00,001 – ₹7,00,000 | 5% |
| ₹7,00,001 – ₹10,00,000 | 10% |
| ₹10,00,001 – ₹12,00,000 | 15% |
| ₹12,00,001 – ₹15,00,000 | 20% |
| Above ₹15,00,000 | 30% |

> **Budget 2025 Update:** Under the New Regime, resident individuals with income up to **₹12 lakh** effectively pay zero tax after the enhanced Section 87A rebate of ₹60,000. Salaried individuals additionally get a **₹75,000 standard deduction**, pushing the effective zero-tax threshold to ₹12.75 lakh.

---

## The 5 Heads of Income

All income in India is classified under five heads for tax purposes:

1. **Income from Salaries** – Salary, allowances, perquisites from an employer
2. **Income from House Property** – Rental income or deemed rent from property
3. **Profits and Gains from Business or Profession** – Net income from a business, freelancing, or professional practice
4. **Capital Gains** – Profits from selling capital assets (stocks, mutual funds, land, jewellery)
5. **Income from Other Sources** – Interest on savings/FDs, dividends, lottery winnings, gifts above ₹50,000

---

## How to Calculate Your Income Tax (Step by Step)

### Step 1: Add Up All Income

List and total income from all five heads above to arrive at your **Gross Total Income (GTI)**.

### Step 2: Claim Deductions (Old Regime Only)

Under the Old Regime, subtract eligible deductions:
- **Section 80C**: Up to ₹1,50,000 (PPF, ELSS, LIC premium, home loan principal, tuition fees)
- **Section 80D**: Up to ₹25,000 for health insurance premiums (₹50,000 for senior citizens)
- **Section 80TTA**: Up to ₹10,000 on savings account interest
- **HRA Exemption**: Based on rent paid, salary, and city of residence

After deductions you get your **Total Taxable Income**.

### Step 3: Apply Slab Rates

Apply the applicable slab rates (from the tables above) to your total taxable income to compute your **Basic Tax**.

### Step 4: Add Surcharge (if applicable)

| Income Range | Surcharge Rate |
|---|---|
| ₹50 lakh – ₹1 crore | 10% of tax |
| ₹1 crore – ₹2 crore | 15% of tax |
| ₹2 crore – ₹5 crore | 25% of tax |
| Above ₹5 crore | 37% of tax (25% under New Regime) |

### Step 5: Add Health & Education Cess

Add **4% cess** on (Basic Tax + Surcharge) = **Total Tax Payable**

### Step 6: Deduct TDS and Advance Tax

Subtract any **Tax Deducted at Source (TDS)** already deducted by your employer or bank, and any **Advance Tax** you have already paid. The balance is your **final tax due** (or refund).

---

## Key Tax-Saving Deductions (Old Regime)

### Section 80C — ₹1,50,000 Limit
- Public Provident Fund (PPF)
- Employee Provident Fund (EPF)
- Equity Linked Saving Scheme (ELSS)
- National Savings Certificate (NSC)
- 5-year Tax Saving Fixed Deposit
- Life Insurance Premium
- Home loan principal repayment
- Children's tuition fees

### Section 80D — Health Insurance
- Up to ₹25,000 for self, spouse, and children
- Additional ₹25,000 for parents (₹50,000 if parents are senior citizens)

### Section 24(b) — Home Loan Interest
- Up to ₹2,00,000 deduction on home loan interest for a self-occupied property

### Other Notable Deductions
- **80E**: Education loan interest (no upper limit, up to 8 years)
- **80G**: Donations to approved charitable institutions
- **80TTA/TTB**: Interest on savings accounts

---

## Important Dates for FY 2025-26

| Event | Deadline |
|---|---|
| Advance Tax (1st instalment) | 15 June 2025 |
| Advance Tax (2nd instalment) | 15 September 2025 |
| Advance Tax (3rd instalment) | 15 December 2025 |
| Advance Tax (4th instalment) | 15 March 2026 |
| ITR Filing (non-audit cases) | 31 July 2026 |
| ITR Filing (audit cases) | 31 October 2026 |

---

## Frequently Asked Questions

**Q: Is it mandatory to file ITR even if all my tax has been deducted by my employer?**
Yes, if your income exceeds the exemption limit or you meet any other criteria (like foreign travel or high deposits), filing is mandatory.

**Q: Can I switch between Old and New Regime every year?**
Salaried individuals can switch every year at the time of filing. Business owners can switch from the New Regime to the Old Regime only once.

**Q: What happens if I don't file my ITR?**
Late filing attracts a penalty of ₹5,000 (₹1,000 if income is below ₹5 lakh). Additionally, you may face interest under Sections 234A, 234B, and 234C on unpaid tax.`,
    },

    // ─── 2. How to e-File ITR Online ──────────────────────────────────────
    {
      title: "How to e-File ITR Online in India: Step-by-Step Guide (AY 2026-27)",
      slug: "how-to-efile-itr-online-india",
      excerpt:
        "A complete step-by-step guide to filing your Income Tax Return online on the Income Tax e-Filing portal for AY 2026-27. Covers prerequisites, documents needed, and the entire filing process.",
      featuredImage: "💻",
      readTime: "10 min read",
      tags: JSON.stringify(["ITR Filing", "e-Filing", "Income Tax Portal", "AY 2026-27", "Online Filing"]),
      content: `## What Is e-Filing of ITR?

e-Filing means submitting your **Income Tax Return (ITR)** electronically through the Income Tax Department's official portal at **incometax.gov.in**. It replaced the old paper-based filing system and is now mandatory for most taxpayers, including individuals with income above ₹5 lakh and companies.

Filing your ITR accurately and on time ensures you:
- Comply with tax law and avoid penalties
- Can claim refunds on excess TDS
- Build a strong financial record for visa and loan applications
- Carry forward losses to future years

---

## Prerequisites Before You Start

Before you sit down to file, ensure the following are in place:

### 1. Active PAN
Your **Permanent Account Number (PAN)** is your primary identity on the portal. It must be active and linked to your Aadhaar.

### 2. Aadhaar-PAN Linking
This is **mandatory**. If your PAN is not linked to Aadhaar, it becomes inoperative and you cannot file.

### 3. Registered Mobile Number
An active mobile number linked to your Aadhaar or registered on the income tax portal is needed for OTP-based verification.

### 4. Valid Bank Account (Pre-validated)
At least one bank account must be **pre-validated** on the portal for refund credits.

---

## Documents You Need to Gather

Collect the following documents before starting:

**For Salaried Individuals:**
- **Form 16** (Part A and Part B) issued by your employer
- Salary slips for the full financial year
- Form 26AS (Annual Information Statement from income tax portal)
- AIS (Annual Information Statement) — download from the portal

**For Investment Income:**
- Capital Gains statement from your broker or mutual fund platform
- Bank statements showing interest earned
- Fixed deposit interest certificates (Form 16A from banks)
- Dividend statements

**For House Property:**
- Rent receipts if you earn rental income
- Home loan interest certificate from the lender
- Municipal tax payment receipts

**Other Documents:**
- Proof of deductions claimed (80C, 80D premium receipts, donation receipts for 80G)
- Foreign asset details (if any)
- Bank account details (account number, IFSC code)

---

## Step-by-Step Guide to Filing ITR Online

### Step 1: Log In to the Income Tax Portal

Go to **[incometax.gov.in](https://www.incometax.gov.in)** and click **Login**. Use your PAN as the User ID and enter your password. If you are a new user, click **Register** and complete the registration using your PAN, Aadhaar, and mobile number.

### Step 2: Download and Review Form 26AS and AIS

After logging in:
1. Go to **e-File > Income Tax Returns > View Form 26AS**
2. Also download your **AIS (Annual Information Statement)** from the **AIS** tab under **e-File**

Cross-check all TDS entries, interest income, and capital gains figures in these documents against your own records. Any discrepancy should be resolved before filing.

### Step 3: Select the Correct ITR Form

Click on **e-File > File Income Tax Return > Start New Filing**.

The portal will ask you:
- Assessment Year: Select **AY 2026-27** for FY 2025-26 income
- Mode of Filing: **Online**
- Status: Individual / HUF / Firm etc.

Based on your income type, select the appropriate ITR form (see our detailed guide on choosing the right ITR form). For most salaried individuals with simple income, this will be **ITR-1 or ITR-2**.

### Step 4: Choose Tax Regime

When prompted, select either:
- **Old Tax Regime** — if you have significant deductions (80C, HRA, home loan, etc.)
- **New Tax Regime** — if you prefer lower rates without tracking deductions

> **Tip:** The portal may show you a comparison to help you decide. If in doubt, compute your tax both ways using an online calculator before choosing.

### Step 5: Fill in Personal Information

Verify your pre-filled personal details:
- Full name, date of birth, and gender
- Address (residential)
- Aadhaar number
- Email address and mobile number for communication

### Step 6: Enter Income Details

This is the most critical step. Enter income under each applicable head:

**Salary Income:**
- Enter figures from Form 16: Gross Salary, allowances, perquisites
- The portal auto-fills a ₹50,000 standard deduction (₹75,000 under New Regime)

**House Property:**
- Enter annual rental income received
- Deduct municipal taxes paid
- Claim 30% standard deduction and home loan interest (up to ₹2 lakh for self-occupied)

**Capital Gains:**
- Enter short-term and long-term capital gains from stocks, mutual funds, and property
- Use your broker's capital gains statement

**Other Sources:**
- Savings account interest, FD interest, dividends, etc.

### Step 7: Claim Deductions (Old Regime)

If you opted for the Old Regime, navigate to the **Deductions** section and enter:

| Section | What You Can Claim |
|---|---|
| 80C | PPF, ELSS, LIC, EPF, home loan principal (max ₹1.5L) |
| 80D | Health insurance premiums (max ₹25,000 – ₹1L) |
| 80E | Education loan interest |
| 80G | Donations |
| 24(b) | Home loan interest (max ₹2L for self-occupied) |

### Step 8: Review Tax Computation

The portal will automatically calculate:
- Total Taxable Income
- Tax payable as per the chosen regime
- TDS already deducted (pulled from Form 26AS)
- Net tax payable or refund due

If there is additional tax to be paid, **pay it online** via the **Pay Now** option before submitting (this is called Self-Assessment Tax under challan 280).

### Step 9: Validate and Preview

Click **Preview Return**. Read through the entire return carefully. If everything looks correct, click **Proceed to Validation**.

The portal will flag any errors (missing mandatory fields, mismatches). Resolve each flagged issue.

### Step 10: Submit and e-Verify

Once validated, click **Submit**. After submission, you must **e-Verify** within **30 days** to complete the process. Verification options:

- **Aadhaar OTP** (fastest — instant)
- **Net Banking** (through your bank's portal)
- **Demat Account** (via CDSL/NSDL)
- **Bank ATM** (some banks)
- **DSC (Digital Signature Certificate)** — for companies and audit cases
- **Sending signed ITR-V by post** to CPC Bengaluru (within 30 days)

> **Important:** Your return is NOT complete until it is e-verified. An unverified return is treated as if it was never filed.

### Step 11: Acknowledgement

After successful e-verification, download your **ITR-V / Acknowledgement** from **e-File > View Filed Returns**. Save this document as proof of filing.

---

## Common Mistakes to Avoid

- Filing under the wrong AY (always double-check: FY 2025-26 → AY 2026-27)
- Not reconciling Form 26AS/AIS before filing — mismatches trigger notices
- Forgetting to report bank interest and dividend income
- Missing the e-verification deadline (30 days)
- Not reporting income from previous employer's Form 16 if you changed jobs mid-year

---

## What Happens After Filing?

After e-verification, the Income Tax Department processes your return, usually within **15–45 days**. You will receive:
- A processing intimation under **Section 143(1)** by email/SMS
- A **refund** (if applicable) directly to your pre-validated bank account
- A notice (if discrepancies are found) — respond online through the portal`,
    },

    // ─── 3. Which ITR Form to File ────────────────────────────────────────
    {
      title: "Which ITR Form Should You File? Complete Guide to ITR-1 Through ITR-7 (AY 2026-27)",
      slug: "which-itr-form-to-file-guide",
      excerpt:
        "Confused about which ITR form applies to you? This guide breaks down ITR-1 to ITR-7 — who should use each form, applicable income types, and key restrictions to help you file the right return.",
      featuredImage: "📋",
      readTime: "9 min read",
      tags: JSON.stringify(["ITR Form", "ITR-1", "ITR-2", "ITR-3", "ITR-4", "Which ITR to File", "AY 2026-27"]),
      content: `## Why Choosing the Right ITR Form Matters

Filing your Income Tax Return using the **wrong form** is not a minor technicality — the Income Tax Department can treat it as a **defective return**, which you will need to refile. In some cases, it can even trigger a scrutiny notice.

India has **seven ITR forms** (ITR-1 through ITR-7), each designed for a specific taxpayer category and type of income. This guide helps you identify the correct one for AY 2026-27 (income earned in FY 2025-26).

---

## Quick Reference: ITR Form Selector

| Form | Who Should Use It | Key Income Types |
|---|---|---|
| ITR-1 (Sahaj) | Resident individuals with simple income | Salary, one house property, other sources |
| ITR-2 | Individuals/HUFs without business income | Salary + capital gains, multiple properties, foreign income |
| ITR-3 | Individuals/HUFs with business/profession income | Business profits + all other income |
| ITR-4 (Sugam) | Individuals/HUFs/Firms on presumptive taxation | Business income under 44AD/44ADA/44AE |
| ITR-5 | Firms, LLPs, AOPs, BOIs | Business and professional income |
| ITR-6 | Companies (except Section 11 exemption) | All company income |
| ITR-7 | Trusts, political parties, research institutions | Exempt entity income |

---

## ITR-1 (Sahaj) — For Simple Salaried Taxpayers

**Who can file ITR-1?**

ITR-1 is the simplest form, designed for resident individuals whose total income does not exceed **₹50 lakh** and comes only from:
- **Salary or pension** from one employer
- **One house property** (self-occupied or let out — but no brought-forward loss)
- **Other sources**: Savings account interest, FD interest, family pension, dividends
- Agricultural income up to **₹5,000**

**Who CANNOT use ITR-1?**
- Non-Resident Indians (NRIs) — they must use ITR-2
- Individuals who are directors of a company
- Those who have invested in unlisted equity shares
- Those with foreign assets or income
- Those with capital gains of any kind
- Those with more than one house property
- Those with business or professional income
- Those with total income above ₹50 lakh

---

## ITR-2 — For Those With Capital Gains or Multiple Properties

**Who should file ITR-2?**

ITR-2 is for individuals and HUFs who have income from:
- **Salary/pension** (any amount)
- **Two or more house properties**
- **Capital gains** (short-term or long-term, from stocks, mutual funds, property, etc.)
- **Foreign income or assets**
- **Dividend income** (any amount)
- Income from outside India
- Being a **director** in a company or holding **unlisted equity shares**
- Agricultural income exceeding ₹5,000

**ITR-2 does NOT cover** business or professional income. If you have that, move to ITR-3 or ITR-4.

> **Common Scenario:** A salaried professional who also trades in stocks and earns capital gains should file ITR-2, not ITR-1.

---

## ITR-3 — For Business Owners and Professionals

**Who should file ITR-3?**

ITR-3 is for individuals and HUFs who earn income from:
- **Proprietary business** (any trade, commerce, or profession)
- **Professional practice** (doctors, lawyers, architects, consultants etc. not under presumptive scheme)
- **Partner's salary/interest from a partnership firm**
- Any income also covered under ITR-1 or ITR-2

ITR-3 is the most comprehensive form for individuals. It requires a full **P&L account and balance sheet** if turnover exceeds ₹25 lakh (for professionals) or ₹2.5 crore (for businesses).

---

## ITR-4 (Sugam) — For Presumptive Taxation Filers

**Who should file ITR-4?**

ITR-4 is for resident individuals, HUFs, and firms (other than LLPs) who opt for the **presumptive taxation scheme**:

| Section | Applicable To | Presumptive Income |
|---|---|---|
| **44AD** | Small businesses with turnover up to ₹3 crore (digital receipts) or ₹2 crore (cash) | 8% or 6% of turnover |
| **44ADA** | Professionals (doctors, CAs, lawyers etc.) with receipts up to ₹75 lakh | 50% of gross receipts |
| **44AE** | Transport operators with up to 10 goods vehicles | Fixed amount per vehicle per month |

Under presumptive taxation, you declare a deemed profit without maintaining detailed books of accounts.

**Who CANNOT use ITR-4?**
- Those with income above ₹50 lakh (individuals)
- Those with capital gains
- Those with foreign assets or directorship in a company
- Those with more than one house property

---

## ITR-5 — For Firms, LLPs, and Other Associations

**Who should file ITR-5?**

- Partnership Firms
- Limited Liability Partnerships (LLPs)
- Association of Persons (AOPs)
- Body of Individuals (BOIs)
- Artificial Juridical Persons
- Cooperative societies
- Local authorities

Note: Individual partners do NOT use ITR-5 — they use ITR-3 to report their share of partnership income.

---

## ITR-6 — For Companies

**Who should file ITR-6?**

All companies incorporated under the **Companies Act**, except those that claim exemption under **Section 11** (income from property held for charitable or religious purposes). This includes:
- Private Limited Companies
- Public Limited Companies
- One Person Companies (OPCs)

Companies claiming Section 11 exemption should file **ITR-7** instead.

---

## ITR-7 — For Trusts, NGOs, and Political Parties

**Who should file ITR-7?**

Entities that are required to file returns under specific sections:
- **Section 139(4A)**: Charitable and religious trusts
- **Section 139(4B)**: Political parties
- **Section 139(4C)**: Scientific research associations, news agencies, educational institutions with Section 10 exemptions
- **Section 139(4D)**: Universities, colleges, and institutions under Section 35

---

## Frequently Asked Questions

**Q: I am salaried and also earned ₹5,000 from a YouTube channel. Which form?**
If the YouTube income is classified as business/professional income, use ITR-3. If it is very small and can be reported under "other sources," discuss this with a CA as the Income Tax Department may question the classification.

**Q: I am a freelancer working from home. Which ITR form do I use?**
If you opt for the presumptive scheme under 44ADA (gross receipts ≤ ₹75 lakh), use **ITR-4**. Otherwise, use **ITR-3** with proper books.

**Q: My employer deducted TDS and I have no other income. Can I still file ITR-1?**
Yes, provided your income is only from salary, one house property, and other sources — and the total does not exceed ₹50 lakh.

**Q: I sold shares during the year. Can I use ITR-1?**
No. Any capital gains (even a small amount) disqualify you from ITR-1. Use **ITR-2** instead.`,
    },

    // ─── 4. Section 80C and 80D Deductions ───────────────────────────────
    {
      title: "Section 80C and 80D Deductions: The Complete Guide for FY 2025-26",
      slug: "section-80c-80d-deductions-complete-guide",
      excerpt:
        "Maximize your tax savings with a complete guide to Section 80C and 80D deductions — eligible investments, limits, sub-limits, and exactly how to claim them in your ITR for FY 2025-26.",
      featuredImage: "💰",
      readTime: "11 min read",
      tags: JSON.stringify(["Section 80C", "Section 80D", "Tax Deductions", "Tax Savings", "FY 2025-26", "PPF", "ELSS"]),
      content: `## Overview: What Are Tax Deductions?

Tax deductions reduce your **taxable income**, which in turn reduces the amount of tax you owe. Under the **Old Tax Regime**, deductions are the primary tool for tax planning. The two most widely used deduction sections are:

- **Section 80C** — for savings and investments (up to ₹1,50,000 per year)
- **Section 80D** — for health insurance premiums

> **Important:** Deductions under Chapter VI-A (which includes 80C and 80D) are available **only under the Old Tax Regime**. If you have opted for the New Tax Regime, you cannot claim these deductions.

---

## Section 80C: The Most Popular Tax Saver

### What Is Section 80C?

Section 80C of the Income Tax Act allows individual taxpayers and HUFs to deduct up to **₹1,50,000** per financial year from their gross total income for specified investments and expenditures. This is a combined limit — it is not ₹1.5 lakh for each item listed below, but ₹1.5 lakh in total across all eligible options.

### Eligible Investments and Expenditures Under 80C

**Investment-Based (Long-Term Savings)**

| Investment | Lock-in Period | Returns | Notes |
|---|---|---|---|
| Public Provident Fund (PPF) | 15 years | ~7.1% p.a. (tax-free) | Government-backed, safest option |
| Employee Provident Fund (EPF) | Till retirement | ~8.25% p.a. | Employee contribution qualifies |
| National Pension System (NPS) | Till age 60 | Market-linked | Additional ₹50K under 80CCD(1B) |
| National Savings Certificate (NSC) | 5 years | ~7.7% p.a. | Post office scheme, interest taxable |
| Sukanya Samriddhi Yojana (SSY) | Till daughter turns 21 | ~8.2% p.a. | Only for girl child below 10 years |
| Senior Citizens Savings Scheme (SCSS) | 5 years | ~8.2% p.a. | For individuals aged 60+ |
| 5-Year Tax Saving FD | 5 years | 6.5%–7.5% p.a. | Premature withdrawal not allowed |
| Equity Linked Saving Scheme (ELSS) | 3 years (shortest) | Market-linked | Potential for highest returns; LTCG tax applies |

**Expenditure-Based**

| Expenditure | Details |
|---|---|
| Life Insurance Premium | For self, spouse, and children; sum assured must be ≥ 10× premium |
| Home Loan Principal Repayment | Principal portion of EMI on a housing loan (not interest — that is Section 24) |
| Children's Tuition Fees | School/college fees for up to 2 children; full-time education only |
| Stamp Duty and Registration Charges | For purchase of house property (can be claimed only in the year paid) |
| Unit Linked Insurance Plans (ULIPs) | Premium paid for ULIPs |

### Additional Deduction Under 80CCD(1B) — NPS

Over and above the ₹1.5 lakh 80C limit, you can claim an **additional deduction of ₹50,000** for contributions to the National Pension System (NPS) under Section **80CCD(1B)**. This brings your potential total deduction to **₹2 lakh** through 80C + NPS.

### Strategy: How to Optimise Your 80C

1. **Start with EPF** — Your mandatory EPF contribution already counts toward 80C. Check your salary slip first.
2. **Fill the gap with PPF** — Safe, tax-free returns, flexible contributions.
3. **Consider ELSS** for the growth potential — shortest lock-in (3 years) among all 80C options, with equity returns.
4. **Do not over-invest just for 80C** — Avoid locking money in low-yield products (like NSC or LIC endowment) solely to save tax. Compare post-tax returns.

---

## Section 80D: Health Insurance Deductions

### What Is Section 80D?

Section 80D allows deduction for **premiums paid on health (medical) insurance policies**. With rising healthcare costs, this section incentivises taxpayers to maintain adequate health coverage.

### Deduction Limits Under Section 80D

| Who Is Covered | Maximum Deduction |
|---|---|
| Self, spouse, and dependent children | ₹25,000 |
| Parents (below 60 years) | ₹25,000 |
| Parents (senior citizens, 60+) | ₹50,000 |
| Self (senior citizen, 60+) | ₹50,000 |

**The maximum possible deduction under 80D in a single year:**
- If you are below 60 and parents are senior citizens: ₹25,000 + ₹50,000 = **₹75,000**
- If both you and your parents are senior citizens: ₹50,000 + ₹50,000 = **₹1,00,000**

### What Is Eligible Under Section 80D?

**Health insurance premiums** paid for:
- Individual health insurance policies
- Family floater policies
- Critical illness cover
- Top-up and super top-up plans

**Preventive health check-ups** (included within the overall limit):
- Up to **₹5,000** per year for self, spouse, children, and parents
- This can be paid in cash (unlike insurance premiums, which must be paid via cheque/card/digital mode)

**What is NOT eligible under 80D:**
- Group health insurance paid entirely by the employer (no out-of-pocket cost to you)
- Cash payments for health insurance premiums (except preventive health check-ups)
- Premiums paid for siblings or other relatives (only spouse, children, and parents are eligible)

### Section 80D for Senior Citizen Parents Without Insurance

If your parents are senior citizens (60+) and **do not have a health insurance policy**, you can claim a deduction of up to **₹50,000** for **medical expenses actually incurred** on their treatment. This is particularly useful if insuring elderly parents is difficult or prohibitively expensive.

---

## Other Related Deductions You Should Know

### 80E — Education Loan Interest
- Deduction on interest paid on an education loan taken for higher studies
- **No upper limit** on the deduction amount
- Available for a **maximum of 8 consecutive years** starting from the year repayment begins
- Loan must be taken from a financial institution or approved charitable institution (not from family)

### 80G — Donations to Charitable Institutions
- Donations to approved funds (PM Relief Fund, National Defence Fund) are eligible for **100% deduction**
- Donations to other approved institutions may be eligible for **50% deduction**
- Some donations have a qualifying limit (10% of adjusted gross total income)
- Cash donations above **₹2,000** are not eligible

### 80TTA and 80TTB — Interest on Deposits
- **80TTA**: Deduction up to **₹10,000** on savings account interest for individuals below 60
- **80TTB**: Deduction up to **₹50,000** on all interest income (savings account + FD) for **senior citizens** — replaces 80TTA for those above 60

---

## How to Claim These Deductions in Your ITR

1. **Keep all documents** — premium receipts, investment proofs, passbook entries
2. **Submit Form 12BB to your employer** — this is the investment declaration form employers use for TDS computation. Submit it at the start of the year and provide actual proofs before March 31
3. **In ITR**: Navigate to the **Deductions** section and enter the amounts under the corresponding section heads
4. **Cross-check with AIS**: Your tax-saving investment data may be pre-filled from AIS; verify it matches your records

---

## Frequently Asked Questions

**Q: Can I claim 80C for my spouse's PPF contribution?**
No. You can only claim 80C for contributions you make to your own PPF account, or for life insurance premiums you pay for your spouse.

**Q: I invested ₹2 lakh in ELSS. Can I claim the full ₹2 lakh under 80C?**
No. The 80C limit is capped at ₹1.5 lakh regardless of how much you invest. You cannot claim the excess ₹50,000 under 80C.

**Q: Is the employer's contribution to NPS tax-free?**
Yes. The employer's contribution to NPS (up to 10% of salary) is deductible under Section 80CCD(2), which has no cap and is available under both the Old and New Tax Regime.

**Q: Can I claim 80D for my sibling's health insurance?**
No. Section 80D only covers premiums paid for yourself, your spouse, dependent children, and your parents.`,
    },

    // ─── 5. PF Balance Check ─────────────────────────────────────────────
    {
      title: "PF Balance Check: 5 Ways to Check Your EPF Balance Online (2025)",
      slug: "pf-balance-check-epf-online-methods",
      excerpt:
        "Learn how to check your EPF (Provident Fund) balance in 2025 using the EPFO portal, UMANG app, missed call service, SMS, and passbook — with step-by-step instructions for each method.",
      featuredImage: "📱",
      readTime: "8 min read",
      tags: JSON.stringify(["PF Balance", "EPF Balance Check", "EPFO", "UMANG App", "Provident Fund", "UAN"]),
      content: `## What Is EPF and Why Check Your Balance?

The **Employee Provident Fund (EPF)** is a retirement savings scheme managed by the **Employees' Provident Fund Organisation (EPFO)** under the Ministry of Labour and Employment. Both you (employee) and your employer contribute **12% of your basic salary + DA** to your EPF account every month.

Regularly checking your EPF balance is important to:
- Verify that your employer is actually depositing contributions every month
- Track your retirement corpus growth
- Plan withdrawals for specific needs (home purchase, medical emergency, education)
- Spot errors or missing credits before they become difficult to rectify

---

## What You Need Before Checking Your PF Balance

### UAN (Universal Account Number)
Your **UAN** is a 12-digit number allotted by EPFO that stays with you across all employers throughout your career. You can find your UAN on your:
- Salary slip (most employers print it here)
- Form 16 issued by your employer
- EPFO portal (by entering your PF account number)
- HR department of your current employer

### UAN Activation (One-Time)
If you have never used the EPFO portal, you need to **activate your UAN** first:
1. Go to [unifiedportal-mem.epfindia.gov.in](https://unifiedportal-mem.epfindia.gov.in)
2. Click **Activate UAN**
3. Enter your UAN, Aadhaar / PAN / member ID, date of birth, and registered mobile number
4. Verify via OTP and set a password

### KYC Seeding
For full functionality (including balance viewing), your UAN should have your **Aadhaar, PAN, and bank account** linked (KYC seeded). Your employer must approve this KYC.

---

## Method 1: EPFO Member Portal (Online)

This is the most detailed method, giving you access to your full **passbook** with month-by-month contribution history.

**Steps:**

1. Visit **[passbook.epfindia.gov.in](https://passbook.epfindia.gov.in)**
2. Click **Login for Members**
3. Enter your **UAN** and **password**
4. After login, click on **View Passbook**
5. Select your **Member ID** (if you have worked with multiple employers, each has a separate Member ID under the same UAN)
6. Your complete EPF passbook will be displayed showing:
   - Employee contribution each month
   - Employer contribution each month
   - Opening and closing balance
   - Interest credited

> **Note:** The passbook is updated with the previous year's interest around **December–January** each year. Monthly contributions may show a 2–3 month lag before appearing in the passbook.

---

## Method 2: UMANG App (Unified Mobile Application for New-age Governance)

The **UMANG app** is the most convenient mobile method and offers several EPFO services beyond just balance checks.

**Steps:**

1. **Download UMANG** from Google Play Store or Apple App Store
2. Open the app and register with your mobile number
3. On the home screen, search for **"EPFO"** or find it under the Government Services section
4. Tap on **EPFO** and then select **Employee Centric Services**
5. Choose **View Passbook**
6. Enter your **UAN** and registered mobile number
7. An **OTP** will be sent to your registered mobile
8. Enter the OTP to view your balance and passbook

**Other EPFO services available on UMANG:**
- Raise a claim (partial/full withdrawal)
- Update KYC details
- Transfer PF from old account to new employer
- Check claim status

---

## Method 3: Missed Call Service (No Internet Needed)

This is the quickest way to get your **current EPF balance** — no internet, no app needed. Just a feature phone.

**Steps:**
1. Give a **missed call** (it rings twice and disconnects automatically) to:

   **📞 011-22901406**

2. Call from the **mobile number registered with your UAN** (the number linked in the EPFO system)
3. Within a few minutes, you will receive an **SMS** from EPFO showing:
   - Your Employee Contribution
   - Employer Contribution
   - Total Balance

**Conditions:**
- UAN must be activated
- Mobile number must be registered and KYC-linked with EPFO
- Works only for the **most recent contribution data** — not a detailed passbook

---

## Method 4: SMS Service

Similar to the missed call method, you can request your balance via SMS.

**Steps:**
1. Type the following SMS:

   **EPFOHO UAN ENG**

   (Replace ENG with your preferred language code: HIN for Hindi, TAM for Tamil, BEN for Bengali, etc.)

2. Send to **7738299899**

3. Send from your EPFO-registered mobile number

4. You will receive an SMS reply with your current EPF balance details

**Language Codes:**
| Code | Language |
|---|---|
| ENG | English |
| HIN | Hindi |
| GUJ | Gujarati |
| MAR | Marathi |
| KAN | Kannada |
| TEL | Telugu |
| TAM | Tamil |
| BEN | Bengali |
| PUN | Punjabi |
| MAL | Malayalam |
| ORI | Odia |

---

## Method 5: Through the EPFO Portal's e-Passbook

The EPFO's main member portal also has an e-passbook feature — different from the passbook portal mentioned in Method 1.

**Steps:**
1. Go to **[epfindia.gov.in](https://www.epfindia.gov.in)**
2. Under **Services**, select **For Employees**
3. Click on **Member Passbook**
4. Log in with your UAN and password
5. Select the relevant **Member ID** and download your passbook as a PDF

This is especially useful for downloading a PDF copy of your passbook for submission to a bank, visa application, or loan processing.

---

## How to Check PF Balance Without UAN

If you do not know your UAN or have not activated it:

1. **Ask your HR department** — they are required to provide your UAN
2. **Use the EPFO portal**: Go to [unifiedportal-mem.epfindia.gov.in](https://unifiedportal-mem.epfindia.gov.in) → **Know Your UAN** → enter your PAN / Aadhaar / member ID to find your UAN
3. **Call EPFO helpline**: 1800-118-005 (toll-free)

---

## Understanding Your EPF Passbook

When you view your passbook, here is what the columns mean:

| Column | Meaning |
|---|---|
| Employee Share | Your 12% contribution |
| Employer Share | Employer's contribution — **3.67%** goes to EPF, **8.33%** goes to EPS (Pension Scheme) |
| VPF | Voluntary Provident Fund (if you contribute extra) |
| EDLI | Employees' Deposit Linked Insurance (usually negligible) |
| Interest | Annual interest credited on your balance |

> **Note on EPS:** The 8.33% employer contribution (on ₹15,000 ceiling = ₹1,250/month) goes to the **Employees' Pension Scheme (EPS)** — this is not shown in your EPF passbook as withdrawable balance. It is paid as a pension after retirement.

---

## EPF Interest Rate History

| Financial Year | EPF Interest Rate |
|---|---|
| FY 2024-25 | 8.25% |
| FY 2023-24 | 8.25% |
| FY 2022-23 | 8.15% |
| FY 2021-22 | 8.10% |
| FY 2020-21 | 8.50% |

---

## Frequently Asked Questions

**Q: My employer has not deposited EPF for the last 2 months. What should I do?**
Check your passbook to confirm the missing deposits. Then file a complaint with EPFO through the **EPFiGMS** portal (epfigms.gov.in) or call the helpline. Non-deposit of PF by an employer is a criminal offence under the EPF Act.

**Q: I changed jobs. How do I see all my PF accounts in one place?**
All PF accounts are linked under your single UAN. Log in to the EPFO portal and select each Member ID separately to view each employer's account. For convenience, transfer old accounts to your current employer's account using the **One Member – One EPF Account** transfer facility.

**Q: How many times can I check my balance per day?**
There is no limit on portal or app checks. The missed call service allows one balance query per day.

**Q: Is the balance shown in the passbook the amount I will receive if I withdraw?**
The withdrawable amount depends on your reason for withdrawal, years of service, and applicable rules. The passbook shows the accumulated balance. Upon resignation (after 2+ months of unemployment), you can withdraw the full EPF balance. The EPS amount follows separate rules.`,
    },
  ];

  // ─────────────────────────────────────────────
  // INSERT BLOGS
  // ─────────────────────────────────────────────
  for (const blog of taxBlogs) {
    const existing = await adminDb.collection("blog_posts").where("slug", "==", blog.slug).limit(1).get();

    if (existing.empty) {
      await adminDb.collection("blog_posts").add({
        title: blog.title,
        slug: blog.slug,
        content: blog.content,
        excerpt: blog.excerpt,
        authorId: authorId,
        categoryId: catSnapshot.empty ? Date.now() : catSnapshot.docs[0].data().id,
        status: "published",
        tags: blog.tags,
        featuredImage: blog.featuredImage,
        readTime: blog.readTime,
        createdAt: new Date(),
        publishedAt: new Date(),
      });
      console.log(`Inserted: ${blog.title}`);
    } else {
      console.log(`Skipped (exists): ${blog.title}`);
    }
  }

  console.log("Tax blog seeding complete!");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
