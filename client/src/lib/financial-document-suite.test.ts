import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import generatorRegistry from "@/data/generator-registry.json";
import { loadDocumentGenerator } from "@/pages/documents/generators";
import {
  FINANCIAL_DOCUMENT_KINDS,
  calculateFinancialRatios,
  calculateIndianDocumentTotals,
  convertFinancialDocument,
  formatIndianCurrency,
  indianAmountInWords,
} from "@/pages/documents/financial";

const routesSource = readFileSync("client/src/Routes.tsx", "utf8");
const generatorPageSource = readFileSync("client/src/pages/documents/generator.page.tsx", "utf8");
const seoPublicSource = readFileSync("shared/seo-public.ts", "utf8");
const workspaceRoutesSource = readFileSync(
  "client/src/routes/registry/workspace-routes.ts",
  "utf8",
);

describe("Indian financial document suite", () => {
  it("advertises and loads every planned financial generator", async () => {
    const advertisedIds = new Set(generatorRegistry.generators.map((entry) => entry.id));

    for (const id of FINANCIAL_DOCUMENT_KINDS) {
      expect(advertisedIds.has(id), id).toBe(true);
      const generator = await loadDocumentGenerator(id);
      expect(generator, id).not.toBeNull();
      const html = generator?.generateHTML(generator.defaultValues) || "";
      expect(html, id).not.toMatch(/\bNaN\b|Invalid Date|<script/i);
    }
  });

  it("calculates Indian GST totals with discounts, cess, rounding, and interstate tax", () => {
    const totals = calculateIndianDocumentTotals({
      supplierStateCode: "27",
      placeOfSupplyStateCode: "29",
      roundOff: true,
      items: [
        {
          description: "Consulting",
          quantity: 2,
          rate: 1000,
          discountType: "percentage",
          discountValue: 10,
          taxTreatment: "taxable",
          gstRate: 18,
          cessRate: 1,
        },
        {
          description: "Exempt item",
          quantity: 1,
          rate: 500,
          discountType: "amount",
          discountValue: 0,
          taxTreatment: "exempt",
          gstRate: 18,
          cessRate: 0,
        },
      ],
    });

    expect(totals.subtotal).toBe(2500);
    expect(totals.discountTotal).toBe(200);
    expect(totals.taxableValue).toBe(1800);
    expect(totals.igst).toBe(324);
    expect(totals.cgst).toBe(0);
    expect(totals.sgst).toBe(0);
    expect(totals.cess).toBe(18);
    expect(totals.grandTotal).toBe(2642);
  });

  it("formats INR and Indian amount-in-words", () => {
    expect(formatIndianCurrency(1234567.5)).toBe("₹12,34,567.50");
    expect(indianAmountInWords(1234567.5)).toBe(
      "Rupees Twelve Lakh Thirty Four Thousand Five Hundred Sixty Seven and Fifty Paise Only",
    );
    expect(indianAmountInWords(1.999)).toBe("Rupees Two Only");
  });

  it("validates Indian party pincodes and escapes user-controlled preview HTML", async () => {
    const generator = await loadDocumentGenerator("gst-quotation");
    const data = structuredClone(generator?.defaultValues || {});
    const validParty = {
      name: "Example Business",
      address: "Example business address",
      pincode: "400001",
      stateCode: "27",
      gstin: "",
      pan: "",
      email: "",
      phone: "",
    };
    data.firstParty = { ...validParty, name: '<img src=x onerror="alert(1)">' };
    data.secondParty = validParty;
    data.items[0].description = "<script>alert(1)</script>";
    data.details.validUntil = "2026-07-10";

    expect(generator?.schema.safeParse(data).success).toBe(true);
    expect(generator?.generateHTML(data)).not.toMatch(/<script|<img/i);
    expect(generator?.generateHTML(data)).toContain("&lt;script&gt;");

    data.firstParty.pincode = "012345";
    expect(generator?.schema.safeParse(data).success).toBe(false);
  });

  it("uses receipt amounts and reimbursement deductions in final document totals", async () => {
    const receipt = await loadDocumentGenerator("payment-receipt");
    const receiptData = structuredClone(receipt?.defaultValues || {});
    receiptData.details.amountReceived = 12500;
    expect(receipt?.generateHTML(receiptData)).toContain("Amount received");
    expect(receipt?.generateHTML(receiptData)).toContain("12,500.00");

    const reimbursement = await loadDocumentGenerator("expense-reimbursement");
    const reimbursementData = structuredClone(reimbursement?.defaultValues || {});
    reimbursementData.items[0].description = "Client travel";
    reimbursementData.items[0].rate = 10000;
    reimbursementData.details.nonReimbursableDeductions = 1500;
    const reimbursementHtml = reimbursement?.generateHTML(reimbursementData) || "";
    expect(reimbursementHtml).toContain("Reimbursable total");
    expect(reimbursementHtml).toContain("8,500.00");
  });

  it("converts only compatible fields and retains the source reference", () => {
    const converted = convertFinancialDocument(
      {
        version: 1,
        id: "quote-1",
        kind: "gst-quotation",
        sourceDocumentId: null,
        parties: {
          supplier: { name: "Seller", stateCode: "27" },
          customer: { name: "Buyer", stateCode: "29" },
        },
        items: [
          {
            description: "Service",
            quantity: 1,
            rate: 1000,
            taxTreatment: "taxable",
            gstRate: 18,
          },
        ],
        taxTreatment: { placeOfSupplyStateCode: "29", roundOff: true },
        terms: "Valid for 15 days",
        content: { privateNote: "must not copy", quotationNumber: "Q-1" },
        createdAt: "2026-06-10T00:00:00.000Z",
        updatedAt: "2026-06-10T00:00:00.000Z",
      },
      "proforma-invoice",
    );

    expect(converted.kind).toBe("proforma-invoice");
    expect(converted.sourceDocumentId).toBe("quote-1");
    expect(converted.parties.customer?.name).toBe("Buyer");
    expect(converted.items).toHaveLength(1);
    expect(converted.content).not.toHaveProperty("privateNote");
  });

  it("calculates bank-oriented financial ratios without inventing a balancing figure", () => {
    expect(
      calculateFinancialRatios({
        currentAssets: 500000,
        currentLiabilities: 250000,
        totalDebt: 300000,
        equity: 600000,
        assets: 900000,
        liabilitiesAndEquity: 900000,
        cashAvailableForDebtService: 240000,
        debtService: 200000,
      }),
    ).toEqual({
      workingCapital: 250000,
      currentRatio: 2,
      debtEquityRatio: 0.5,
      balanceDifference: 0,
      dscr: 1.2,
    });
  });

  it("makes previews public while keeping export and save behind authentication", () => {
    expect(routesSource).toContain(
      '<Route path="/documents/generator" component={DocumentGeneratorRegistry} />',
    );
    expect(routesSource).toContain(
      '<Route path="/documents/generator/:type" component={DocumentGeneratorPage} />',
    );
    expect(generatorPageSource).toContain("requireAuthenticatedGeneratorAction");
    expect(generatorPageSource).toContain("sessionStorage");
    expect(generatorPageSource).not.toContain("value=\"docx\"");
  });

  it("moves generator routes into the public indexable route surface", () => {
    expect(workspaceRoutesSource).not.toContain('route("/documents/generator"');
    expect(seoPublicSource).not.toContain('"/documents/generator",\n  "/documents/generator_page"');

    for (const id of FINANCIAL_DOCUMENT_KINDS) {
      expect(seoPublicSource).toContain(`"/documents/generator/${id}"`);
    }
  });
});
