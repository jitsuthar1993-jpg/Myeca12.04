import { useState } from "react";
import { m } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Users, Plus, UserPlus, CheckSquare, FileText, Activity,
  Calendar, AlertCircle, Clock, Star, MoreVertical,
  Send, Shield, Eye, Edit3, Trash2, Loader2
} from "lucide-react";
import SEO from "@/components/SEO";

interface Team {
  id: number;
  name: string;
  description?: string;
  type: string;
  memberCount: number;
  userRole: string;
  createdAt: string;
}

interface TeamMember {
  userId: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Task {
  id: number;
  title: string;
  description?: string;
  assigneeId?: number;
  dueDate?: string;
  priority: string;
  type: string;
  status: string;
  createdBy: number;
  createdAt: string;
}

const priorityColors: Record<string, string> = {
  low: "gray",
  medium: "yellow",
  high: "orange",
  urgent: "red"
};

const roleIcons: Record<string, any> = {
  admin: Shield,
  member: Users,
  viewer: Eye
};

export default function TeamsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState({ name: "", description: "", type: "general" });
  const [inviteData, setInviteData] = useState({ email: "", role: "member", message: "" });
  const [taskData, setTaskData] = useState({
    title: "",
    description: "",
    priority: "medium",
    type: "other",
    dueDate: ""
  });

  // Fetch teams
  const { data: teamsData, isLoading: teamsLoading } = useQuery<any>({
    queryKey: ["/api/teams"]
  });

  // Fetch selected team details
  const { data: teamData, isLoading: teamLoading } = useQuery<any>({
    queryKey: ["/api/teams", selectedTeam],
    queryFn: async () => (await apiRequest(`/api/teams/${selectedTeam}`)).json(),
    enabled: !!selectedTeam
  });

  // Fetch team tasks
  const { data: tasksData } = useQuery<any>({
    queryKey: ["/api/teams", selectedTeam, "tasks"],
    queryFn: async () => (await apiRequest(`/api/teams/${selectedTeam}/tasks`)).json(),
    enabled: !!selectedTeam
  });

  // Fetch team activity
  const { data: activityData } = useQuery<any>({
    queryKey: ["/api/teams", selectedTeam, "activity"],
    queryFn: async () => (await apiRequest(`/api/teams/${selectedTeam}/activity`)).json(),
    enabled: !!selectedTeam
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/teams", {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Team created successfully",
        description: "You can now invite members to your team."
      });
      setIsCreateDialogOpen(false);
      setNewTeam({ name: "", description: "", type: "general" });
    }
  });

  // Invite member mutation
  const inviteMemberMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/teams/${selectedTeam}/invite`, {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      toast({
        title: "Invitation sent",
        description: `Invitation sent to ${inviteData.email}`
      });
      setIsInviteDialogOpen(false);
      setInviteData({ email: "", role: "member", message: "" });
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest(`/api/teams/${selectedTeam}/tasks`, {
      method: "POST",
      body: JSON.stringify(data)
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams", selectedTeam, "tasks"] });
      toast({
        title: "Task created",
        description: "The task has been assigned to the team."
      });
      setIsTaskDialogOpen(false);
      setTaskData({ title: "", description: "", priority: "medium", type: "other", dueDate: "" });
    }
  });

  const teams = teamsData?.teams || [];
  const team = teamData?.team;
  const tasks = tasksData?.tasks || [];
  const activities = activityData?.activities || [];

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <SEO
        title="Team Collaboration | MyeCA.in"
        description="Collaborate with your team on tax filing and compliance"
        keywords="team collaboration, tax team, compliance team"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <m.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Team Collaboration</h1>
            <p className="text-xl text-gray-600">Work together on client accounts and tax filing</p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Team
          </Button>
        </m.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Your Teams</CardTitle>
                <CardDescription>Select a team to view details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {teamsLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : teams.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No teams yet</p>
                ) : (
                  teams.map((team: Team) => (
                    <m.div
                      key={team.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        className={`cursor-pointer transition-all ${
                          selectedTeam === team.id ? "ring-2 ring-blue-600" : ""
                        }`}
                        onClick={() => setSelectedTeam(team.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{team.name}</h4>
                              <p className="text-sm text-gray-500">{team.memberCount} members</p>
                            </div>
                            <Badge variant={team.userRole === "admin" ? "default" : "secondary"}>
                              {team.userRole}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </m.div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-3">
            {!selectedTeam ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-96">
                  <Users className="h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-gray-500">Select a team to view details</p>
                </CardContent>
              </Card>
            ) : teamLoading ? (
              <div className="flex justify-center h-96">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </div>
            ) : (
              <Tabs defaultValue="overview" className="space-y-6">
                <div className="flex items-center justify-between">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="tasks">Tasks</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                    <TabsTrigger value="activity">Activity</TabsTrigger>
                  </TabsList>
                  
                  {team?.userRole === "admin" && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setIsInviteDialogOpen(true)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                      <Button size="sm" onClick={() => setIsTaskDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </div>
                  )}
                </div>

                <TabsContent value="overview">
                  <div className="grid gap-6">
                    {/* Team Info */}
                    <Card>
                      <CardHeader>
                        <CardTitle>{team?.name}</CardTitle>
                        <CardDescription>{team?.description || "No description"}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Type</p>
                            <p className="font-medium capitalize">{team?.type.replace("_", " ")}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Members</p>
                            <p className="font-medium">{team?.memberCount}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Active Tasks</p>
                            <p className="font-medium">{team?.stats.activeTasks}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Total Notes</p>
                            <p className="font-medium">{team?.stats.totalNotes}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Tasks This Week</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <CheckSquare className="h-8 w-8 text-green-600" />
                            <span className="text-2xl font-bold">12</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Pending Reviews</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Clock className="h-8 w-8 text-orange-600" />
                            <span className="text-2xl font-bold">5</span>
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-gray-600">Team Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-2">
                            <Activity className="h-8 w-8 text-blue-600" />
                            <span className="text-2xl font-bold">High</span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="tasks">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Tasks</CardTitle>
                      <CardDescription>Track and manage team assignments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {tasks.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">No tasks assigned yet</p>
                      ) : (
                        <div className="space-y-4">
                          {tasks.map((task: Task) => (
                            <div key={task.id} className="flex items-start justify-between p-4 border rounded-lg">
                              <div className="flex items-start gap-3">
                                <CheckSquare className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                  <h4 className="font-medium">{task.title}</h4>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-2">
                                    <Badge 
                                      variant="secondary" 
                                      className={`bg-${priorityColors[task.priority]}-100 text-${priorityColors[task.priority]}-700`}
                                    >
                                      {task.priority}
                                    </Badge>
                                    {task.dueDate && (
                                      <span className="text-sm text-gray-500 flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(task.dueDate).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge variant={task.status === "completed" ? "default" : "outline"}>
                                {task.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="members">
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Members</CardTitle>
                      <CardDescription>Manage team members and permissions</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {team?.members.map((member: TeamMember) => {
                          const RoleIcon = roleIcons[member.role] || Users;
                          
                          return (
                            <div key={member.userId} className="flex items-center justify-between p-4 border rounded-lg">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={member.user.avatar} />
                                  <AvatarFallback>{member.user.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <h4 className="font-medium">{member.user.name}</h4>
                                  <p className="text-sm text-gray-500">{member.user.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="gap-1">
                                  <RoleIcon className="h-3 w-3" />
                                  {member.role}
                                </Badge>
                                {team.userRole === "admin" && member.userId !== 1 && (
                                  <Button variant="ghost" size="icon">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity">
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Track team actions and updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {activities.map((activity: any) => (
                          <div key={activity.id} className="flex items-start gap-3">
                            <div className="bg-gray-100 p-2 rounded-full">
                              <Activity className="h-4 w-4 text-gray-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm">
                                <span className="font-medium">{activity.userName}</span> {activity.action}
                                {activity.target && <span className="font-medium"> "{activity.target}"</span>}
                              </p>
                              <p className="text-xs text-gray-500">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </div>

      {/* Create Team Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Team</DialogTitle>
            <DialogDescription>Set up a new team for collaboration</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="team-name">Team Name</Label>
              <Input
                id="team-name"
                value={newTeam.name}
                onChange={(e) => setNewTeam(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Tax Experts Team"
              />
            </div>
            <div>
              <Label htmlFor="team-description">Description</Label>
              <Textarea
                id="team-description"
                value={newTeam.description}
                onChange={(e) => setNewTeam(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the team's purpose"
              />
            </div>
            <div>
              <Label htmlFor="team-type">Team Type</Label>
              <Select value={newTeam.type} onValueChange={(value) => setNewTeam(prev => ({ ...prev, type: value }))}>
                <SelectTrigger id="team-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tax_filing">Tax Filing</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createTeamMutation.mutate(newTeam)}
                disabled={!newTeam.name || createTeamMutation.isPending}
              >
                {createTeamMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Team"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>Send an invitation to join your team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                value={inviteData.email}
                onChange={(e) => setInviteData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="colleague@example.com"
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData(prev => ({ ...prev, role: value }))}>
                <SelectTrigger id="invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invite-message">Message (Optional)</Label>
              <Textarea
                id="invite-message"
                value={inviteData.message}
                onChange={(e) => setInviteData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Add a personal message to the invitation"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => inviteMemberMutation.mutate(inviteData)}
                disabled={!inviteData.email || inviteMemberMutation.isPending}
              >
                {inviteMemberMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Task</DialogTitle>
            <DialogDescription>Assign a new task to the team</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="task-title">Task Title</Label>
              <Input
                id="task-title"
                value={taskData.title}
                onChange={(e) => setTaskData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Review ITR filing for Client ABC"
              />
            </div>
            <div>
              <Label htmlFor="task-description">Description</Label>
              <Textarea
                id="task-description"
                value={taskData.description}
                onChange={(e) => setTaskData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Task details and requirements"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="task-priority">Priority</Label>
                <Select value={taskData.priority} onValueChange={(value) => setTaskData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger id="task-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="task-type">Type</Label>
                <Select value={taskData.type} onValueChange={(value) => setTaskData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger id="task-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tax_filing">Tax Filing</SelectItem>
                    <SelectItem value="document_review">Document Review</SelectItem>
                    <SelectItem value="compliance_check">Compliance Check</SelectItem>
                    <SelectItem value="client_meeting">Client Meeting</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="task-due">Due Date</Label>
              <Input
                id="task-due"
                type="date"
                value={taskData.dueDate}
                onChange={(e) => setTaskData(prev => ({ ...prev, dueDate: e.target.value }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
              <Button 
                onClick={() => createTaskMutation.mutate(taskData)}
                disabled={!taskData.title || createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
