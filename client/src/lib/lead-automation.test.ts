import { createHmac } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
import { notifyLeadAutomation } from "../../../server/services/lead-automation.js";

describe("lead automation webhook", () => {
  it("skips without a configured n8n webhook URL", async () => {
    const fetchImpl = vi.fn();

    await expect(notifyLeadAutomation(
      { id: "lead_1", email: "user@example.com", service: "ITR" },
      { env: {}, fetchImpl },
    )).resolves.toEqual({ status: "skipped" });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("sends a signed consultation payload to the configured n8n webhook", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 202 });
    const payload = { id: "lead_1", email: "user@example.com", service: "ITR" };
    const body = JSON.stringify({
      event: "consultation_request.created",
      data: payload,
    });
    const expectedSignature = createHmac("sha256", "secret").update(body).digest("hex");

    await expect(notifyLeadAutomation(payload, {
      env: {
        LEAD_AUTOMATION_WEBHOOK_URL: "https://auto.myeca.in/webhook/consultation",
        LEAD_AUTOMATION_WEBHOOK_SECRET: "secret",
      },
      fetchImpl,
    })).resolves.toEqual({ status: "sent", responseStatus: 202 });

    expect(fetchImpl).toHaveBeenCalledWith("https://auto.myeca.in/webhook/consultation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-MyeCA-Event": "consultation_request.created",
        "X-MyeCA-Signature": expectedSignature,
      },
      body,
    });
  });
});
