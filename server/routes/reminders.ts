import { Response, Router } from "express";
import { z } from "zod";
import { authenticateToken, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { isAdmin, isCa, isTeamMember } from "../utils/access-control.js";
import { listReminders, processDueReminders } from "../utils/reminders.js";
import { safeError } from "../utils/error-response.js";

const router = Router();

const processDueSchema = z.object({
  now: z.string().datetime().optional(),
}).strict();

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: "Unauthorized" });

    const requestedCaseId = typeof req.query.caseId === "string" ? req.query.caseId : undefined;
    let reminders = await listReminders({ caseId: requestedCaseId });

    if (!isAdmin(req.user)) {
      if (isTeamMember(req.user)) {
        reminders = reminders.filter((reminder) => reminder.targetRole === "team_member" || reminder.targetUserId === req.user.id);
      } else if (isCa(req.user)) {
        reminders = reminders.filter((reminder) => reminder.targetRole === "ca" || reminder.targetUserId === req.user.id);
      } else {
        reminders = reminders.filter((reminder) => reminder.targetRole === "user" && reminder.targetUserId === req.user.id);
      }
    }

    res.json({ success: true, reminders, total: reminders.length });
  } catch (error) {
    return safeError(res, error, "Failed to load reminders");
  }
});

router.post("/process-due", authenticateToken, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const body = processDueSchema.parse(req.body || {});
    const result = await processDueReminders({ now: body.now });
    res.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: error.errors[0]?.message || "Invalid reminder payload" });
    }
    return safeError(res, error, "Failed to process due reminders");
  }
});

export default router;
