import crypto from "crypto";
import { adminDb, claimPendingWhatsAppCaseLink } from "../data-admin.js";
import { fileBufferMatchesDeclaredType } from "../lib/file-signature.js";
import { putPrivateDocument } from "./document-storage.js";
import { decryptPII, encryptPII } from "../utils/encryption.js";
import { createReminder } from "../utils/reminders.js";
import { recordWorkflowEvent } from "../utils/workflow-events.js";
import { notifyAdmins, notifyUser } from "../utils/workflow-notifications.js";

type WhatsAppConsentStatus = "unknown" | "opted_in" | "opted_out";
type CaseLinkTarget = {
  userId: string;
  userServiceId?: string | null;
  taxReturnId?: string | null;
};
type WhatsAppContactRecord = Record<string, any> & { id: string };
type CaseLinkRecord = Record<string, any> & { id: string };

const MAX_MEDIA_BYTES = 10 * 1024 * 1024;
const CASE_LINK_TTL_MS = 30 * 60 * 1000;
const CUSTOMER_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000;
const ALLOWED_MEDIA_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

function collection(name: string) {
  return adminDb.collection(name) as any;
}

function nowDate() {
  return new Date();
}

function asDate(value: unknown): Date | null {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  if (typeof (value as any)?.toDate === "function") {
    const date = (value as any).toDate();
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function hashId(prefix: string, value: string) {
  return `${prefix}_${crypto.createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function safePathSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-").slice(0, 150) || "document";
}

function mediaExtension(mimeType: string) {
  if (mimeType === "application/pdf") return "pdf";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/webp") return "webp";
  return "jpg";
}

function normalizeHash(value?: string | null) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function hashMatches(buffer: Buffer, expected?: string | null) {
  const normalized = normalizeHash(expected);
  if (!normalized) return true;
  const hex = crypto.createHash("sha256").update(buffer).digest("hex").toLowerCase();
  const base64 = crypto.createHash("sha256").update(buffer).digest("base64");
  return normalized.toLowerCase() === hex || normalized === base64;
}

export function normalizeWhatsAppPhone(value?: string | null) {
  const digits = String(value || "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

function recipientFromPhone(value?: string | null) {
  return normalizeWhatsAppPhone(value)?.replace(/\D/g, "") || null;
}

function contactIdFor(normalizedPhone: string, waId?: string | null) {
  return waId ? `wa_${waId}` : hashId("wa_phone", normalizedPhone);
}

export function buildWhatsAppWaLink(message: string) {
  const phone = recipientFromPhone(process.env.VITE_WHATSAPP_PUBLIC_NUMBER);
  if (!phone) return null;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function verifyMetaWebhookSignature(rawBody: Buffer | string | undefined, signatureHeader?: string | null, appSecret?: string | null) {
  if (!rawBody || !signatureHeader || !appSecret) return false;
  const expected = `sha256=${crypto.createHmac("sha256", appSecret).update(rawBody).digest("hex")}`;
  const left = Buffer.from(signatureHeader, "utf8");
  const right = Buffer.from(expected, "utf8");
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function verifyMetaWebhookChallenge(query: Record<string, unknown>, verifyToken?: string | null) {
  const mode = typeof query["hub.mode"] === "string" ? query["hub.mode"] : null;
  const token = typeof query["hub.verify_token"] === "string" ? query["hub.verify_token"] : null;
  const challenge = typeof query["hub.challenge"] === "string" ? query["hub.challenge"] : null;
  if (mode === "subscribe" && challenge && verifyToken && token === verifyToken) {
    return { ok: true, challenge };
  }
  return { ok: false, challenge: null };
}

async function firstWhere(collectionName: string, field: string, value: unknown) {
  if (value === undefined || value === null || value === "") return null;
  const snapshot = await collection(collectionName).where(field, "==", value).limit(1).get();
  const doc = snapshot.docs[0];
  return doc ? { id: doc.id, ref: doc.ref, data: doc.data() as Record<string, any> } : null;
}

async function findContact(input: { phone?: string | null; waId?: string | null; contactId?: string | null }) {
  if (input.contactId) {
    const doc = await collection("whatsapp_contacts").doc(input.contactId).get();
    if (doc.exists) return { id: doc.id, ref: doc.ref, data: doc.data() as Record<string, any> };
  }
  if (input.waId) {
    const byWaId = await firstWhere("whatsapp_contacts", "waId", input.waId);
    if (byWaId) return byWaId;
  }
  const normalizedPhone = normalizeWhatsAppPhone(input.phone || input.waId);
  if (!normalizedPhone) return null;
  return firstWhere("whatsapp_contacts", "normalizedPhone", normalizedPhone);
}

export async function upsertWhatsAppContact(input: {
  phone?: string | null;
  waId?: string | null;
  displayName?: string | null;
  userId?: string | null;
  consentStatus?: WhatsAppConsentStatus;
  consentSource?: string | null;
  consentText?: string | null;
  lastInboundAt?: Date | null;
}) {
  const normalizedPhone = normalizeWhatsAppPhone(input.phone || input.waId);
  if (!normalizedPhone) {
    const error = new Error("A WhatsApp phone number is required.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }

  const existing = await findContact({ phone: normalizedPhone, waId: input.waId });
  const id = existing?.id || contactIdFor(normalizedPhone, input.waId);
  const ref = existing?.ref || collection("whatsapp_contacts").doc(id);
  const current = existing?.data || {};
  const now = nowDate();
  const userIds = new Set<string>(Array.isArray(current.userIds) ? current.userIds : []);
  if (input.userId) userIds.add(input.userId);

  const nextConsent = input.consentStatus || current.consentStatus || "unknown";
  const payload = {
    ...current,
    normalizedPhone,
    recipientPhone: recipientFromPhone(normalizedPhone),
    waId: input.waId || current.waId || recipientFromPhone(normalizedPhone),
    displayName: input.displayName || current.displayName || null,
    userIds: Array.from(userIds),
    consentStatus: nextConsent,
    ...(input.consentStatus ? { consentSource: input.consentSource || current.consentSource || "website", consentAt: now } : {}),
    ...(input.consentText ? { consentText: input.consentText } : {}),
    ...(input.lastInboundAt ? { lastInboundAt: input.lastInboundAt } : {}),
    createdAt: current.createdAt || now,
    updatedAt: now,
  };

  await ref.set(payload, { merge: true });
  return { id, ...payload } as WhatsAppContactRecord;
}

async function updateContact(contactId: string, updates: Record<string, any>) {
  const ref = collection("whatsapp_contacts").doc(contactId);
  await ref.update({ ...updates, updatedAt: nowDate() });
  const updated = await ref.get();
  return { id: updated.id, ...(updated.data() as Record<string, any>) } as WhatsAppContactRecord;
}

function canUseCustomerServiceWindow(contact?: Record<string, any> | null, at = nowDate()) {
  const lastInboundAt = asDate(contact?.lastInboundAt);
  if (!lastInboundAt) return false;
  return at.getTime() - lastInboundAt.getTime() <= CUSTOMER_SERVICE_WINDOW_MS;
}

export async function enqueueWhatsAppTemplate(input: {
  phone?: string | null;
  contactId?: string | null;
  templateName: string;
  languageCode?: string;
  variables?: Record<string, string | number | null | undefined>;
  userId?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  caseId?: string | null;
}) {
  const contact = await findContact({ phone: input.phone, contactId: input.contactId });
  const normalizedPhone = contact?.data.normalizedPhone || normalizeWhatsAppPhone(input.phone);
  if (!contact || !normalizedPhone || contact.data.consentStatus !== "opted_in") {
    return createSkippedOutbox({
      normalizedPhone,
      contactId: contact?.id || null,
      templateName: input.templateName,
      skipReason: "whatsapp_consent_missing",
      userId: input.userId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      caseId: input.caseId,
    });
  }

  const outboxRef = collection("whatsapp_outbox").doc();
  const payload = {
    contactId: contact.id,
    normalizedPhone,
    recipientPhone: contact.data.recipientPhone || recipientFromPhone(normalizedPhone),
    userId: input.userId || null,
    messageType: "template",
    templateName: input.templateName,
    languageCode: input.languageCode || "en",
    variables: input.variables || {},
    sourceType: input.sourceType || null,
    sourceId: input.sourceId || null,
    caseId: input.caseId || null,
    status: "queued",
    attempts: 0,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await outboxRef.set(payload);
  return { id: outboxRef.id, status: "queued" as const, ...payload };
}

async function createSkippedOutbox(input: {
  normalizedPhone?: string | null;
  contactId?: string | null;
  templateName?: string | null;
  body?: string | null;
  skipReason: string;
  userId?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  caseId?: string | null;
}) {
  const outboxRef = collection("whatsapp_outbox").doc();
  const payload = {
    contactId: input.contactId || null,
    normalizedPhone: input.normalizedPhone || null,
    recipientPhone: recipientFromPhone(input.normalizedPhone),
    userId: input.userId || null,
    messageType: input.templateName ? "template" : "text",
    templateName: input.templateName || null,
    bodyEncrypted: input.body ? encryptPII(input.body) : null,
    bodyPreview: null,
    sourceType: input.sourceType || null,
    sourceId: input.sourceId || null,
    caseId: input.caseId || null,
    status: "skipped",
    skipReason: input.skipReason,
    attempts: 0,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await outboxRef.set(payload);
  return { id: outboxRef.id, status: "skipped" as const, ...payload };
}

export async function enqueueWhatsAppText(input: {
  contactId?: string | null;
  phone?: string | null;
  body: string;
  userId?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  caseId?: string | null;
}) {
  const contact = await findContact({ phone: input.phone, contactId: input.contactId });
  const normalizedPhone = contact?.data.normalizedPhone || normalizeWhatsAppPhone(input.phone);
  if (!contact || !normalizedPhone || contact.data.consentStatus === "opted_out" || !canUseCustomerServiceWindow(contact.data)) {
    return createSkippedOutbox({
      normalizedPhone,
      contactId: contact?.id || null,
      body: input.body,
      skipReason: "customer_service_window_closed",
      userId: input.userId,
      sourceType: input.sourceType,
      sourceId: input.sourceId,
      caseId: input.caseId,
    });
  }

  const outboxRef = collection("whatsapp_outbox").doc();
  const payload = {
    contactId: contact.id,
    normalizedPhone,
    recipientPhone: contact.data.recipientPhone || recipientFromPhone(normalizedPhone),
    userId: input.userId || null,
    messageType: "text",
    bodyEncrypted: encryptPII(input.body),
    bodyPreview: null,
    sourceType: input.sourceType || null,
    sourceId: input.sourceId || null,
    caseId: input.caseId || null,
    status: "queued",
    attempts: 0,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await outboxRef.set(payload);
  return { id: outboxRef.id, status: "queued" as const, ...payload };
}

async function contactForUser(userId: string) {
  const snapshot = await collection("whatsapp_contacts").get();
  const contacts = snapshot.docs
    .map((doc: any) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }))
    .filter((contact: WhatsAppContactRecord) =>
      contact.consentStatus === "opted_in" && Array.isArray(contact.userIds) && contact.userIds.includes(userId),
    );
  return contacts[0] || null;
}

export async function enqueueWhatsAppTemplateForUser(input: {
  userId?: string | null;
  templateName: string;
  variables?: Record<string, string | number | null | undefined>;
  sourceType?: string | null;
  sourceId?: string | null;
  caseId?: string | null;
}) {
  if (!input.userId) return null;
  const contact = await contactForUser(input.userId);
  if (!contact) return null;
  return enqueueWhatsAppTemplate({
    contactId: contact.id,
    templateName: input.templateName,
    variables: input.variables,
    userId: input.userId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    caseId: input.caseId,
  });
}

export async function recordWhatsAppConsentFromConsultation(input: {
  requestId: string;
  name?: string | null;
  phone?: string | null;
  userId?: string | null;
  channelConsent?: Record<string, any> | null;
}) {
  const whatsappConsent = input.channelConsent?.whatsapp;
  if (!whatsappConsent?.optedIn || !input.phone) return null;
  const submittedPhone = normalizeWhatsAppPhone(input.phone);
  const consentPhone = normalizeWhatsAppPhone(whatsappConsent.phone || input.phone);
  if (!submittedPhone || consentPhone !== submittedPhone) return null;

  const contact = await upsertWhatsAppContact({
    phone: submittedPhone,
    displayName: input.name,
    userId: input.userId,
    consentStatus: "opted_in",
    consentSource: "consultation_request",
    consentText: whatsappConsent.consentText || "User opted in to receive MyeCA WhatsApp updates for this request.",
  });
  const queued = await enqueueWhatsAppTemplate({
    contactId: contact.id,
    templateName: "lead_acknowledgement",
    userId: input.userId,
    sourceType: "consultation_request",
    sourceId: input.requestId,
  });
  await collection("consultation_requests").doc(input.requestId).update({
    whatsappStatus: {
      contactId: contact.id,
      normalizedPhone: contact.normalizedPhone,
      consentStatus: contact.consentStatus,
      leadAcknowledgementStatus: queued?.status || "skipped",
      lastTemplateQueuedAt: queued?.status === "queued" ? nowDate() : null,
    },
    updatedAt: nowDate(),
  });
  return { contact, queued };
}

async function targetOwner(target: CaseLinkTarget) {
  if (target.taxReturnId) {
    const doc = await collection("tax_returns").doc(target.taxReturnId).get();
    return doc.exists ? (doc.data() as Record<string, any>) : null;
  }
  if (target.userServiceId) {
    const doc = await collection("user_services").doc(target.userServiceId).get();
    return doc.exists ? (doc.data() as Record<string, any>) : null;
  }
  return null;
}

async function uniqueCaseCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = `MYECA-${crypto.randomBytes(4).toString("hex").slice(0, 6).toUpperCase()}`;
    const existing = await firstWhere("whatsapp_case_links", "code", code);
    if (!existing) return code;
  }
  return `MYECA-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

export async function createWhatsAppCaseLink(target: CaseLinkTarget) {
  if (Boolean(target.taxReturnId) === Boolean(target.userServiceId)) {
    const error = new Error("Provide exactly one case target.");
    (error as Error & { status?: number }).status = 400;
    throw error;
  }
  const owner = await targetOwner(target);
  if (!owner || owner.userId !== target.userId) {
    const error = new Error("Linked case does not belong to this user.");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }

  const ref = collection("whatsapp_case_links").doc();
  const code = await uniqueCaseCode();
  const expiresAt = new Date(Date.now() + CASE_LINK_TTL_MS);
  const payload = {
    code,
    userId: target.userId,
    userServiceId: target.userServiceId || owner.userServiceId || null,
    taxReturnId: target.taxReturnId || owner.metadata?.linkedTaxReturnId || null,
    status: "pending",
    contactId: null,
    waId: null,
    normalizedPhone: null,
    expiresAt,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await ref.set(payload);
  return {
    id: ref.id,
    ...payload,
    waLink: buildWhatsAppWaLink(`Hi MyeCA, connect this case: ${code}`),
  };
}

function findCaseCodeInText(value?: string | null) {
  if (!value) return null;
  const normalized = value.toUpperCase();
  return normalized.match(/\bMYECA-[A-Z0-9]{6,10}\b/)?.[0] || null;
}

async function activateCaseLink(code: string, contact: WhatsAppContactRecord) {
  const link = await firstWhere("whatsapp_case_links", "code", code);
  if (!link) return null;

  const data = link.data as CaseLinkRecord;
  if (data.status !== "pending") return { id: link.id, ...data };
  const expiresAt = asDate(data.expiresAt);
  if (expiresAt && expiresAt.getTime() < Date.now()) {
    await link.ref.update({ status: "expired", updatedAt: nowDate() });
    return null;
  }

  const claimed = await claimPendingWhatsAppCaseLink(code, contact);
  if (!claimed) return null;

  const userIds = new Set<string>(Array.isArray(contact.userIds) ? contact.userIds : []);
  if (data.userId) userIds.add(data.userId);
  await updateContact(contact.id, { userIds: Array.from(userIds), consentStatus: contact.consentStatus || "unknown" });
  return claimed as CaseLinkRecord;
}

async function activeLinksForContact(contactId: string) {
  const snapshot = await collection("whatsapp_case_links").where("contactId", "==", contactId).where("status", "==", "active").get();
  return snapshot.docs.map((doc: any) => ({ id: doc.id, ...(doc.data() as Record<string, any>) })) as CaseLinkRecord[];
}

async function recordMessage(input: {
  contact: WhatsAppContactRecord;
  providerMessageId?: string | null;
  direction: "inbound" | "outbound";
  messageType?: string | null;
  body?: string | null;
  templateName?: string | null;
  status?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  caseId?: string | null;
}) {
  if (input.providerMessageId) {
    const existing = await firstWhere("whatsapp_messages", "providerMessageId", input.providerMessageId);
    if (existing) return { duplicate: true, id: existing.id, ...(existing.data as Record<string, any>) };
  }

  const ref = collection("whatsapp_messages").doc();
  const payload = {
    contactId: input.contact.id,
    waId: input.contact.waId || null,
    normalizedPhone: input.contact.normalizedPhone,
    providerMessageId: input.providerMessageId || null,
    direction: input.direction,
    messageType: input.messageType || "text",
    bodyEncrypted: input.body ? encryptPII(input.body) : null,
    bodyPreview: null,
    templateName: input.templateName || null,
    status: input.status || "received",
    sourceType: input.sourceType || null,
    sourceId: input.sourceId || null,
    caseId: input.caseId || null,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await ref.set(payload);
  return { duplicate: false, id: ref.id, ...payload };
}

function extractText(message: Record<string, any>) {
  if (message.type === "text") return String(message.text?.body || "");
  if (message.type === "button") return String(message.button?.text || "");
  if (message.type === "interactive") {
    return String(message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || "");
  }
  return String(message.caption || message[message.type]?.caption || "");
}

function extractMedia(message: Record<string, any>) {
  if (!["document", "image"].includes(message.type)) return null;
  const media = message[message.type] || {};
  const mediaId = typeof media.id === "string" ? media.id : null;
  if (!mediaId) return null;
  return {
    mediaId,
    mimeType: typeof media.mime_type === "string" ? media.mime_type : null,
    fileName: typeof media.filename === "string" ? media.filename : null,
    sha256: typeof media.sha256 === "string" ? media.sha256 : null,
    caption: typeof media.caption === "string" ? media.caption : null,
  };
}

async function rejectMediaImport(input: {
  mediaId: string;
  providerMessageId?: string | null;
  contactId?: string | null;
  rejectReason: string;
  mimeType?: string | null;
  caseId?: string | null;
}) {
  const ref = collection("whatsapp_media_imports").doc();
  const payload = {
    mediaId: input.mediaId,
    providerMessageId: input.providerMessageId || null,
    contactId: input.contactId || null,
    mimeType: input.mimeType || null,
    status: "rejected",
    rejectReason: input.rejectReason,
    caseId: input.caseId || null,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await ref.set(payload);
  return { id: ref.id, ...payload };
}

async function fetchMetaMediaMetadata(mediaId: string) {
  const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.META_WHATSAPP_GRAPH_VERSION || "v23.0";
  if (!token || !phoneNumberId) {
    const error = new Error("Meta WhatsApp media API is not configured.");
    (error as Error & { status?: number }).status = 503;
    throw error;
  }

  const url = `https://graph.facebook.com/${version}/${encodeURIComponent(mediaId)}?phone_number_id=${encodeURIComponent(phoneNumberId)}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Meta media metadata request failed: ${response.status}`);
  return response.json() as Promise<Record<string, any>>;
}

async function downloadMetaMedia(url: string) {
  const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const parsedUrl = new URL(url);
  const allowedHost = parsedUrl.protocol === "https:" && (
    parsedUrl.hostname === "graph.facebook.com"
    || parsedUrl.hostname === "lookaside.fbsbx.com"
    || parsedUrl.hostname.endsWith(".fbcdn.net")
  );
  if (!allowedHost) throw new Error("Meta media URL host is not allowed.");

  const response = await fetch(parsedUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Meta media download failed: ${response.status}`);
  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_MEDIA_BYTES) throw new Error("Meta media file exceeds the size limit.");
  if (!response.body) return Buffer.alloc(0);

  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of response.body as any) {
    const buffer = Buffer.from(chunk);
    totalBytes += buffer.length;
    if (totalBytes > MAX_MEDIA_BYTES) throw new Error("Meta media file exceeds the size limit.");
    chunks.push(buffer);
  }
  return Buffer.concat(chunks, totalBytes);
}

async function importWhatsAppMedia(input: {
  mediaId: string;
  providerMessageId?: string | null;
  contact: WhatsAppContactRecord;
  caseLink: CaseLinkRecord;
  mimeType?: string | null;
  fileName?: string | null;
  sha256?: string | null;
}) {
  const duplicate = await firstWhere("whatsapp_media_imports", "providerMessageId", input.providerMessageId);
  if (duplicate?.data?.status === "imported") return duplicate.data;

  const metadata = await fetchMetaMediaMetadata(input.mediaId);
  const mimeType = String(metadata.mime_type || input.mimeType || "").toLowerCase();
  if (!ALLOWED_MEDIA_MIME_TYPES.has(mimeType)) {
    return rejectMediaImport({
      mediaId: input.mediaId,
      providerMessageId: input.providerMessageId,
      contactId: input.contact.id,
      rejectReason: "unsupported_mime_type",
      mimeType,
      caseId: input.caseLink.userServiceId || input.caseLink.taxReturnId || null,
    });
  }

  const expectedSize = Number(metadata.file_size || 0);
  if (expectedSize > MAX_MEDIA_BYTES) {
    return rejectMediaImport({
      mediaId: input.mediaId,
      providerMessageId: input.providerMessageId,
      contactId: input.contact.id,
      rejectReason: "file_too_large",
      mimeType,
      caseId: input.caseLink.userServiceId || input.caseLink.taxReturnId || null,
    });
  }

  const mediaUrl = typeof metadata.url === "string" ? metadata.url : null;
  if (!mediaUrl) throw new Error("Meta media URL was not returned.");
  const buffer = await downloadMetaMedia(mediaUrl);

  if (buffer.length > MAX_MEDIA_BYTES) {
    return rejectMediaImport({
      mediaId: input.mediaId,
      providerMessageId: input.providerMessageId,
      contactId: input.contact.id,
      rejectReason: "file_too_large",
      mimeType,
      caseId: input.caseLink.userServiceId || input.caseLink.taxReturnId || null,
    });
  }
  if (!fileBufferMatchesDeclaredType(buffer, mimeType)) {
    return rejectMediaImport({
      mediaId: input.mediaId,
      providerMessageId: input.providerMessageId,
      contactId: input.contact.id,
      rejectReason: "mime_signature_mismatch",
      mimeType,
      caseId: input.caseLink.userServiceId || input.caseLink.taxReturnId || null,
    });
  }
  if (!hashMatches(buffer, input.sha256 || metadata.sha256)) {
    return rejectMediaImport({
      mediaId: input.mediaId,
      providerMessageId: input.providerMessageId,
      contactId: input.contact.id,
      rejectReason: "hash_mismatch",
      mimeType,
      caseId: input.caseLink.userServiceId || input.caseLink.taxReturnId || null,
    });
  }

  const docRef = collection("documents").doc();
  const originalName = input.fileName || `whatsapp-${input.mediaId}.${mediaExtension(mimeType)}`;
  const fileName = `${Date.now()}-${safePathSegment(originalName)}`;
  const pathname = `documents/${input.caseLink.userId}/${docRef.id}/${fileName}`;
  const blob = await putPrivateDocument(pathname, buffer, { contentType: mimeType });
  const document = {
    userId: input.caseLink.userId,
    fileName,
    originalName,
    mimeType,
    size: buffer.length,
    originalSize: buffer.length,
    storedSize: buffer.length,
    compressionType: "none",
    compressionStatus: "not_applicable",
    profileId: null,
    serviceId: input.caseLink.userServiceId || null,
    userServiceId: input.caseLink.userServiceId || null,
    taxReturnId: input.caseLink.taxReturnId || null,
    uploadPath: blob.pathname,
    blobUrl: blob.url,
    downloadUrl: blob.downloadUrl,
    name: originalName,
    category: "itr-document",
    tags: ["whatsapp"],
    description: "Imported from WhatsApp for a linked MyeCA case.",
    source: "whatsapp",
    metadata: {
      sourceChannel: "whatsapp",
      whatsappMessageId: input.providerMessageId || null,
      waMediaId: input.mediaId,
      contactId: input.contact.id,
      importedAt: nowDate(),
    },
    status: "active",
    version: 1,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await docRef.set(document);

  const importRef = collection("whatsapp_media_imports").doc();
  const importRecord = {
    mediaId: input.mediaId,
    providerMessageId: input.providerMessageId || null,
    contactId: input.contact.id,
    mimeType,
    hash: crypto.createHash("sha256").update(buffer).digest("hex"),
    status: "imported",
    linkedDocumentId: docRef.id,
    userId: input.caseLink.userId,
    userServiceId: input.caseLink.userServiceId || null,
    taxReturnId: input.caseLink.taxReturnId || null,
    createdAt: nowDate(),
    updatedAt: nowDate(),
  };
  await importRef.set(importRecord);

  await recordWorkflowEvent({
    type: "whatsapp_document_imported",
    title: "WhatsApp document imported",
    message: `${originalName} was imported from a linked WhatsApp case.`,
    sourceType: "document",
    sourceId: docRef.id,
    caseId: input.caseLink.userServiceId || null,
    userId: input.caseLink.userId,
    targetRole: input.caseLink.userServiceId ? "ca" : "admin",
    priority: "medium",
    metadata: {
      documentId: docRef.id,
      userServiceId: input.caseLink.userServiceId || null,
      taxReturnId: input.caseLink.taxReturnId || null,
      waMediaId: input.mediaId,
    },
  });

  if (input.caseLink.userServiceId) {
    await createReminder({
      title: "Review WhatsApp document",
      message: `${originalName} was attached from WhatsApp.`,
      targetRole: "ca",
      caseId: input.caseLink.userServiceId,
      sourceType: "document",
      sourceId: docRef.id,
      priority: "medium",
      metadata: { actionUrl: `/dashboard/services/${input.caseLink.userServiceId}` },
    });
  }

  await Promise.all([
    notifyAdmins({
      title: "WhatsApp document imported",
      message: `${originalName} was attached to a linked case.`,
      type: "info",
      metadata: {
        documentId: docRef.id,
        userId: input.caseLink.userId,
        userServiceId: input.caseLink.userServiceId || null,
        taxReturnId: input.caseLink.taxReturnId || null,
      },
    }),
    notifyUser(input.caseLink.userId, {
      title: "WhatsApp document received",
      message: "Your document was attached to the linked MyeCA case.",
      type: "success",
      metadata: {
        actionUrl: input.caseLink.userServiceId ? `/dashboard/services/${input.caseLink.userServiceId}` : "/documents",
        documentId: docRef.id,
        userServiceId: input.caseLink.userServiceId || null,
        taxReturnId: input.caseLink.taxReturnId || null,
      },
    }),
  ]);

  return { id: importRef.id, ...importRecord };
}

async function handleInboundMedia(message: Record<string, any>, contact: WhatsAppContactRecord) {
  const media = extractMedia(message);
  if (!media) return null;
  const linkedCases = await activeLinksForContact(contact.id);
  if (linkedCases.length !== 1) {
    await rejectMediaImport({
      mediaId: media.mediaId,
      providerMessageId: message.id,
      contactId: contact.id,
      rejectReason: linkedCases.length > 1 ? "multiple_open_cases" : "case_not_linked",
      mimeType: media.mimeType,
    });
    const reply = linkedCases.length > 1
      ? "Please send the one-time MyeCA case code for the case this document belongs to."
      : "Please connect this WhatsApp number to a MyeCA case before sending documents.";
    await enqueueWhatsAppText({ contactId: contact.id, body: reply });
    return null;
  }

  return importWhatsAppMedia({
    mediaId: media.mediaId,
    providerMessageId: message.id,
    contact,
    caseLink: linkedCases[0],
    mimeType: media.mimeType,
    fileName: media.fileName,
    sha256: media.sha256,
  });
}

async function handleStatus(status: Record<string, any>) {
  const providerMessageId = typeof status.id === "string" ? status.id : null;
  if (!providerMessageId) return;
  const message = await firstWhere("whatsapp_messages", "providerMessageId", providerMessageId);
  if (message) {
    await message.ref.update({
      status: status.status || "updated",
      providerStatusUpdatedAt: nowDate(),
      updatedAt: nowDate(),
    });
  }
  const outbox = await firstWhere("whatsapp_outbox", "providerMessageId", providerMessageId);
  if (outbox) {
    await outbox.ref.update({
      status: status.status || "sent",
      providerStatusUpdatedAt: nowDate(),
      updatedAt: nowDate(),
    });
  }
}

async function handleInboundMessage(message: Record<string, any>, contactProfile?: Record<string, any>) {
  const waId = String(message.from || "").replace(/\D/g, "");
  if (!waId) return null;
  const contact = await upsertWhatsAppContact({
    phone: waId,
    waId,
    displayName: contactProfile?.profile?.name || contactProfile?.name || null,
    lastInboundAt: nowDate(),
  });

  const text = extractText(message);
  const recorded = await recordMessage({
    contact,
    providerMessageId: message.id,
    direction: "inbound",
    messageType: message.type || "text",
    body: text || null,
    status: "received",
  });
  if ((recorded as any).duplicate) return recorded;

  if (text && /^(STOP|UNSUBSCRIBE|OPT\s*OUT)$/i.test(text.trim())) {
    return updateContact(contact.id, {
      consentStatus: "opted_out",
      consentRevokedAt: nowDate(),
      consentRevokedBy: "whatsapp_keyword",
    });
  }

  const code = findCaseCodeInText(text);
  if (code) {
    await activateCaseLink(code, contact);
  }

  if (["document", "image"].includes(message.type)) {
    return handleInboundMedia(message, contact);
  }

  return recorded;
}

export async function processWhatsAppWebhookPayload(payload: Record<string, any>) {
  const entries = Array.isArray(payload?.entry) ? payload.entry : [];
  const result = { messages: 0, statuses: 0 };

  for (const entry of entries) {
    const changes = Array.isArray(entry?.changes) ? entry.changes : [];
    for (const change of changes) {
      const value = change?.value || {};
      const contacts = new Map<string, Record<string, any>>();
      for (const contact of Array.isArray(value.contacts) ? value.contacts : []) {
        if (contact?.wa_id) contacts.set(String(contact.wa_id), contact);
      }

      for (const status of Array.isArray(value.statuses) ? value.statuses : []) {
        await handleStatus(status);
        result.statuses += 1;
      }

      for (const message of Array.isArray(value.messages) ? value.messages : []) {
        await handleInboundMessage(message, contacts.get(String(message.from)));
        result.messages += 1;
      }
    }
  }

  return result;
}

export async function sendQueuedWhatsAppMessage(outboxId: string) {
  const token = process.env.META_WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const version = process.env.META_WHATSAPP_GRAPH_VERSION || "v23.0";
  if (!token || !phoneNumberId) {
    const error = new Error("Meta WhatsApp send API is not configured.");
    (error as Error & { status?: number }).status = 503;
    throw error;
  }

  const doc = await collection("whatsapp_outbox").doc(outboxId).get();
  if (!doc.exists) {
    const error = new Error("WhatsApp outbox item not found.");
    (error as Error & { status?: number }).status = 404;
    throw error;
  }
  const item = doc.data() as Record<string, any>;
  if (item.status !== "queued") return { skipped: true, reason: "not_queued" };
  if (!item.recipientPhone) return { skipped: true, reason: "missing_recipient" };

  const outboundText = item.bodyEncrypted ? decryptPII(item.bodyEncrypted) : item.bodyPreview || "";
  const body = item.messageType === "template"
    ? {
        messaging_product: "whatsapp",
        to: item.recipientPhone,
        type: "template",
        template: {
          name: item.templateName,
          language: { code: item.languageCode || "en" },
        },
      }
    : {
        messaging_product: "whatsapp",
        to: item.recipientPhone,
        type: "text",
        text: { preview_url: false, body: outboundText },
      };

  await doc.ref.update({ status: "sending", attempts: Number(item.attempts || 0) + 1, updatedAt: nowDate() });
  const response = await fetch(`https://graph.facebook.com/${version}/${encodeURIComponent(phoneNumberId)}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    await doc.ref.update({ status: "failed", lastError: data?.error?.message || `HTTP ${response.status}`, updatedAt: nowDate() });
    return { sent: false, error: data?.error || response.status };
  }
  const providerMessageId = data?.messages?.[0]?.id || null;
  await doc.ref.update({ status: "sent", providerMessageId, sentAt: nowDate(), updatedAt: nowDate() });
  return { sent: true, providerMessageId };
}
