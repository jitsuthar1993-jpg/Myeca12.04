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
    req.auth = { userId, email: `${userId}@example.com` };
    req.user = {
      id: userId,
      email: `${userId}@example.com`,
      firstName: "Test",
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
    requireAnyAuth: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
  };
});

const { default: userRouter } = await import("../../../server/routes/user.js");
const { default: adminRouter } = await import("../../../server/routes/admin.js");

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
afterEach(() => {
  vi.clearAllMocks();
});

describe("user service routes", () => {
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
});
