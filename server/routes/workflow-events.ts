import { Response, Router } from "express";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { canViewWorkflowEvent, listWorkflowEvents } from "../utils/workflow-events.js";
import { safeError } from "../utils/error-response.js";

const router = Router();

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

    const events = (await listWorkflowEvents({
      caseId: typeof req.query.caseId === "string" ? req.query.caseId : undefined,
      sourceType: typeof req.query.sourceType === "string" ? req.query.sourceType : undefined,
      sourceId: typeof req.query.sourceId === "string" ? req.query.sourceId : undefined,
    })).filter((event) => canViewWorkflowEvent(req.user, event));

    res.json({ success: true, events, total: events.length });
  } catch (error) {
    return safeError(res, error, "Failed to load workflow events");
  }
});

export default router;
