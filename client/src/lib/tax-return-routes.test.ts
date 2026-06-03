import express from "express";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockState = vi.hoisted(() => ({
  store: new Map<string, Map<string, Record<string, any>>>(),
  counter: 0,
}));

function collectionStore(name: string) {
  let records = mockState.store.get(name);
  if (!records) {
    records = new Map<string, Record<string, any>>();
    mockState.store.set(name, records);
  }
  return records;
}

function makeSnapshot(id: string, records: Map<string, Record<string, any>>) {
  return {
    id,
    ref: makeDocRef("", id, records),
    exists: records.has(id),
    data: () => records.get(id),
  };
}

function makeDocRef(collectionName: string, id: string, records = collectionStore(collectionName)) {
  return {
    id,
    get: async () => makeSnapshot(id, records),
    set: async (data: Record<string, any>) => {
      records.set(id, { ...data });
    },
    update: async (data: Record<string, any>) => {
      records.set(id, { ...(records.get(id) || {}), ...data });
    },
  };
}

function makeQuery(collectionName: string, clauses: Array<{ field: string; value: unknown }> = []) {
  return {
    where(field: string, op: string, value: unknown) {
      if (op !== "==") throw new Error(`Unsupported test operator ${op}`);
      return makeQuery(collectionName, [...clauses, { field, value }]);
    },
    async get() {
      const records = collectionStore(collectionName);
      const docs = Array.from(records.entries())
        .filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value))
        .map(([id]) => makeSnapshot(id, records));
      return { docs, size: docs.length, empty: docs.length === 0 };
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id?: string) => makeDocRef(name, id || `${name}_${++mockState.counter}`),
    }),
  },
}));

vi.mock("../../../server/middleware/auth.js", () => {
  const attachUser = (req: any) => {
    const userId = req.get("x-test-user-id") || "user_1";
    const role = req.get("x-test-role") || "user";
    req.auth = { userId, email: `${userId}@example.com` };
    req.user = {
      id: userId,
      role,
      email: `${userId}@example.com`,
      assignedCaId: req.get("x-test-assigned-ca-id") || null,
    };
  };

  return {
    authenticateToken: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
    requireAuth: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
    requireCA: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
  };
});

const { default: taxReturnsRouter } = await import("../../../server/routes/tax-returns.js");

function resetStore() {
  mockState.store.clear();
  mockState.counter = 0;
  process.env.PII_ENCRYPTION_KEY = "test-pii-key-for-tax-return-routes";
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data });
}

async function request(path: string, options: RequestInit = {}) {
  const app = express();
  app.use(express.json());
  app.use("/api/tax-returns", taxReturnsRouter);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const json = await response.json();
    return { response, json };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

beforeEach(resetStore);

describe("tax return routes", () => {
  it("creates a persisted draft with an automatic form recommendation", async () => {
    seed("profiles", "profile_1", {
      id: "profile_1",
      userId: "user_1",
      name: "Primary taxpayer",
    });

    const { response, json } = await request("/api/tax-returns", {
      method: "POST",
      body: JSON.stringify({
        assessmentYear: "2026-27",
        profileId: "profile_1",
        draft: {
          taxpayer: { type: "individual", residentialStatus: "resident", pan: "ABCDE1234F" },
          income: { salary: 900000, otherSources: 40000 },
          taxPaid: { tds: 65000 },
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(json.taxReturn).toMatchObject({
      id: "tax_returns_1",
      userId: "user_1",
      profileId: "profile_1",
      assessmentYear: "2026-27",
      itrType: "ITR-1",
      status: "draft",
    });
    expect(json.recommendation.form).toBe("ITR-1");
  });

  it("encrypts sensitive taxpayer fields at rest while returning editable draft data", async () => {
    const { response, json } = await request("/api/tax-returns", {
      method: "POST",
      body: JSON.stringify({
        assessmentYear: "2026-27",
        draft: {
          taxpayer: {
            type: "individual",
            residentialStatus: "resident",
            firstName: "Asha",
            lastName: "Rao",
            pan: "ABCDE1234F",
            aadhaar: "123412341234",
            bankName: "HDFC Bank",
            bankAccount: "123456789012",
            bankAccountConfirm: "123456789012",
            ifsc: "HDFC0001234",
          },
          income: { salary: 900000, otherSources: 40000 },
          deductions: { section80C: 120000, section80D: 25000 },
          taxPaid: { tds: 65000 },
        },
      }),
    });

    const stored = collectionStore("tax_returns").get("tax_returns_1");
    const storedDraft = JSON.parse(String(stored?.formData || "{}"));

    expect(response.status).toBe(200);
    expect(storedDraft.taxpayer.pan).toMatch(/^enc:v1:/);
    expect(storedDraft.taxpayer.aadhaar).toMatch(/^enc:v1:/);
    expect(storedDraft.taxpayer.bankAccount).toMatch(/^enc:v1:/);
    expect(storedDraft.taxpayer.bankAccountConfirm).toMatch(/^enc:v1:/);
    expect(json.taxReturn.formData.taxpayer.pan).toBe("ABCDE1234F");
    expect(json.taxReturn.formData.taxpayer.aadhaar).toBe("123412341234");
    expect(json.taxReturn.formData.taxpayer.bankAccount).toBe("123456789012");
    expect(json.taxReturn.calculatedTax.status).toBe("computed");
    expect(json.taxReturn.calculatedTax.refundDue).toBe(65000);
  });

  it("blocks profile links that belong to another user", async () => {
    seed("profiles", "profile_2", {
      id: "profile_2",
      userId: "user_2",
      name: "Other client profile",
    });

    const { response, json } = await request("/api/tax-returns", {
      method: "POST",
      body: JSON.stringify({
        assessmentYear: "2026-27",
        profileId: "profile_2",
        draft: { income: { salary: 900000 } },
      }),
    });

    expect(response.status).toBe(400);
    expect(json.error).toContain("Linked profile does not belong to this user");
  });

  it("blocks profile ownership changes through the draft update route", async () => {
    seed("profiles", "profile_2", {
      id: "profile_2",
      userId: "user_2",
      name: "Other client profile",
    });
    seed("tax_returns", "return_1", {
      id: "return_1",
      userId: "user_1",
      assessmentYear: "2026-27",
      status: "draft",
      formData: JSON.stringify({ income: { salary: 900000 } }),
    });

    const { response, json } = await request("/api/tax-returns/return_1", {
      method: "PATCH",
      body: JSON.stringify({ profileId: "profile_2" }),
    });

    expect(response.status).toBe(400);
    expect(json.error).toContain("Linked profile does not belong to this user");
  });

  it("blocks cross-user draft access while allowing an assigned CA through review endpoints", async () => {
    seed("users", "user_2", { id: "user_2", assignedCaId: "ca_1" });
    seed("tax_returns", "return_2", {
      id: "return_2",
      userId: "user_2",
      assessmentYear: "2026-27",
      status: "ready_for_review",
      formData: JSON.stringify({ income: { salary: 500000 } }),
    });

    const denied = await request("/api/tax-returns/return_2", {
      headers: { "x-test-user-id": "user_1" },
    });
    const caDraftDenied = await request("/api/tax-returns/return_2", {
      headers: { "x-test-user-id": "ca_1", "x-test-role": "ca" },
    });
    const caAllowed = await request("/api/tax-returns/return_2/review-packet", {
      headers: { "x-test-user-id": "ca_1", "x-test-role": "ca" },
    });

    expect(denied.response.status).toBe(404);
    expect(caDraftDenied.response.status).toBe(404);
    expect(caAllowed.response.status).toBe(200);
    expect(caAllowed.json.reviewPacket.taxReturnId).toBe("return_2");
  });

  it("links an existing vault document to a tax-return checklist item", async () => {
    seed("tax_returns", "return_1", {
      id: "return_1",
      userId: "user_1",
      assessmentYear: "2026-27",
      status: "draft",
      formData: JSON.stringify({
        taxpayer: { type: "individual", residentialStatus: "resident" },
        income: { salary: 900000 },
      }),
    });
    seed("documents", "doc_1", {
      id: "doc_1",
      userId: "user_1",
      name: "Form 16 FY 2025-26",
      status: "active",
    });

    const { response, json } = await request("/api/tax-returns/return_1/documents", {
      method: "POST",
      body: JSON.stringify({ documentId: "doc_1", checklistItemId: "form16" }),
    });

    expect(response.status).toBe(200);
    expect(json.taxReturn.formData.documents.form16).toBe("doc_1");
    expect(collectionStore("documents").get("doc_1")?.taxReturnId).toBe("return_1");
  });

  it("submits a draft for CA review and stores the review packet snapshot", async () => {
    seed("tax_returns", "return_1", {
      id: "return_1",
      userId: "user_1",
      assessmentYear: "2026-27",
      status: "draft",
      formData: JSON.stringify({
        taxpayer: { type: "individual", residentialStatus: "resident" },
        income: { salary: 900000, otherSources: 40000 },
        taxPaid: { tds: 65000 },
      }),
    });

    const { response, json } = await request("/api/tax-returns/return_1/submit-review", {
      method: "POST",
    });

    expect(response.status).toBe(200);
    expect(json.taxReturn.status).toBe("ready_for_review");
    expect(json.reviewPacket.recommendation.form).toBe("ITR-1");
    expect(json.reviewPacket.summary.totalIncome).toBe(940000);
  });

  it("keeps lifecycle status changes out of the owner draft update route", async () => {
    seed("tax_returns", "return_1", {
      id: "return_1",
      userId: "user_1",
      assessmentYear: "2026-27",
      status: "draft",
      reviewStatus: "draft",
      formData: JSON.stringify({
        taxpayer: { type: "individual", residentialStatus: "resident" },
        income: { salary: 900000 },
      }),
    });

    const { response, json } = await request("/api/tax-returns/return_1", {
      method: "PATCH",
      body: JSON.stringify({
        status: "filed",
        draft: { income: { salary: 950000 } },
      }),
    });

    expect(response.status).toBe(200);
    expect(json.taxReturn.status).toBe("draft");
    expect(json.taxReturn.reviewStatus).toBe("draft");
    expect(json.taxReturn.formData.income.salary).toBe(950000);
  });

  it("allows an assigned CA to update review lifecycle status but blocks regular users", async () => {
    seed("users", "user_2", { id: "user_2", assignedCaId: "ca_1" });
    seed("tax_returns", "return_4", {
      id: "return_4",
      userId: "user_2",
      assessmentYear: "2026-27",
      status: "ready_for_review",
      reviewStatus: "ready_for_review",
      formData: JSON.stringify({
        taxpayer: { type: "individual", residentialStatus: "resident" },
        income: { salary: 900000 },
      }),
    });

    const userDenied = await request("/api/tax-returns/return_4/review-status", {
      method: "PATCH",
      headers: { "x-test-user-id": "user_2" },
      body: JSON.stringify({ status: "approved_for_filing" }),
    });
    const caAllowed = await request("/api/tax-returns/return_4/review-status", {
      method: "PATCH",
      headers: { "x-test-user-id": "ca_1", "x-test-role": "ca" },
      body: JSON.stringify({ status: "approved_for_filing", notes: "Ready for portal filing." }),
    });

    expect(userDenied.response.status).toBe(403);
    expect(caAllowed.response.status).toBe(200);
    expect(caAllowed.json.taxReturn.status).toBe("approved_for_filing");
    expect(collectionStore("tax_returns").get("return_4")?.reviewStatusHistory).toHaveLength(1);
  });

  it("returns a disabled export status for ITR-3 until the AY 2026-27 schema is synced", async () => {
    seed("tax_returns", "return_3", {
      id: "return_3",
      userId: "user_1",
      assessmentYear: "2026-27",
      status: "draft",
      formData: JSON.stringify({
        taxpayer: { type: "huf", residentialStatus: "resident" },
        income: { businessIncome: 1200000, presumptiveScheme: "none" },
      }),
    });

    const { response, json } = await request("/api/tax-returns/return_3/export-json");

    expect(response.status).toBe(200);
    expect(json.available).toBe(false);
    expect(json.form).toBe("ITR-3");
    expect(json.reason).toContain("ITR-3 AY 2026-27 schema is not synced");
  });
});
