import { Request, Response, Router } from "express";
import { authenticateToken } from "../middleware/auth";
import { z } from "zod";

const router = Router();

// Team schemas
const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  type: z.enum(["tax_filing", "compliance", "consulting", "general"])
});

const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(["admin", "member", "viewer"]),
  message: z.string().optional()
});

const taskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  assigneeId: z.number().optional(),
  clientId: z.number().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  type: z.enum(["tax_filing", "document_review", "compliance_check", "client_meeting", "other"])
});

// Mock storage
const teams = new Map<number, any>();
const teamMembers = new Map<number, any[]>();
const teamTasks = new Map<number, any[]>();
const teamNotes = new Map<number, any[]>();

// Initialize demo team
teams.set(1, {
  id: 1,
  name: "Tax Experts Team",
  description: "Main tax filing team",
  type: "tax_filing",
  createdBy: 1,
  createdAt: new Date(),
  memberCount: 3
});

teamMembers.set(1, [
  { userId: 1, role: "admin", joinedAt: new Date() },
  { userId: 2, role: "member", joinedAt: new Date() },
  { userId: 3, role: "viewer", joinedAt: new Date() }
]);

// Get user's teams
router.get("/", authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  
  // Get all teams where user is a member
  const userTeams: any[] = [];
  teams.forEach((team, teamId) => {
    const members = teamMembers.get(teamId) || [];
    if (members.some(m => m.userId === userId)) {
      userTeams.push({
        ...team,
        memberCount: members.length,
        userRole: members.find(m => m.userId === userId)?.role
      });
    }
  });
  
  res.json({
    success: true,
    teams: userTeams
  });
});

// Create team
router.post("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const teamData = createTeamSchema.parse(req.body);
    
    const teamId = teams.size + 1;
    const team = {
      id: teamId,
      ...teamData,
      createdBy: userId,
      createdAt: new Date(),
      memberCount: 1
    };
    
    teams.set(teamId, team);
    teamMembers.set(teamId, [{
      userId,
      role: "admin",
      joinedAt: new Date()
    }]);
    
    res.json({
      success: true,
      team
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to create team" });
  }
});

// Get team details
router.get("/:teamId", authenticateToken, (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamId);
  const team = teams.get(teamId);
  
  if (!team) {
    return res.status(404).json({ error: "Team not found" });
  }
  
  const members = teamMembers.get(teamId) || [];
  const tasks = teamTasks.get(teamId) || [];
  const notes = teamNotes.get(teamId) || [];
  
  // Mock user details
  const memberDetails = members.map(m => ({
    ...m,
    user: {
      id: m.userId,
      name: `User ${m.userId}`,
      email: `user${m.userId}@myeca.in`,
      avatar: null
    }
  }));
  
  res.json({
    success: true,
    team: {
      ...team,
      members: memberDetails,
      stats: {
        totalTasks: tasks.length,
        activeTasks: tasks.filter(t => t.status !== "completed").length,
        totalNotes: notes.length,
        recentActivity: new Date()
      }
    }
  });
});

// Invite team member
router.post("/:teamId/invite", authenticateToken, async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const userId = (req as any).user.id;
    const inviteData = inviteMemberSchema.parse(req.body);
    
    // Check if user is admin
    const members = teamMembers.get(teamId) || [];
    const userMember = members.find(m => m.userId === userId);
    
    if (!userMember || userMember.role !== "admin") {
      return res.status(403).json({ error: "Only team admins can invite members" });
    }
    
    // Mock invite - in real app would send email
    const invitation = {
      id: Date.now(),
      teamId,
      email: inviteData.email,
      role: inviteData.role,
      invitedBy: userId,
      invitedAt: new Date(),
      status: "pending"
    };
    
    res.json({
      success: true,
      invitation,
      message: `Invitation sent to ${inviteData.email}`
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to send invitation" });
  }
});

// Create team task
router.post("/:teamId/tasks", authenticateToken, async (req: Request, res: Response) => {
  try {
    const teamId = parseInt(req.params.teamId);
    const userId = (req as any).user.id;
    const taskData = taskSchema.parse(req.body);
    
    if (!teamTasks.has(teamId)) {
      teamTasks.set(teamId, []);
    }
    
    const tasks = teamTasks.get(teamId)!;
    const task = {
      id: tasks.length + 1,
      teamId,
      ...taskData,
      createdBy: userId,
      createdAt: new Date(),
      status: "pending",
      completedAt: null
    };
    
    tasks.push(task);
    
    res.json({
      success: true,
      task
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: "Failed to create task" });
  }
});

// Get team tasks
router.get("/:teamId/tasks", authenticateToken, (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamId);
  const { status, assigneeId, priority } = req.query;
  
  let tasks = teamTasks.get(teamId) || [];
  
  // Filter tasks
  if (status) {
    tasks = tasks.filter(t => t.status === status);
  }
  if (assigneeId) {
    tasks = tasks.filter(t => t.assigneeId === parseInt(assigneeId as string));
  }
  if (priority) {
    tasks = tasks.filter(t => t.priority === priority);
  }
  
  res.json({
    success: true,
    tasks
  });
});

// Update task status
router.patch("/:teamId/tasks/:taskId", authenticateToken, async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamId);
  const taskId = parseInt(req.params.taskId);
  const { status } = req.body;
  
  const tasks = teamTasks.get(teamId) || [];
  const taskIndex = tasks.findIndex(t => t.id === taskId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ error: "Task not found" });
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    status,
    completedAt: status === "completed" ? new Date() : null,
    updatedAt: new Date()
  };
  
  res.json({
    success: true,
    task: tasks[taskIndex]
  });
});

// Create team note
router.post("/:teamId/notes", authenticateToken, async (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamId);
  const userId = (req as any).user.id;
  const { title, content, clientId, tags } = req.body;
  
  if (!teamNotes.has(teamId)) {
    teamNotes.set(teamId, []);
  }
  
  const notes = teamNotes.get(teamId)!;
  const note = {
    id: notes.length + 1,
    teamId,
    title,
    content,
    clientId,
    tags: tags || [],
    createdBy: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  notes.push(note);
  
  res.json({
    success: true,
    note
  });
});

// Get team notes
router.get("/:teamId/notes", authenticateToken, (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamId);
  const { clientId, search } = req.query;
  
  let notes = teamNotes.get(teamId) || [];
  
  // Filter notes
  if (clientId) {
    notes = notes.filter(n => n.clientId === parseInt(clientId as string));
  }
  if (search) {
    const searchTerm = search.toString().toLowerCase();
    notes = notes.filter(n => 
      n.title.toLowerCase().includes(searchTerm) ||
      n.content.toLowerCase().includes(searchTerm)
    );
  }
  
  res.json({
    success: true,
    notes
  });
});

// Get team activity
router.get("/:teamId/activity", authenticateToken, (req: Request, res: Response) => {
  const teamId = parseInt(req.params.teamId);
  
  // Mock activity feed
  const activities = [
    {
      id: 1,
      type: "task_created",
      userId: 1,
      userName: "Admin User",
      action: "created task",
      target: "ITR Filing for Client ABC",
      timestamp: new Date()
    },
    {
      id: 2,
      type: "member_joined",
      userId: 2,
      userName: "CA Expert",
      action: "joined the team",
      timestamp: new Date(Date.now() - 3600000)
    },
    {
      id: 3,
      type: "note_added",
      userId: 1,
      userName: "Admin User",
      action: "added a note",
      target: "Tax optimization strategies",
      timestamp: new Date(Date.now() - 7200000)
    }
  ];
  
  res.json({
    success: true,
    activities
  });
});

export default router;