import { Response, Router } from "express";
import crypto from "crypto";
import { authenticateToken, type AuthRequest } from "../middleware/auth.js";
import { adminDb } from "../data-admin.js";
import { isAdmin } from "../utils/access-control.js";
import { z } from "zod";

const router = Router();

const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(["tax_filing", "compliance", "consulting", "general"]),
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
  message: z.string().optional(),
});

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  clientId: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  type: z.enum(["tax_filing", "document_review", "compliance_check", "client_meeting", "other"]),
});

function requireUser(req: AuthRequest, res: Response) {
  if (!req.user?.id) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return req.user;
}

function memberFor(team: any, userId: string) {
  return (team.members || []).find((member: any) => member.userId === userId);
}

async function getTeamForUser(teamId: string, user: any): Promise<any | null> {
  const doc = await adminDb.collection("teams").doc(teamId).get();
  if (!doc.exists) return null;
  const team = { id: doc.id, ...(doc.data() as Record<string, any>) };
  if (isAdmin(user) || memberFor(team, user.id)) return team;
  return null;
}

function canAdminTeam(team: any, user: any) {
  if (isAdmin(user)) return true;
  return memberFor(team, user.id)?.role === "admin";
}

router.get("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const snapshot = await adminDb.collection("teams").get();
  const userTeams = snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, any>) }))
    .filter((team: any) => team.status !== "deleted" && (isAdmin(user) || memberFor(team, user.id)))
    .map((team: any) => ({
      ...team,
      memberCount: (team.members || []).length,
      userRole: memberFor(team, user.id)?.role ?? (isAdmin(user) ? "admin" : "viewer"),
    }));

  res.json({ success: true, backendStatus: "mixed", teams: userTeams });
});

router.post("/", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const teamData = createTeamSchema.parse(req.body);
    const now = new Date();
    const team = {
      ...teamData,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
      status: "active",
      members: [{ userId: user.id, role: "admin", joinedAt: now }],
      invitations: [],
      tasks: [],
      notes: [],
      activity: [{
        id: crypto.randomUUID(),
        type: "team_created",
        userId: user.id,
        action: "created team",
        timestamp: now,
      }],
    };

    const ref = await adminDb.collection("teams").add(team);
    res.json({ success: true, backendStatus: "mixed", team: { id: ref.id, ...team, memberCount: 1 } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Failed to create team" });
  }
});

router.get("/:teamId", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const team = await getTeamForUser(req.params.teamId, user);
  if (!team) return res.status(404).json({ error: "Team not found" });

  res.json({
    success: true,
    backendStatus: "mixed",
    team: {
      ...team,
      memberCount: (team.members || []).length,
      stats: {
        totalTasks: (team.tasks || []).length,
        activeTasks: (team.tasks || []).filter((task: any) => task.status !== "completed").length,
        totalNotes: (team.notes || []).length,
        recentActivity: team.updatedAt,
      },
    },
  });
});

router.post("/:teamId/invite", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const team = await getTeamForUser(req.params.teamId, user);
    if (!team) return res.status(404).json({ error: "Team not found" });
    if (!canAdminTeam(team, user)) return res.status(403).json({ error: "Only team admins can invite members" });

    const inviteData = inviteMemberSchema.parse(req.body);
    const invitation = {
      id: crypto.randomUUID(),
      teamId: req.params.teamId,
      ...inviteData,
      invitedBy: user.id,
      invitedAt: new Date(),
      status: "pending",
    };

    await adminDb.collection("teams").doc(req.params.teamId).update({
      invitations: [...(team.invitations || []), invitation],
      updatedAt: new Date(),
    });

    res.json({ success: true, invitation, message: `Invitation sent to ${inviteData.email}` });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

router.post("/:teamId/tasks", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = requireUser(req, res);
    if (!user) return;

    const team = await getTeamForUser(req.params.teamId, user);
    if (!team) return res.status(404).json({ error: "Team not found" });

    const taskData = taskSchema.parse(req.body);
    const task = {
      id: crypto.randomUUID(),
      teamId: req.params.teamId,
      ...taskData,
      createdBy: user.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "pending",
      completedAt: null,
    };

    await adminDb.collection("teams").doc(req.params.teamId).update({
      tasks: [...(team.tasks || []), task],
      updatedAt: new Date(),
    });

    res.json({ success: true, task });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: "Failed to create task" });
  }
});

router.get("/:teamId/tasks", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const team = await getTeamForUser(req.params.teamId, user);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const { status, assigneeId, priority } = req.query;
  let tasks = team.tasks || [];
  if (status) tasks = tasks.filter((task: any) => task.status === status);
  if (assigneeId) tasks = tasks.filter((task: any) => task.assigneeId === assigneeId);
  if (priority) tasks = tasks.filter((task: any) => task.priority === priority);

  res.json({ success: true, tasks });
});

router.patch("/:teamId/tasks/:taskId", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const team = await getTeamForUser(req.params.teamId, user);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const tasks = team.tasks || [];
  const taskIndex = tasks.findIndex((task: any) => task.id === req.params.taskId);
  if (taskIndex === -1) return res.status(404).json({ error: "Task not found" });

  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status: req.body.status ?? tasks[taskIndex].status,
    completedAt: req.body.status === "completed" ? new Date() : tasks[taskIndex].completedAt,
    updatedAt: new Date(),
  };

  await adminDb.collection("teams").doc(req.params.teamId).update({ tasks, updatedAt: new Date() });
  res.json({ success: true, task: tasks[taskIndex] });
});

router.post("/:teamId/notes", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const team = await getTeamForUser(req.params.teamId, user);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const note = {
    id: crypto.randomUUID(),
    teamId: req.params.teamId,
    title: req.body.title,
    content: req.body.content,
    clientId: req.body.clientId ?? null,
    tags: req.body.tags || [],
    createdBy: user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await adminDb.collection("teams").doc(req.params.teamId).update({
    notes: [...(team.notes || []), note],
    updatedAt: new Date(),
  });

  res.json({ success: true, note });
});

router.get("/:teamId/notes", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const team = await getTeamForUser(req.params.teamId, user);
  if (!team) return res.status(404).json({ error: "Team not found" });

  const { clientId, search } = req.query;
  let notes = team.notes || [];
  if (clientId) notes = notes.filter((note: any) => note.clientId === clientId);
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    notes = notes.filter((note: any) =>
      note.title?.toLowerCase().includes(searchTerm) ||
      note.content?.toLowerCase().includes(searchTerm),
    );
  }

  res.json({ success: true, notes });
});

router.get("/:teamId/activity", authenticateToken, async (req: AuthRequest, res: Response) => {
  const user = requireUser(req, res);
  if (!user) return;

  const team = await getTeamForUser(req.params.teamId, user);
  if (!team) return res.status(404).json({ error: "Team not found" });

  res.json({ success: true, activities: team.activity || [] });
});

export default router;
