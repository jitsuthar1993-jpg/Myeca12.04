import { Router, type Response } from "express";
import { z } from "zod";
import { requireAnyAuth, type AuthRequest } from "../middleware/auth.js";
import { errorResponse, safeError } from "../utils/error-response.js";
import {
  createWhatsAppCaseLink,
  processWhatsAppWebhookPayload,
  verifyMetaWebhookChallenge,
  verifyMetaWebhookSignature,
} from "../services/whatsapp-client-workflow.js";

const router = Router();

const caseLinkSchema = z.object({
  userServiceId: z.string().trim().min(1).optional(),
  taxReturnId: z.string().trim().min(1).optional(),
}).strict().refine((value) => Boolean(value.userServiceId) !== Boolean(value.taxReturnId), {
  message: "Provide exactly one case target.",
});

router.get("/webhook", (req, res: Response) => {
  const result = verifyMetaWebhookChallenge(req.query as Record<string, unknown>, process.env.META_WHATSAPP_VERIFY_TOKEN);
  if (!result.ok) {
    return errorResponse(res, 403, "WhatsApp webhook verification failed");
  }
  return res.status(200).type("text/plain").send(result.challenge);
});

router.post("/webhook", async (req: AuthRequest & { rawBody?: Buffer }, res: Response) => {
  try {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body || {}));
    const signature = req.get("X-Hub-Signature-256");
    if (!verifyMetaWebhookSignature(rawBody, signature, process.env.META_APP_SECRET)) {
      return errorResponse(res, 403, "Invalid WhatsApp webhook signature");
    }

    const result = await processWhatsAppWebhookPayload(req.body || {});
    res.json({ success: true, result });
  } catch (error) {
    return safeError(res, error, "Failed to process WhatsApp webhook");
  }
});

router.post("/case-links", requireAnyAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return errorResponse(res, 401, "Unauthorized");
    const input = caseLinkSchema.parse(req.body || {});
    const link = await createWhatsAppCaseLink({
      userId: user.id,
      userServiceId: input.userServiceId || null,
      taxReturnId: input.taxReturnId || null,
    });
    res.json({ success: true, link });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(res, 400, error.errors[0]?.message || "Invalid WhatsApp case link request");
    }
    const status = typeof (error as any)?.status === "number" ? (error as any).status : 500;
    if (status !== 500) {
      return errorResponse(res, status, (error as Error).message || "Failed to create WhatsApp case link");
    }
    return safeError(res, error, "Failed to create WhatsApp case link");
  }
});

export default router;
