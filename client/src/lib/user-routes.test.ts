import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  const ref = makeDocRef("", id, records);
  return {
    id,
    ref,
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
      return { docs, size: docs.length };
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id?: string) => makeDocRef(name, id || `${name}_${++mockState.counter}`),
      add: async (data: Record<string, any>) => {
        const id = `${name}_${++mockState.counter}`;
        const records = collectionStore(name);
        records.set(id, { ...data });
        return makeDocRef(name, id, records);
      },
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
      email: `${userId}@example.com`,
      firstName: "Test",
      lastName: "User",
      role,
      assignedCaId: "ca_1",
    };
  };

  return {
    optionalAuth: (req: any, _res: any, next: any) => {
      if (req.get("x-test-user-id")) attachUser(req);
      next();
    },
    requireAuth: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
    requireAdmin: (_req: any, _res: any, next: any) => {
      next();
    },
    requireCA: (_req: any, _res: any, next: any) => {
      next();
    },
    requireAnyAuth: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
  };
});

const { default: userRouter } = await import("../../../server/routes/user.js");
const { default: adminRouter } = await import("../../../server/routes/admin.js");
const { default: caRouter } = await import("../../../server/routes/ca.js");

function resetStore() {
  mockState.store.clear();
  mockState.counter = 0;
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data });
}

function readCollection(collection: string) {
  return Array.from(collectionStore(collection).entries()).map(([id, data]) => ({ id, ...data }));
}

async function request(path: string, options: RequestInit = {}) {
  const app = express();
  app.use(express.json());
  app.use("/api", userRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/ca", caRouter);

  const server = app.listen(0, "127.0.0.1");
  await new Promise<void>((resolve) => server.once("listening", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Unable to start test server");

  try {
    const isFormData = (options.body as any)?.constructor?.name === "FormData";
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });
    const raw = await response.text();
    const json = raw ? JSON.parse(raw) : {};
    return { response, json };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

beforeEach(resetStore);
afterEach(() => {
  vi.clearAllMocks();
});

describe("user service routes", () => {
  it("derives dashboard pending tasks and recent activity from real records", async () => {
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceId: "itr-filing",
      serviceTitle: "ITR Filing",
      serviceCategory: "Tax",
      status: "pending",
      paymentStatus: "pending",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T09:00:00.000Z"),
      metadata: {},
    });
    seed("user_services", "service_2", {
      userId: "user_1",
      serviceId: "gst-returns",
      serviceTitle: "GST Returns",
      serviceCategory: "GST",
      status: "completed",
      paymentStatus: "paid",
      createdAt: new Date("2026-05-14T08:00:00.000Z"),
      updatedAt: new Date("2026-05-14T09:00:00.000Z"),
      metadata: {},
    });
    seed("tax_returns", "return_1", {
      userId: "user_1",
      status: "draft",
      createdAt: new Date("2026-05-13T08:00:00.000Z"),
      updatedAt: new Date("2026-05-13T09:00:00.000Z"),
    });
    seed("documents", "doc_1", {
      userId: "user_1",
      status: "active",
    });
    seed("profiles", "profile_1", {
      userId: "user_1",
    });

    const { response, json } = await request("/api/user/dashboard");

    expect(response.status).toBe(200);
    expect(json.stats).toMatchObject({
      totalReturns: 1,
      documentsUploaded: 1,
      profiles: 1,
      pendingTasks: 2,
    });
    expect(json.recentActivity).toHaveLength(3);
    expect(json.recentActivity[0]).toMatchObject({
      id: "service-service_1",
      type: "service",
    });
    expect(json.recentActivity.map((entry: any) => entry.action)).not.toContain("Logged in");
    expect(json.recentActivity.map((entry: any) => entry.action)).not.toContain("Viewed dashboard");
  });

  it("creates a signed-in service request with dashboard metadata", async () => {
    const { response, json } = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "itr-filing",
        serviceTitle: "ITR Filing",
        serviceCategory: "Tax Filing",
        metadata: {
          requestDescription: "Need help filing return",
          source: "dashboard_services",
          requestedAt: "2026-05-15T12:00:00.000Z",
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.service).toMatchObject({
      id: "user_services_1",
      userId: "user_1",
      serviceId: "itr-filing",
      serviceTitle: "ITR Filing",
      serviceCategory: "Tax Filing",
      status: "pending",
      assignedCaId: "ca_1",
    });
    expect(json.service.metadata).toMatchObject({
      source: "dashboard_services",
      requestDescription: "Need help filing return",
    });
  });

  it("rejects user-submitted operational service state", async () => {
    const { response, json } = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "itr-filing",
        serviceTitle: "ITR Filing",
        serviceCategory: "Tax Filing",
        paymentAmount: 5000,
        paymentStatus: "paid",
        status: "completed",
        assignedCaId: "ca_attacker",
      }),
    });

    expect(response.status).toBe(400);
    expect(json.error).toBe("Validation failed");
    expect(json.details[0].message).toContain("paymentStatus");
    expect(json.details[0].message).toContain("status");
    expect(json.details[0].message).toContain("assignedCaId");
    expect(readCollection("user_services")).toHaveLength(0);
  });

  it("rejects operational metadata during service request creation", async () => {
    const rejected = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "itr-filing",
        serviceTitle: "ITR Filing",
        serviceCategory: "Tax Filing",
        metadata: {
          requestDescription: "Need help filing return",
          assignedCaName: "Spoofed CA",
          paymentLink: "https://pay.example.com/tampered",
        },
      }),
    });

    expect(rejected.response.status).toBe(400);

    const accepted = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "gst-returns",
        serviceTitle: "GST Returns",
        serviceCategory: "GST",
        metadata: {
          businessName: "Asha Traders",
          contactNumber: "9999999999",
        },
      }),
    });

    expect(accepted.response.status).toBe(200);
    expect(accepted.json.service.metadata).toMatchObject({
      businessName: "Asha Traders",
      contactNumber: "9999999999",
    });
  });

  it("allows access only to the signed-in user's service case", async () => {
    seed("user_services", "owned_service", {
      userId: "user_1",
      serviceId: "gst-returns",
      serviceTitle: "GST Returns",
      serviceCategory: "GST",
      status: "in_progress",
      metadata: {},
    });
    seed("user_services", "other_service", {
      userId: "user_2",
      serviceId: "itr-filing",
      serviceTitle: "ITR Filing",
      serviceCategory: "Tax",
      status: "pending",
      metadata: {},
    });

    const owned = await request("/api/user-services/owned_service");
    const other = await request("/api/user-services/other_service");

    expect(owned.response.status).toBe(200);
    expect(owned.json.service).toMatchObject({ id: "owned_service", userId: "user_1" });
    expect(other.response.status).toBe(404);
  });

  it("limits user service metadata updates to user-editable fields", async () => {
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceId: "gst-returns",
      serviceTitle: "GST Returns",
      serviceCategory: "GST",
      paymentStatus: "pending",
      metadata: {
        paymentLink: "https://pay.example.com/original",
      },
    });

    const forbidden = await request("/api/user-services/service_1", {
      method: "PATCH",
      body: JSON.stringify({
        metadata: {
          userNote: "Please call after 4 PM.",
          paymentLink: "https://pay.example.com/tampered",
        },
      }),
    });

    expect(forbidden.response.status).toBe(400);
    expect(collectionStore("user_services").get("service_1")?.metadata).toMatchObject({
      paymentLink: "https://pay.example.com/original",
    });

    const allowed = await request("/api/user-services/service_1", {
      method: "PATCH",
      body: JSON.stringify({
        metadata: {
          userNote: "Please call after 4 PM.",
        },
      }),
    });

    expect(allowed.response.status).toBe(200);
    expect(allowed.json.service.metadata).toMatchObject({
      paymentLink: "https://pay.example.com/original",
      userNote: "Please call after 4 PM.",
    });
  });

  it("validates and persists consultation requests with optional signed-in linkage", async () => {
    const invalid = await request("/api/consultation-requests", {
      method: "POST",
      body: JSON.stringify({
        name: "Asha",
        service: "GST Returns",
        message: "Need support",
      }),
    });

    expect(invalid.response.status).toBe(400);

    const valid = await request("/api/consultation-requests", {
      method: "POST",
      headers: { "x-test-user-id": "user_9" },
      body: JSON.stringify({
        name: "Asha",
        phone: "9999999999",
        email: "asha@example.com",
        service: "GST Returns",
        preferredTime: "Tomorrow morning",
        message: "Need support with GST return filing.",
      }),
    });

    expect(valid.response.status).toBe(200);
    expect(valid.json.success).toBe(true);
    expect(readCollection("consultation_requests")).toHaveLength(1);
    expect(readCollection("consultation_requests")[0]).toMatchObject({
      userId: "user_9",
      status: "new",
      service: "GST Returns",
      preferredTime: "Tomorrow morning",
    });
  });

  it("records payment-link requests and updates the linked service payment state", async () => {
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceId: "notice-compliance",
      serviceTitle: "Notice Compliance",
      serviceCategory: "Tax Notice",
      paymentAmount: 2500,
      paymentStatus: "pending",
      metadata: {},
    });

    const { response, json } = await request("/api/payments/request-link", {
      method: "POST",
      body: JSON.stringify({
        userServiceId: "service_1",
        note: "Please share a link for UPI payment.",
      }),
    });

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(readCollection("payment_link_requests")[0]).toMatchObject({
      userId: "user_1",
      userServiceId: "service_1",
      serviceTitle: "Notice Compliance",
      paymentAmount: 2500,
      status: "requested",
    });
    expect(collectionStore("user_services").get("service_1")).toMatchObject({
      paymentStatus: "link_requested",
      metadata: {
        paymentLinkRequestId: "payment_link_requests_1",
      },
    });
  });
});

describe("ITR draft and handoff routes", () => {
  const draftPayload = {
    assessmentYear: "2026-27",
    filingPath: "ca",
    recommendedForm: "ITR-2",
    sourceSelections: { salary: true, capitalGains: true },
    filingFacts: { hasDirectorStatus: false },
    profileDraft: { pan: "ABCDE1234F", mobile: "9999999999" },
    estimateSummary: { totalIncome: 1580000, estimatedPayable: 12000 },
    workspaceState: { currentStep: 1, documentFiles: { "form16-form16a": "form16.pdf" } },
    documentChecklist: [
      { id: "form16-form16a", title: "Form 16 / Form 16A", uploaded: true },
      { id: "capital-gains-reports", title: "Capital gains reports", uploaded: false },
    ],
  };

  it("saves and reloads a private MY ITR draft for the signed-in user", async () => {
    const saved = await request("/api/itr/draft", {
      method: "PUT",
      body: JSON.stringify(draftPayload),
    });

    expect(saved.response.status).toBe(200);
    expect(saved.json.draft).toMatchObject({
      userId: "user_1",
      assessmentYear: "2026-27",
      filingPath: "ca",
      recommendedForm: "ITR-2",
      status: "draft",
    });

    const loaded = await request("/api/itr/draft");

    expect(loaded.response.status).toBe(200);
    expect(loaded.json.draft).toMatchObject({
      id: saved.json.draft.id,
      userId: "user_1",
      profileDraft: { pan: "ABCDE1234F", mobile: "9999999999" },
      estimateSummary: { totalIncome: 1580000, estimatedPayable: 12000 },
      workspaceState: { currentStep: 1, documentFiles: { "form16-form16a": "form16.pdf" } },
    });
  });

  it("normalizes legacy self-filing draft input to CA-assisted filing", async () => {
    const saved = await request("/api/itr/draft", {
      method: "PUT",
      body: JSON.stringify({
        ...draftPayload,
        filingPath: "self",
        workspaceState: { ...draftPayload.workspaceState, selectedFilingPath: "self" },
      }),
    });

    expect(saved.response.status).toBe(200);
    expect(saved.json.draft).toMatchObject({
      filingPath: "ca",
      workspaceState: expect.objectContaining({ selectedFilingPath: "ca" }),
    });

    const loaded = await request("/api/itr/draft");

    expect(loaded.response.status).toBe(200);
    expect(loaded.json.draft).toMatchObject({
      filingPath: "ca",
      workspaceState: expect.objectContaining({ selectedFilingPath: "ca" }),
    });
  });

  it("submits the MY ITR draft for CA review and creates linked service and notifications", async () => {
    seed("users", "admin_1", {
      email: "admin@example.com",
      role: "admin",
      status: "active",
    });
    seed("users", "ca_1", {
      email: "ca_1@example.com",
      firstName: "Case",
      lastName: "Expert",
      role: "ca",
      status: "active",
    });

    const savedDraft = await request("/api/itr/draft", {
      method: "PUT",
      body: JSON.stringify(draftPayload),
    });
    seed("documents", "draft_doc_1", {
      userId: "user_1",
      taxReturnId: savedDraft.json.draft.id,
      name: "Form 16",
      status: "active",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
    });

    const submitted = await request("/api/itr/submit-review", {
      method: "POST",
      body: JSON.stringify({ userNote: "Please review before filing." }),
    });

    expect(submitted.response.status).toBe(200);
    expect(submitted.json.taxReturn).toMatchObject({
      userId: "user_1",
      status: "ca_review",
      filingPath: "ca",
      recommendedForm: "ITR-2",
    });
    expect(submitted.json.service).toMatchObject({
      userId: "user_1",
      serviceId: "itr-filing",
      serviceTitle: "CA ITR Filing Review",
      assignedCaId: "ca_1",
      status: "pending",
    });
    expect(submitted.json.service.metadata).toMatchObject({
      source: "itr_filing_workspace",
      userNote: "Please review before filing.",
      linkedTaxReturnId: submitted.json.taxReturn.id,
    });
    expect(collectionStore("tax_returns").get(submitted.json.taxReturn.id)).toMatchObject({
      userServiceId: submitted.json.service.id,
      submittedForReviewAt: expect.any(Date),
    });
    expect(collectionStore("documents").get("draft_doc_1")).toMatchObject({
      taxReturnId: submitted.json.taxReturn.id,
      userServiceId: submitted.json.service.id,
      serviceId: submitted.json.service.id,
    });
    expect(readCollection("notifications")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: "admin_1", title: "ITR review submitted" }),
        expect.objectContaining({ userId: "ca_1", title: "New assigned ITR case" }),
      ]),
    );
  });
});

describe("role case queues", () => {
  beforeEach(() => {
    seed("users", "user_1", {
      firstName: "Asha",
      lastName: "Shah",
      email: "asha@example.com",
      role: "user",
      assignedCaId: "ca_1",
    });
    seed("users", "user_2", {
      firstName: "Ravi",
      lastName: "Mehta",
      email: "ravi@example.com",
      role: "user",
      assignedCaId: "ca_2",
    });
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceId: "itr-filing",
      serviceTitle: "CA ITR Filing Review",
      serviceCategory: "Income Tax",
      status: "pending",
      assignedCaId: "ca_1",
      metadata: { linkedTaxReturnId: "return_1" },
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T09:00:00.000Z"),
    });
    seed("user_services", "service_2", {
      userId: "user_2",
      serviceId: "gst-returns",
      serviceTitle: "GST Returns",
      serviceCategory: "GST",
      status: "pending",
      assignedCaId: "ca_2",
      metadata: {},
      createdAt: new Date("2026-05-14T08:00:00.000Z"),
      updatedAt: new Date("2026-05-14T09:00:00.000Z"),
    });
    seed("tax_returns", "return_1", {
      userId: "user_1",
      userServiceId: "service_1",
      assessmentYear: "2026-27",
      recommendedForm: "ITR-2",
      status: "ca_review",
    });
    seed("documents", "doc_1", {
      userId: "user_1",
      userServiceId: "service_1",
      taxReturnId: "return_1",
      name: "Form 16",
      status: "active",
      createdAt: new Date("2026-05-15T10:00:00.000Z"),
    });
  });

  it("lists submitted service cases for the admin operations inbox", async () => {
    const listed = await request("/api/admin/requests/cases");

    expect(listed.response.status).toBe(200);
    expect(listed.json.cases).toHaveLength(2);
    expect(listed.json.cases[0]).toMatchObject({
      id: "service_1",
      userName: "Asha Shah",
      documentCount: 1,
      taxReturn: { id: "return_1", recommendedForm: "ITR-2" },
    });
  });

  it("lists only cases assigned to the signed-in CA", async () => {
    const listed = await request("/api/ca/cases", {
      headers: { "x-test-user-id": "ca_1", "x-test-role": "ca" },
    });

    expect(listed.response.status).toBe(200);
    expect(listed.json.data.cases).toHaveLength(1);
    expect(listed.json.data.cases[0]).toMatchObject({
      id: "service_1",
      clientName: "Asha Shah",
      documentCount: 1,
      taxReturn: { id: "return_1", assessmentYear: "2026-27" },
    });
  });
});

describe("admin request routes", () => {
  it("lists and updates consultation requests for the operations inbox", async () => {
    seed("consultation_requests", "consult_1", {
      name: "Asha",
      phone: "9999999999",
      service: "GST Returns",
      message: "Need a callback",
      status: "new",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });

    const listed = await request("/api/admin/requests/consultations?status=new");
    expect(listed.response.status).toBe(200);
    expect(listed.json.requests).toHaveLength(1);
    expect(listed.json.requests[0]).toMatchObject({ id: "consult_1", status: "new" });

    const updated = await request("/api/admin/requests/consultations/consult_1", {
      method: "PATCH",
      body: JSON.stringify({
        status: "contacted",
        internalNote: "Called once and waiting for documents.",
      }),
    });

    expect(updated.response.status).toBe(200);
    expect(updated.json.request).toMatchObject({
      id: "consult_1",
      status: "contacted",
      internalNote: "Called once and waiting for documents.",
    });
    expect(readCollection("audit_logs")).toHaveLength(1);
  });

  it("updates payment-link requests and syncs the linked service payment status", async () => {
    seed("payment_link_requests", "pay_1", {
      userId: "user_1",
      userServiceId: "service_1",
      serviceTitle: "Notice Compliance",
      paymentAmount: 2500,
      status: "requested",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceTitle: "Notice Compliance",
      paymentStatus: "link_requested",
      metadata: {},
    });

    const updated = await request("/api/admin/requests/payment-links/pay_1", {
      method: "PATCH",
      body: JSON.stringify({
        status: "link_sent",
        paymentLink: "https://pay.example.com/checkout/service-1",
        adminNote: "Shared link on WhatsApp.",
      }),
    });

    expect(updated.response.status).toBe(200);
    expect(updated.json.request).toMatchObject({
      id: "pay_1",
      status: "link_sent",
      paymentLink: "https://pay.example.com/checkout/service-1",
    });
    expect(collectionStore("user_services").get("service_1")).toMatchObject({
      paymentStatus: "link_sent",
      metadata: {
        paymentLink: "https://pay.example.com/checkout/service-1",
        paymentAdminNote: "Shared link on WhatsApp.",
      },
    });
    expect(readCollection("audit_logs")).toHaveLength(1);
  });

  it("resets linked service payment status when a sent payment link is cancelled", async () => {
    seed("payment_link_requests", "pay_1", {
      userId: "user_1",
      userServiceId: "service_1",
      serviceTitle: "Notice Compliance",
      paymentAmount: 2500,
      status: "link_sent",
      paymentLink: "https://pay.example.com/checkout/service-1",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceTitle: "Notice Compliance",
      paymentStatus: "link_sent",
      metadata: {
        paymentLink: "https://pay.example.com/checkout/service-1",
      },
    });

    const updated = await request("/api/admin/requests/payment-links/pay_1", {
      method: "PATCH",
      body: JSON.stringify({
        status: "cancelled",
        adminNote: "Cancelled because the customer requested a revised quote.",
      }),
    });

    expect(updated.response.status).toBe(200);
    expect(updated.json.request).toMatchObject({
      id: "pay_1",
      status: "cancelled",
    });
    expect(collectionStore("user_services").get("service_1")).toMatchObject({
      paymentStatus: "pending",
      metadata: {
        paymentLink: "https://pay.example.com/checkout/service-1",
        paymentAdminNote: "Cancelled because the customer requested a revised quote.",
      },
    });
  });
});
