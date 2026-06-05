import { adminDb } from "../data-admin.js";

type QueueRecord = Record<string, unknown> & { id: string };

function asTime(value: unknown) {
  const date = value instanceof Date ? value : typeof value === "string" ? new Date(value) : null;
  const time = date?.getTime() ?? 0;
  return Number.isNaN(time) ? 0 : time;
}

function personName(user?: Record<string, unknown> | null) {
  if (!user) return "Unknown";
  const firstName = typeof user.firstName === "string" ? user.firstName : "";
  const lastName = typeof user.lastName === "string" ? user.lastName : "";
  const name = `${firstName} ${lastName}`.trim();
  return name || (typeof user.email === "string" ? user.email : "Unknown");
}

async function listUsersById() {
  const snapshot = await adminDb.collection("users").get();
  return new Map<string, QueueRecord>(
    snapshot.docs.map((doc) => [doc.id, { id: doc.id, ...(doc.data() as Record<string, unknown>) } as QueueRecord]),
  );
}

async function listActiveDocuments() {
  const snapshot = await adminDb.collection("documents").where("status", "==", "active").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as QueueRecord);
}

async function listTaxReturns() {
  const snapshot = await adminDb.collection("tax_returns").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }) as QueueRecord);
}

export async function buildServiceCaseQueue(options: { assignedCaId?: string | null } = {}) {
  let query: any = adminDb.collection("user_services");
  if (options.assignedCaId) {
    query = query.where("assignedCaId", "==", options.assignedCaId);
  }

  const [servicesSnapshot, usersById, documents, taxReturns] = await Promise.all([
    query.get(),
    listUsersById(),
    listActiveDocuments(),
    listTaxReturns(),
  ]);

  return servicesSnapshot.docs
    .map((doc: any) => {
      const service = { id: doc.id, ...(doc.data() as Record<string, unknown>) } as QueueRecord;
      const metadata = (service.metadata || {}) as Record<string, unknown>;
      const caseDocuments = documents.filter((document) => document.userServiceId === service.id);
      const linkedTaxReturnId =
        typeof metadata.linkedTaxReturnId === "string" ? metadata.linkedTaxReturnId : null;
      const taxReturn =
        taxReturns.find((entry) => entry.userServiceId === service.id) ||
        (linkedTaxReturnId ? taxReturns.find((entry) => entry.id === linkedTaxReturnId) : undefined) ||
        null;
      const client = usersById.get(String(service.userId || ""));
      const assignedCa = usersById.get(String(service.assignedCaId || ""));
      const latestDocumentAt = caseDocuments
        .map((document) => document.createdAt)
        .sort((a, b) => asTime(b) - asTime(a))[0] ?? null;

      return {
        ...service,
        clientName: personName(client),
        userName: personName(client),
        assignedCaName: personName(assignedCa),
        documentCount: caseDocuments.length,
        latestDocumentAt,
        taxReturn: taxReturn
          ? {
              id: taxReturn.id,
              assessmentYear: taxReturn.assessmentYear ?? null,
              recommendedForm: taxReturn.recommendedForm ?? null,
              status: taxReturn.status ?? null,
            }
          : null,
      };
    })
    .sort((a: QueueRecord, b: QueueRecord) => asTime(b.updatedAt || b.createdAt) - asTime(a.updatedAt || a.createdAt));
}

export async function buildServiceCaseDetail(serviceId: string) {
  const cases = await buildServiceCaseQueue();
  const serviceCase = cases.find((entry) => entry.id === serviceId);
  if (!serviceCase) return null;

  const documentsSnapshot = await adminDb.collection("documents")
    .where("userServiceId", "==", serviceId)
    .where("status", "==", "active")
    .get();

  return {
    ...serviceCase,
    documents: documentsSnapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) })),
  };
}
