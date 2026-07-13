import express from "express";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const ORIGINAL_PII_ENCRYPTION_KEY = process.env.PII_ENCRYPTION_KEY;

const mockState = vi.hoisted(() => ({
  store: new Map<string, Map<string, Record<string, any>>>(),
  counter: 0,
  failAdds: new Set<string>(),
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

function makeQuery(
  collectionName: string,
  clauses: Array<{ field: string; value: unknown }> = [],
  order?: { field: string; direction: "asc" | "desc" },
  maxRows?: number,
) {
  return {
    where(field: string, op: string, value: unknown) {
      if (op !== "==") throw new Error(`Unsupported test operator ${op}`);
      return makeQuery(collectionName, [...clauses, { field, value }], order, maxRows);
    },
    orderBy(field: string, direction: "asc" | "desc" = "asc") {
      return makeQuery(collectionName, clauses, { field, direction }, maxRows);
    },
    limit(limitRows: number) {
      return makeQuery(collectionName, clauses, order, limitRows);
    },
    async get() {
      const records = collectionStore(collectionName);
      let entries = Array.from(records.entries())
        .filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value));
      if (order) {
        entries = entries.sort(([, left], [, right]) => {
          const leftValue = String(left[order.field] ?? "");
          const rightValue = String(right[order.field] ?? "");
          return order.direction === "desc" ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
        });
      }
      if (maxRows) {
        entries = entries.slice(0, maxRows);
      }
      const docs = entries.map(([id]) => makeSnapshot(id, records));
      return { docs, size: docs.length };
    },
    count() {
      // Mirror the production shim's count() API: returns an object with .get() that
      // resolves to a snapshot whose .data() yields { count: <number> }.
      return {
        get: async () => {
          const records = collectionStore(collectionName);
          const count = Array.from(records.entries())
            .filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value))
            .length;
          return { data: () => ({ count }) };
        },
      };
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id?: string) => makeDocRef(name, id || `${name}_${++mockState.counter}`),
      add: async (data: Record<string, any>) => {
        if (mockState.failAdds.has(name)) {
          throw new Error(`Simulated ${name} write failure`);
        }
        const id = `${name}_${++mockState.counter}`;
        const records = collectionStore(name);
        records.set(id, { ...data });
        return makeDocRef(name, id, records);
      },
    }),
  },
}));

// Drizzle helpers in server/db/queries.ts read from the real Postgres pool. The unit
// tests run against the in-memory mock store above, so route handlers that call those
// helpers see them resolved from the same store. The helpers are mapped to the
// schema by table name so we can route them back through collectionStore().
const tableNameByRef = vi.hoisted(() => new Map<unknown, string>());
vi.mock("../../../server/db.js", () => {
  const makeStub = (collectionName: string) => {
    const ref = { __collectionName: collectionName } as const;
    tableNameByRef.set(ref, collectionName);
    return ref;
  };
  return {
    schema: {
      users: makeStub("users"),
      profiles: makeStub("profiles"),
      documents: makeStub("documents"),
      taxReturns: makeStub("tax_returns"),
      userServices: makeStub("user_services"),
      blogPosts: makeStub("blog_posts"),
      categories: makeStub("categories"),
      dailyUpdates: makeStub("daily_updates"),
      activityLogs: makeStub("activity_logs"),
      auditLogs: makeStub("audit_logs"),
      referrals: makeStub("referrals"),
      teams: makeStub("teams"),
      notifications: makeStub("notifications"),
      workflows: makeStub("workflows"),
      reports: makeStub("reports"),
      chatSessions: makeStub("chat_sessions"),
      chatMessages: makeStub("chat_messages"),
      documentDrafts: makeStub("document_drafts"),
      consultationRequests: makeStub("consultation_requests"),
      paymentLinkRequests: makeStub("payment_link_requests"),
      siteSettings: makeStub("site_settings"),
      emailTemplates: makeStub("email_templates"),
      pages: makeStub("pages"),
    },
    getDb: () => {
      throw new Error("getDb() must not be called in tests — mock server/db/queries.js instead");
    },
    getSql: () => {
      throw new Error("getSql() must not be called in tests");
    },
    getDatabaseUrl: () => null,
  };
});

vi.mock("../../../server/db/queries.js", () => ({
  countByUserAndStatus: async (table: unknown, userId: string, statuses: string[]) => {
    const collectionName = tableNameByRef.get(table);
    if (!collectionName) return 0;
    const records = collectionStore(collectionName);
    let count = 0;
    for (const data of records.values()) {
      if (data.userId === userId && statuses.includes(String(data.status))) count += 1;
    }
    return count;
  },
  countWhereEquals: async (table: unknown, field: string, value: string) => {
    const collectionName = tableNameByRef.get(table);
    if (!collectionName) return 0;
    const records = collectionStore(collectionName);
    let count = 0;
    for (const data of records.values()) {
      if (String(data[field]) === value) count += 1;
    }
    return count;
  },
  findByIdIn: async (table: unknown, ids: string[]) => {
    const collectionName = tableNameByRef.get(table);
    if (!collectionName) return [];
    const records = collectionStore(collectionName);
    return ids
      .filter((id) => records.has(id))
      .map((id) => ({ id, data: records.get(id) || {} }));
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
    requireTeamMember: (_req: any, _res: any, next: any) => {
      next();
    },
    requireCA: (_req: any, _res: any, next: any) => {
      next();
    },
    requireAnyAuth: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
    authenticateToken: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
  };
});

vi.mock("../../../server/services/email.js", () => ({
  EMAIL_TEMPLATES: {},
  getEmailTemplates: () => [],
  sendBulkEmails: vi.fn(async () => ({ sent: 0, failed: 0, errors: [] })),
  sendEmail: vi.fn(async () => ({ success: true, messageId: "test-email" })),
  sendWorkflowEmail: vi.fn(async () => ({ success: true, messageId: "test-workflow-email" })),
}));

const { default: userRouter } = await import("../../../server/routes/user.js");
const { default: profilesRouter } = await import("../../../server/routes/profiles.js");
const { default: adminRouter } = await import("../../../server/routes/admin.js");
const { default: caRouter } = await import("../../../server/routes/ca.js");
const { default: remindersRouter } = await import("../../../server/routes/reminders.js");
const { default: teamTriageRouter } = await import("../../../server/routes/team-triage.js");
const { default: workflowEventsRouter } = await import("../../../server/routes/workflow-events.js");

function resetStore() {
  mockState.store.clear();
  mockState.counter = 0;
  mockState.failAdds.clear();
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
  app.use("/api/profiles", profilesRouter);
  app.use("/api/admin", adminRouter);
  app.use("/api/ca", caRouter);
  app.use("/api/reminders", remindersRouter);
  app.use("/api/team/triage", teamTriageRouter);
  app.use("/api/workflow-events", workflowEventsRouter);

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
  if (ORIGINAL_PII_ENCRYPTION_KEY === undefined) {
    delete process.env.PII_ENCRYPTION_KEY;
  } else {
    process.env.PII_ENCRYPTION_KEY = ORIGINAL_PII_ENCRYPTION_KEY;
  }
});

describe("user service routes", () => {
  it("updates the signed-in account profile when last name and phone are blank", async () => {
    seed("users", "user_1", {
      id: "user_1",
      email: "user_1@example.com",
      firstName: "Old",
      lastName: "Name",
      phoneNumber: "9999999999",
      role: "user",
      status: "active",
    });

    const { response, json } = await request("/api/profile", {
      method: "PUT",
      body: JSON.stringify({
        firstName: "Asha",
        lastName: "",
        phoneNumber: "   ",
      }),
    });

    expect(response.status).toBe(200);
    expect(json.data.user).toMatchObject({
      id: "user_1",
      firstName: "Asha",
      lastName: "",
      phoneNumber: null,
    });
    expect(collectionStore("users").get("user_1")).toMatchObject({
      firstName: "Asha",
      lastName: "",
      phoneNumber: null,
    });
  });

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
    seed("reminders", "reminder_1", {
      title: "Upload Form 16",
      message: "Your CA needs the latest Form 16 before review.",
      targetRole: "user",
      targetUserId: "user_1",
      caseId: "service_1",
      sourceType: "document",
      sourceId: "doc_missing",
      priority: "high",
      status: "pending",
      dueAt: new Date("2026-05-12T08:00:00.000Z"),
      createdAt: new Date("2026-05-12T08:00:00.000Z"),
      updatedAt: new Date("2026-05-12T08:00:00.000Z"),
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
    expect(json.nextActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "reminder-reminder_1",
          source: "reminder",
          href: "/dashboard/services/service_1",
        }),
        expect.objectContaining({
          id: "payment-service_1",
          source: "payment",
          href: "/payments",
        }),
        expect.objectContaining({
          id: "filing-return_1",
          source: "filing",
          href: "/itr/filing/return_1",
        }),
      ]),
    );
    expect(json.nextActions[0]).toMatchObject({
      id: "reminder-reminder_1",
      label: "Upload Form 16",
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

  it("accepts privacy-safe ITR start conversion metadata", async () => {
    const { response, json } = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "itr-filing",
        serviceTitle: "Salary ITR Filing",
        serviceCategory: "Individual Tax Services",
        paymentAmount: 499,
        metadata: {
          requestDescription: "ITR start diagnosis recommended Salary plan.",
          source: "itr_start_funnel",
          requestedAt: "2026-05-31T12:00:00.000Z",
          originalServicePath: "/which-itr-form-to-file",
          conversionSource: "homepage_hero",
          recommendedPlanId: "salary",
          assessmentYear: "2026-27",
          incomeProfile: ["salary"],
          assistanceLevel: "guided",
          ctaVariant: "primary_start",
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(json.service.metadata).toMatchObject({
      source: "itr_start_funnel",
      originalServicePath: "/which-itr-form-to-file",
      conversionSource: "homepage_hero",
      recommendedPlanId: "salary",
      assessmentYear: "2026-27",
      incomeProfile: ["salary"],
      assistanceLevel: "guided",
      ctaVariant: "primary_start",
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
    seed("users", "team_1", {
      email: "team@example.com",
      firstName: "Team",
      lastName: "Ops",
      role: "team_member",
      status: "active",
    });

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
        formId: "expert-consultation-form",
        serviceIntent: "gst-returns",
        preferredTime: "Tomorrow morning",
        message: "Need support with GST return filing.",
        leadContext: {
          caseType: "ais-mismatch",
          checklistLabel: "AIS mismatch checklist",
          sourceUrl: "/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026",
          consentTimestamp: "2026-07-01T10:00:00.000Z",
        },
        leadPayload: {
          name: "Asha",
          phone_or_email: "9999999999",
          service_interest: "AY 2026-27 ITR filing",
          source_url: "/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026",
          utm_fields: {
            utm_campaign: "itr-season-2026",
          },
          case_type: "ais-mismatch",
          consent_timestamp: "2026-07-01T10:00:00.000Z",
        },
        channelConsent: {
          whatsapp: {
            optedIn: true,
            phone: "9999999999",
            consentText: "I agree to receive MyeCA updates for this consultation request on WhatsApp.",
            consentTimestamp: "2026-07-01T10:00:00.000Z",
          },
        },
        attribution: {
          source: "partner",
          partnerCode: "CA-DELHI-01",
          utmCampaign: "itr-season-2026",
          firstTouchAt: "2026-06-10T06:00:00.000Z",
        },
      }),
    });

    expect(valid.response.status).toBe(200);
    expect(valid.json.success).toBe(true);
    expect(readCollection("consultation_requests")).toHaveLength(1);
    expect(readCollection("consultation_requests")[0]).toMatchObject({
      userId: "user_9",
      status: "new",
      service: "GST Returns",
      formId: "expert-consultation-form",
      serviceIntent: "gst-returns",
      preferredTime: "Tomorrow morning",
      leadContext: {
        caseType: "ais-mismatch",
        checklistLabel: "AIS mismatch checklist",
        sourceUrl: "/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026",
        consentTimestamp: "2026-07-01T10:00:00.000Z",
      },
      leadPayload: {
        name: "Asha",
        phone_or_email: "9999999999",
        service_interest: "AY 2026-27 ITR filing",
        source_url: "/itr-season-2026/ais-form-26as-mismatch-checklist?utm_campaign=itr-season-2026",
        utm_fields: {
          utm_campaign: "itr-season-2026",
        },
        case_type: "ais-mismatch",
        consent_timestamp: "2026-07-01T10:00:00.000Z",
      },
      channelConsent: {
        whatsapp: {
          optedIn: true,
          phone: "9999999999",
        },
      },
      whatsappStatus: {
        consentStatus: "opted_in",
        leadAcknowledgementStatus: "queued",
      },
      attribution: {
        source: "partner",
        partnerCode: "CA-DELHI-01",
        utmCampaign: "itr-season-2026",
      },
    });
    expect(readCollection("workflow_events")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "form_submitted",
          sourceType: "consultation_request",
          sourceId: valid.json.id,
          targetRole: "team_member",
          metadata: expect.objectContaining({
            serviceIntent: "gst-returns",
            leadContext: expect.objectContaining({ caseType: "ais-mismatch" }),
            leadPayload: expect.objectContaining({ case_type: "ais-mismatch" }),
          }),
        }),
      ]),
    );
    expect(readCollection("reminders")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceType: "consultation_request",
          sourceId: valid.json.id,
          targetRole: "team_member",
          status: "pending",
          channels: ["in_app", "email"],
        }),
      ]),
    );
    expect(readCollection("notifications")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: "team_1", title: "New intake request" }),
      ]),
    );
    expect(readCollection("whatsapp_contacts")[0]).toMatchObject({
      normalizedPhone: "+919999999999",
      consentStatus: "opted_in",
      userIds: ["user_9"],
    });
    expect(readCollection("whatsapp_outbox")[0]).toMatchObject({
      messageType: "template",
      templateName: "lead_acknowledgement",
      status: "queued",
      sourceType: "consultation_request",
      sourceId: valid.json.id,
    });
  });

  it("creates workflow and reminder records for a service request when operational tables are available", async () => {
    const { response, json } = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "gst-registration",
        serviceTitle: "GST Registration",
        serviceCategory: "GST",
        metadata: {
          requestDescription: "Need GST registration for a new business",
          source: "dashboard_services",
          formId: "dashboard-service-modal",
          serviceIntent: "gst-registration",
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(readCollection("workflow_events")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "service_requested",
          sourceType: "user_service",
          sourceId: json.id,
          caseId: json.id,
          targetRole: "ca",
        }),
      ]),
    );
    expect(readCollection("reminders")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: "New service intake",
          sourceType: "user_service",
          sourceId: json.id,
          caseId: json.id,
          status: "pending",
        }),
      ]),
    );
  });

  it("returns the saved service case even if workflow side effects fail", async () => {
    mockState.failAdds.add("workflow_events");

    const { response, json } = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "gst-registration",
        serviceTitle: "GST Registration",
        serviceCategory: "GST",
        metadata: {
          requestDescription: "Need GST registration for a new business",
          source: "dashboard_services",
        },
      }),
    });

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      success: true,
      id: "user_services_1",
      service: {
        id: "user_services_1",
        userId: "user_1",
        serviceId: "gst-registration",
        serviceTitle: "GST Registration",
      },
    });
    expect(readCollection("user_services")).toHaveLength(1);
  });

  it("records payment-link requests and updates the linked service payment state", async () => {
    seed("users", "admin_1", {
      email: "admin@example.com",
      role: "admin",
      status: "active",
    });
    seed("users", "ca_1", {
      email: "ca@example.com",
      role: "ca",
      status: "active",
    });
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceId: "notice-compliance",
      serviceTitle: "Notice Compliance",
      serviceCategory: "Tax Notice",
      paymentAmount: 2500,
      paymentStatus: "pending",
      metadata: {
        attribution: {
          source: "paid_search",
          utmCampaign: "itr-season-2026",
          firstTouchAt: "2026-06-10T06:00:00.000Z",
        },
      },
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
      attribution: {
        source: "paid_search",
        utmCampaign: "itr-season-2026",
      },
    });
    expect(collectionStore("user_services").get("service_1")).toMatchObject({
      paymentStatus: "link_requested",
      metadata: {
        paymentLinkRequestId: "payment_link_requests_1",
      },
    });
    expect(readCollection("workflow_events")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "payment_link_requested",
          caseId: "service_1",
          sourceType: "payment_link_request",
        }),
      ]),
    );
  });
});

describe("tax profile routes", () => {
  it("encrypts PAN and Aadhaar before saving a tax profile", async () => {
    process.env.PII_ENCRYPTION_KEY = "test-profile-encryption-key";

    const { response, json } = await request("/api/profiles", {
      method: "POST",
      body: JSON.stringify({
        name: "Asha Shah",
        relation: "self",
        pan: "ABCDE1234F",
        aadhaar: "123456789012",
        dateOfBirth: "1990-01-01",
        address: "Mumbai",
      }),
    });

    expect(response.status).toBe(200);
    expect(json).toMatchObject({
      id: "profiles_1",
      userId: "user_1",
      pan: "XXXXX1234F",
      aadhaar: "XXXXXXXX9012",
    });
    expect(collectionStore("profiles").get("profiles_1")).toMatchObject({
      userId: "user_1",
      pan: expect.stringMatching(/^enc:v1:/),
      aadhaar: expect.stringMatching(/^enc:v1:/),
    });
    expect(collectionStore("profiles").get("profiles_1")?.pan).not.toBe("ABCDE1234F");
    expect(collectionStore("profiles").get("profiles_1")?.aadhaar).not.toBe("123456789012");
  });

  it("returns a clear configuration error when PII encryption is missing", async () => {
    delete process.env.PII_ENCRYPTION_KEY;

    const { response, json } = await request("/api/profiles", {
      method: "POST",
      body: JSON.stringify({
        name: "Asha Shah",
        relation: "self",
        pan: "ABCDE1234F",
      }),
    });

    expect(response.status).toBe(503);
    expect(json.error).toBe("Secure profile encryption is not configured.");
    expect(readCollection("profiles")).toHaveLength(0);
  });
});

describe("workflow activity, reminders, and team triage routes", () => {
  beforeEach(() => {
    seed("users", "admin_1", {
      email: "admin@example.com",
      firstName: "Admin",
      role: "admin",
      status: "active",
    });
    seed("users", "team_1", {
      email: "team@example.com",
      firstName: "Team",
      role: "team_member",
      status: "active",
    });
    seed("users", "ca_1", {
      email: "ca@example.com",
      firstName: "Case",
      role: "ca",
      status: "active",
    });
    seed("users", "user_1", {
      email: "user_1@example.com",
      firstName: "Test",
      role: "user",
      assignedCaId: "ca_1",
      status: "active",
    });
  });

  it("records service-case activity and exposes it to the owning user", async () => {
    const created = await request("/api/user-services", {
      method: "POST",
      body: JSON.stringify({
        serviceId: "custom-request",
        serviceTitle: "Custom Tax Help",
        serviceCategory: "Custom",
        metadata: {
          requestDescription: "Need a careful review.",
          source: "dashboard_services",
          formId: "dashboard-service-modal",
          serviceIntent: "custom-request",
        },
      }),
    });

    expect(created.response.status).toBe(200);
    const caseId = created.json.id;

    const note = await request(`/api/user-services/${caseId}`, {
      method: "PATCH",
      body: JSON.stringify({ metadata: { userNote: "Please call after 4 PM." } }),
    });

    expect(note.response.status).toBe(200);

    const listed = await request(`/api/workflow-events?caseId=${caseId}`);
    expect(listed.response.status).toBe(200);
    expect(listed.json.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: "service_requested", caseId }),
        expect.objectContaining({ type: "case_note_added", caseId }),
      ]),
    );
  });

  it("lets team triage public intake without exposing private documents", async () => {
    seed("consultation_requests", "consult_1", {
      name: "Asha",
      phone: "9999999999",
      email: "asha@example.com",
      service: "GST Returns",
      message: "Need a callback",
      source: "contact_page",
      formId: "contact-form",
      serviceIntent: "gst-returns",
      status: "new",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });
    seed("documents", "doc_1", {
      userId: "user_1",
      userServiceId: "service_1",
      name: "Private Form 16",
      status: "active",
    });

    const listed = await request("/api/team/triage", {
      headers: { "x-test-user-id": "team_1", "x-test-role": "team_member" },
    });

    expect(listed.response.status).toBe(200);
    expect(listed.json.items).toEqual([
      expect.objectContaining({
        id: "consult_1",
        sourceType: "consultation_request",
        status: "new",
      }),
    ]);
    expect(JSON.stringify(listed.json.items)).not.toContain("Private Form 16");

    const updated = await request("/api/team/triage/consultation_requests/consult_1", {
      method: "PATCH",
      headers: { "x-test-user-id": "team_1", "x-test-role": "team_member" },
      body: JSON.stringify({
        status: "needs_info",
        internalNote: "Need GSTIN before escalation.",
      }),
    });

    expect(updated.response.status).toBe(200);
    expect(updated.json.item).toMatchObject({
      id: "consult_1",
      status: "needs_info",
      internalNote: "Need GSTIN before escalation.",
      triagedBy: "team_1",
    });
    expect(readCollection("workflow_events")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: "intake_triaged",
          sourceType: "consultation_request",
          sourceId: "consult_1",
          actorUserId: "team_1",
        }),
      ]),
    );
  });

  it("processes due reminders once and records email delivery state", async () => {
    seed("reminders", "reminder_1", {
      title: "Missing Form 16",
      message: "Please upload Form 16 for your case.",
      targetRole: "user",
      targetUserId: "user_1",
      caseId: "service_1",
      sourceType: "user_service",
      sourceId: "service_1",
      dueAt: new Date("2026-05-15T08:00:00.000Z"),
      priority: "high",
      channels: ["in_app", "email"],
      status: "pending",
      createdAt: new Date("2026-05-14T08:00:00.000Z"),
      updatedAt: new Date("2026-05-14T08:00:00.000Z"),
    });

    const processed = await request("/api/reminders/process-due", {
      method: "POST",
      headers: { "x-test-user-id": "admin_1", "x-test-role": "admin" },
      body: JSON.stringify({ now: "2026-05-16T08:00:00.000Z" }),
    });

    expect(processed.response.status).toBe(200);
    expect(processed.json).toMatchObject({ processed: 1 });
    expect(collectionStore("reminders").get("reminder_1")).toMatchObject({
      status: "sent",
      lastDelivery: {
        inApp: "sent",
        email: "sent",
      },
    });
    expect(readCollection("notifications")).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ userId: "user_1", title: "Missing Form 16" }),
      ]),
    );

    const secondRun = await request("/api/reminders/process-due", {
      method: "POST",
      headers: { "x-test-user-id": "admin_1", "x-test-role": "admin" },
      body: JSON.stringify({ now: "2026-05-16T09:00:00.000Z" }),
    });

    expect(secondRun.response.status).toBe(200);
    expect(secondRun.json).toMatchObject({ processed: 0 });
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
    attribution: {
      source: "paid_search",
      utmSource: "google",
      utmCampaign: "itr-season-2026",
      partnerCode: "CA-MUMBAI-02",
      firstTouchAt: "2026-06-10T06:00:00.000Z",
    },
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
      attribution: {
        source: "paid_search",
        utmSource: "google",
        utmCampaign: "itr-season-2026",
        partnerCode: "CA-MUMBAI-02",
      },
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

describe("admin service catalog route", () => {
  it("loads the code-defined service catalog through the Express API", async () => {
    seed("user_services", "service_1", {
      serviceId: "itr-filing",
      status: "pending",
    });

    const { response, json } = await request("/api/admin/services");

    expect(response.status).toBe(200);
    expect(json[0]).toMatchObject({
      id: "itr-filing",
      name: "ITR filing with document checklist",
      category: "tax-filing",
      isActive: true,
      bookingsCount: 1,
    });
    expect(json.map((service: { id: string }) => service.id)).not.toEqual(
      expect.arrayContaining(["advance-tax", "income-tax-calculator", "all-calculators", "tax-regime-calculator"]),
    );
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

  it("records server-side referral economics when an admin confirms payment", async () => {
    seed("payment_link_requests", "pay_1", {
      userId: "user_1",
      userServiceId: "service_1",
      serviceTitle: "ITR Filing",
      paymentAmount: 2500,
      status: "link_sent",
      createdAt: new Date("2026-05-15T08:00:00.000Z"),
      updatedAt: new Date("2026-05-15T08:00:00.000Z"),
    });
    seed("user_services", "service_1", {
      userId: "user_1",
      serviceTitle: "ITR Filing",
      paymentStatus: "link_sent",
      metadata: {},
    });

    const updated = await request("/api/admin/requests/payment-links/pay_1", {
      method: "PATCH",
      body: JSON.stringify({
        status: "paid",
        netCollectedRevenue: 2100,
        hasStackedDiscount: false,
      }),
    });

    expect(updated.response.status).toBe(200);
    expect(collectionStore("user_services").get("service_1")).toMatchObject({
      paymentStatus: "paid",
      netCollectedRevenue: 2100,
      hasStackedDiscount: false,
    });
    expect(readCollection("workflow_events")).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: "payment_success", caseId: "service_1" })]),
    );
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
