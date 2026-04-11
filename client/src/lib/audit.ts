import { getAuthToken } from "./authToken";

export interface AuditLogEntry {
  action: string;
  category: "authentication" | "document" | "admin" | "security" | "access";
  metadata?: Record<string, any>;
  status?: "success" | "failure" | "warning";
}

export async function logAuditEvent({ action, category, metadata = {}, status = "success" }: AuditLogEntry) {
  try {
    const token = await getAuthToken();
    await fetch("/api/audit/logs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        action,
        category,
        status,
        metadata: {
          ...metadata,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
        },
      }),
      keepalive: true,
    }).catch(() => undefined);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Audit log failed:", error);
    }
  }
}

export function logLogin(email: string) {
  return logAuditEvent({
    action: "login_success",
    category: "authentication",
    metadata: { email },
  });
}

export function logDocumentAccess(docId: string, actionDesc: string) {
  return logAuditEvent({
    action: actionDesc,
    category: "document",
    metadata: { docId },
  });
}

export function logMfaAction(actionType: "enroll" | "unenroll" | "verify_success" | "verify_failure") {
  return logAuditEvent({
    action: `mfa_${actionType}`,
    category: "security",
  });
}
