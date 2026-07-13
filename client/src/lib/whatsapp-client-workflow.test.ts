import crypto from "crypto";
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

function makeSnapshot(collectionName: string, id: string) {
  const records = collectionStore(collectionName);
  return {
    id,
    ref: makeDocRef(collectionName, id),
    exists: records.has(id),
    data: () => records.get(id),
  };
}

function makeDocRef(collectionName: string, id: string) {
  return {
    id,
    get: async () => makeSnapshot(collectionName, id),
    set: async (data: Record<string, any>) => {
      collectionStore(collectionName).set(id, { ...data });
    },
    update: async (data: Record<string, any>) => {
      collectionStore(collectionName).set(id, { ...(collectionStore(collectionName).get(id) || {}), ...data });
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
      let entries = Array.from(collectionStore(collectionName).entries())
        .filter(([, data]) => clauses.every((clause) => data[clause.field] === clause.value));
      if (order) {
        entries = entries.sort(([, left], [, right]) => {
          const leftValue = String(left[order.field] ?? "");
          const rightValue = String(right[order.field] ?? "");
          return order.direction === "desc" ? rightValue.localeCompare(leftValue) : leftValue.localeCompare(rightValue);
        });
      }
      if (maxRows) entries = entries.slice(0, maxRows);
      const docs = entries.map(([id]) => makeSnapshot(collectionName, id));
      return { docs, size: docs.length, empty: docs.length === 0 };
    },
  };
}

vi.mock("../../../server/data-admin.js", () => ({
  claimPendingWhatsAppCaseLink: async (code: string, contact: Record<string, any>) => {
    const records = collectionStore("whatsapp_case_links");
    const entry = Array.from(records.entries()).find(([, data]) => data.code === code && data.status === "pending");
    if (!entry) return null;
    const [id, data] = entry;
    const claimed = {
      ...data,
      id,
      status: "active",
      contactId: contact.id,
      waId: contact.waId || null,
      normalizedPhone: contact.normalizedPhone,
      linkedAt: new Date(),
      updatedAt: new Date(),
    };
    records.set(id, claimed);
    return claimed;
  },
  adminDb: {
    collection: (name: string) => ({
      ...makeQuery(name),
      doc: (id?: string) => makeDocRef(name, id || `${name}_${++mockState.counter}`),
      add: async (data: Record<string, any>) => {
        const id = `${name}_${++mockState.counter}`;
        collectionStore(name).set(id, { ...data });
        return makeDocRef(name, id);
      },
    }),
  },
}));

vi.mock("../../../server/middleware/auth.js", () => {
  const attachUser = (req: any) => {
    const userId = req.get("x-test-user-id") || "user_1";
    req.auth = { userId, email: `${userId}@example.com` };
    req.user = { id: userId, email: `${userId}@example.com`, role: "user" };
  };

  return {
    requireAnyAuth: (req: any, _res: any, next: any) => {
      attachUser(req);
      next();
    },
  };
});

vi.mock("../../../server/services/document-storage.js", () => ({
  putPrivateDocument: vi.fn(async (pathname: string) => ({
    pathname,
    url: `https://private.example/${pathname}`,
    downloadUrl: `https://private.example/${pathname}?download=1`,
  })),
}));

vi.mock("../../../server/utils/workflow-events.js", () => ({
  recordWorkflowEvent: vi.fn(async () => undefined),
}));

vi.mock("../../../server/utils/reminders.js", () => ({
  createReminder: vi.fn(async () => undefined),
}));

vi.mock("../../../server/utils/workflow-notifications.js", () => ({
  notifyAdmins: vi.fn(async () => undefined),
  notifyUser: vi.fn(async () => undefined),
  notifyRole: vi.fn(async () => undefined),
}));

const workflow = await import("../../../server/services/whatsapp-client-workflow.js");
const { default: whatsappClientRouter } = await import("../../../server/routes/whatsapp-client.js");

function resetStore() {
  mockState.store.clear();
  mockState.counter = 0;
  process.env.PII_ENCRYPTION_KEY = "test-pii-key-for-whatsapp-client-workflow";
  process.env.META_APP_SECRET = "test-meta-app-secret";
  process.env.META_WHATSAPP_VERIFY_TOKEN = "verify-token";
  process.env.META_WHATSAPP_ACCESS_TOKEN = "test-access-token";
  process.env.META_WHATSAPP_PHONE_NUMBER_ID = "phone_number_1";
  process.env.META_WHATSAPP_GRAPH_VERSION = "v23.0";
  process.env.VITE_WHATSAPP_PUBLIC_NUMBER = "+919999999999";
}

function seed(collection: string, id: string, data: Record<string, any>) {
  collectionStore(collection).set(id, { ...data });
}

function readCollection(collection: string) {
  return Array.from(collectionStore(collection).entries()).map(([id, data]) => ({ id, ...data }));
}

function signPayload(body: string) {
  return `sha256=${crypto.createHmac("sha256", process.env.META_APP_SECRET || "").update(body).digest("hex")}`;
}

async function request(path: string, options: RequestInit = {}) {
  const app = express();
  app.use(express.json({
    verify: (req, _res, buffer) => {
      (req as any).rawBody = Buffer.from(buffer);
    },
  }));
  app.use("/api/whatsapp/client", whatsappClientRouter);

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
    const text = await response.text();
    let json = null;
    try {
      json = text ? JSON.parse(text) : null;
    } catch {
      json = null;
    }
    return { response, json, text };
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  }
}

function messagePayload(message: Record<string, any>) {
  return {
    object: "whatsapp_business_account",
    entry: [
      {
        changes: [
          {
            value: {
              messaging_product: "whatsapp",
              metadata: { phone_number_id: "phone_number_1" },
              contacts: [{ wa_id: message.from, profile: { name: "Asha" } }],
              messages: [message],
            },
          },
        ],
      },
    ],
  };
}

beforeEach(() => {
  resetStore();
  vi.restoreAllMocks();
});

describe("Meta WhatsApp client workflow", () => {
  it("validates webhook challenge and X-Hub-Signature-256 headers", async () => {
    const rawBody = Buffer.from(JSON.stringify({ hello: "world" }));
    const validSignature = signPayload(rawBody.toString("utf8"));

    expect(workflow.verifyMetaWebhookSignature(rawBody, validSignature, process.env.META_APP_SECRET)).toBe(true);
    expect(workflow.verifyMetaWebhookSignature(rawBody, "sha256=bad", process.env.META_APP_SECRET)).toBe(false);

    const challenge = await request("/api/whatsapp/client/webhook?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=abc123");
    expect(challenge.response.status).toBe(200);
    expect(challenge.text).toBe("abc123");
  });

  it("queues approved templates only for opted-in contacts and blocks after STOP", async () => {
    await workflow.upsertWhatsAppContact({
      phone: "+91 99999 99999",
      waId: "919999999999",
      userId: "user_1",
      consentStatus: "opted_in",
      consentSource: "lead_capture",
    });

    const queued = await workflow.enqueueWhatsAppTemplate({
      phone: "+91 99999 99999",
      templateName: "lead_acknowledgement",
      userId: "user_1",
      sourceType: "consultation_request",
      sourceId: "consultation_1",
    });
    expect(queued?.status).toBe("queued");
    expect(readCollection("whatsapp_outbox")).toHaveLength(1);
    await workflow.enqueueWhatsAppText({
      phone: "+91 99999 99999",
      body: "Sensitive PAN and financial details",
      userId: "user_1",
    });
    const textOutbox = readCollection("whatsapp_outbox").find((item) => item.messageType === "text");
    expect(textOutbox?.bodyEncrypted).toEqual(expect.any(String));
    expect(textOutbox?.bodyPreview).toBeNull();

    await workflow.processWhatsAppWebhookPayload(messagePayload({
      from: "919999999999",
      id: "wamid.stop",
      timestamp: "1783000000",
      type: "text",
      text: { body: "STOP" },
    }));

    expect(readCollection("whatsapp_contacts")[0]).toMatchObject({ consentStatus: "opted_out" });

    const skipped = await workflow.enqueueWhatsAppTemplate({
      phone: "+91 99999 99999",
      templateName: "document_checklist_reminder",
      userId: "user_1",
      sourceType: "tax_return",
      sourceId: "return_1",
    });
    expect(skipped?.status).toBe("skipped");
    expect(skipped?.skipReason).toBe("whatsapp_consent_missing");
  });

  it("rejects WhatsApp consent when the consent phone differs from the submitted phone", async () => {
    const result = await workflow.recordWhatsAppConsentFromConsultation({
      requestId: "consultation_1",
      name: "Test User",
      phone: "+91 99999 99999",
      channelConsent: {
        whatsapp: {
          optedIn: true,
          phone: "+91 88888 88888",
          consentTimestamp: new Date().toISOString(),
        },
      },
    });

    expect(result).toBeNull();
    expect(readCollection("whatsapp_contacts")).toHaveLength(0);
    expect(readCollection("whatsapp_outbox")).toHaveLength(0);
  });

  it("deduplicates repeated inbound webhook message IDs", async () => {
    const payload = messagePayload({
      from: "919999999999",
      id: "wamid.duplicate",
      timestamp: "1783000000",
      type: "text",
      text: { body: "Hello" },
    });

    await workflow.processWhatsAppWebhookPayload(payload);
    await workflow.processWhatsAppWebhookPayload(payload);

    expect(readCollection("whatsapp_messages").filter((message) => message.providerMessageId === "wamid.duplicate")).toHaveLength(1);
  });

  it("generates authenticated case-link codes and imports linked WhatsApp PDF media privately", async () => {
    seed("tax_returns", "return_1", {
      userId: "user_1",
      status: "draft",
      assessmentYear: "2026-27",
    });

    const link = await workflow.createWhatsAppCaseLink({
      userId: "user_1",
      taxReturnId: "return_1",
    });

    await workflow.processWhatsAppWebhookPayload(messagePayload({
      from: "919999999999",
      id: "wamid.link",
      timestamp: "1783000000",
      type: "text",
      text: { body: link.code },
    }));

    const pdfBuffer = Buffer.from("%PDF-1.4\nlinked test pdf\n", "utf8");
    const pdfHash = crypto.createHash("sha256").update(pdfBuffer).digest("base64");
    const realFetch = globalThis.fetch;
    vi.stubGlobal("fetch", vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
      const href = String(url);
      if (href.startsWith("http://127.0.0.1")) {
        return realFetch(url as any, init);
      }
      if (href.includes("graph.facebook.com") && href.includes("/media_1")) {
        return new Response(JSON.stringify({
          id: "media_1",
          url: "https://lookaside.fbsbx.com/media_1.pdf",
          mime_type: "application/pdf",
          sha256: pdfHash,
          file_size: pdfBuffer.length,
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      return new Response(pdfBuffer, { status: 200, headers: { "Content-Type": "application/pdf" } });
    }));

    const mediaPayload = messagePayload({
      from: "919999999999",
      id: "wamid.media",
      timestamp: "1783000001",
      type: "document",
      document: {
        id: "media_1",
        mime_type: "application/pdf",
        filename: "Form 16.pdf",
        sha256: pdfHash,
      },
    });
    const rawBody = JSON.stringify(mediaPayload);
    const webhook = await request("/api/whatsapp/client/webhook", {
      method: "POST",
      headers: { "X-Hub-Signature-256": signPayload(rawBody) },
      body: rawBody,
    });

    expect(webhook.response.status).toBe(200);
    expect(readCollection("documents")[0]).toMatchObject({
      userId: "user_1",
      taxReturnId: "return_1",
      userServiceId: null,
      source: "whatsapp",
      status: "active",
      metadata: expect.objectContaining({
        sourceChannel: "whatsapp",
        whatsappMessageId: "wamid.media",
        waMediaId: "media_1",
      }),
    });
    expect(readCollection("whatsapp_media_imports")[0]).toMatchObject({
      mediaId: "media_1",
      providerMessageId: "wamid.media",
      status: "imported",
      linkedDocumentId: expect.any(String),
    });
  });

  it("rejects inbound media from unknown or unlinked WhatsApp senders", async () => {
    vi.stubGlobal("fetch", vi.fn());

    await workflow.processWhatsAppWebhookPayload(messagePayload({
      from: "919888888888",
      id: "wamid.unlinked-media",
      timestamp: "1783000001",
      type: "image",
      image: {
        id: "media_unknown",
        mime_type: "image/jpeg",
      },
    }));

    expect(readCollection("documents")).toHaveLength(0);
    expect(readCollection("whatsapp_media_imports")[0]).toMatchObject({
      mediaId: "media_unknown",
      providerMessageId: "wamid.unlinked-media",
      status: "rejected",
      rejectReason: "case_not_linked",
    });
  });
});
