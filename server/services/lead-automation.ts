import crypto from "node:crypto";

type LeadAutomationOptions = {
  env?: NodeJS.ProcessEnv;
  fetchImpl?: typeof fetch;
};

export type LeadAutomationResult =
  | { status: "skipped" }
  | { status: "sent"; responseStatus: number };

export async function notifyLeadAutomation(
  data: Record<string, unknown>,
  options: LeadAutomationOptions = {},
): Promise<LeadAutomationResult> {
  const env = options.env ?? process.env;
  const webhookUrl = env.LEAD_AUTOMATION_WEBHOOK_URL?.trim();
  if (!webhookUrl) return { status: "skipped" };

  const body = JSON.stringify({
    event: "consultation_request.created",
    data,
  });
  const secret = env.LEAD_AUTOMATION_WEBHOOK_SECRET?.trim() || "";
  const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-MyeCA-Event": "consultation_request.created",
      "X-MyeCA-Signature": signature,
    },
    body,
  });

  if (!response.ok) {
    throw new Error(`Lead automation webhook failed with status ${response.status}`);
  }

  return { status: "sent", responseStatus: response.status };
}
