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
  Send, Shield, Eye, Edit3, Trash2, Loader2, ChevronRight
} from "lucide-react";
import SEO from "@/components/SEO";
import { Layout } from "@/components/admin/Layout";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

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
    <Layout>
      <SEO
        title="Team Collaboration | MyeCA.in"
        description="Collaborate with your team on tax filing and compliance"
        keywords="team collaboration, tax team, compliance team"
      />

      <div className="flex flex-col lg:flex-row gap-12 items-start bg-slate-50/50 rounded-[48px] p-2">
        {/* Sticky Left Summary Section */}
        <div className="lg:w-96 shrink-0 w-full space-y-6 lg:sticky lg:top-[112px]">
          <Card className="border-none shadow-sm rounded-[40px] bg-white overflow-hidden border border-slate-100/50">
             <div className="h-28 bg-gradient-to-br from-indigo-500 to-blue-600 relative">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
             </div>
             <CardContent className="relative px-6 pb-8">
                <div className="flex flex-col items-center -mt-14">
                   <div className="w-28 h-28 rounded-[40px] bg-white p-2 shadow-2xl">
                      <div className="w-full h-full rounded-[32px] bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-4xl font-black text-indigo-600 border border-indigo-100">
                         <Users className="h-10 w-10" />
                      </div>
                   </div>
                   <div className="mt-5 text-center">
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Collaboration Hub</h2>
                      <Badge variant="outline" className="mt-2 bg-emerald-50 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest px-2.5 py-0.5">
                         {teams.length} Active Teams
                      </Badge>
                   </div>
                </div>

                <div className="mt-10 space-y-3">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Directory</p>
                   {teamsLoading ? (
                      <div className="flex justify-center py-10">
                         <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                      </div>
                   ) : teams.length === 0 ? (
                      <div className="p-10 text-center bg-slate-50 rounded-[32px]">
                         <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Teams Found</p>
                      </div>
                   ) : (
                      teams.map((t: Team) => (
                        <div 
                           key={t.id}
                           onClick={() => setSelectedTeam(t.id)}
                           className={cn(
                              "flex items-center justify-between p-5 rounded-[32px] border transition-all cursor-pointer group shadow-sm",
                              selectedTeam === t.id ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" : "bg-white border-slate-100 hover:border-indigo-200"
                           )}
                        >
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                 "h-10 w-10 rounded-2xl flex items-center justify-center transition-colors",
                                 selectedTeam === t.id ? "bg-white/20 text-white" : "bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                              )}>
                                 <Users className="h-5 w-5" />
                              </div>
                              <div>
                                 <p className={cn("text-sm font-black leading-none mb-1", selectedTeam === t.id ? "text-white" : "text-slate-900")}>{t.name}</p>
                                 <p className={cn("text-[10px] font-black uppercase tracking-widest", selectedTeam === t.id ? "text-indigo-100" : "text-slate-400")}>{t.memberCount} Members</p>
                              </div>
                           </div>
                           <ChevronRight className={cn("h-4 w-4", selectedTeam === t.id ? "text-white" : "text-slate-200")} />
                        </div>
                      ))
                   )}
                </div>
             </CardContent>
          </Card>

          <Button 
             onClick={() => setIsCreateDialogOpen(true)}
             className="w-full h-16 rounded-[32px] bg-white border border-slate-100 text-slate-900 hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-sm transition-all hover:-translate-y-1"
          >
             <Plus className="h-5 w-5 mr-3 text-indigo-600" />
             Establish New Team
          </Button>
        </div>

        {/* Main Content Area - Full Page Scroll */}
        <div className="flex-1 min-w-0 w-full lg:max-w-7xl space-y-10 pb-20">
          {!selectedTeam ? (
             <div className="h-full flex flex-col items-center justify-center py-40 bg-white rounded-[48px] border border-slate-100/50 shadow-sm text-center px-10">
                <div className="h-32 w-32 rounded-[48px] bg-slate-50 flex items-center justify-center mb-10 border border-slate-100">
                   <Users className="h-14 w-14 text-slate-200" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">No Workspace Selected</h2>
                <p className="text-slate-500 max-w-md text-base font-medium leading-relaxed">
                   Select a collaboration unit from the directory or create a new team to begin shared compliance management.
                </p>
             </div>
          ) : teamLoading ? (
             <div className="h-full flex flex-col items-center justify-center py-40">
                <Loader2 className="h-16 w-16 animate-spin text-indigo-600" />
                <p className="mt-6 text-sm font-black text-slate-400 uppercase tracking-widest">Synchronizing Team Workspace...</p>
             </div>
          ) : (
             <div className="space-y-10">
                {/* Team Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-12 rounded-[48px] shadow-sm border border-slate-100/50">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 mb-2">
                       <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                       <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">{team?.type.replace('_', ' ')} Unit</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">{team?.name}</h1>
                    <p className="text-slate-500 max-w-2xl text-base font-medium leading-relaxed">
                       {team?.description || "A dedicated workspace for high-performance tax and compliance collaboration."}
                    </p>
                  </div>
                  <div className="flex gap-4">
                     {team?.userRole === "admin" && (
                        <>
                           <Button 
                              onClick={() => setIsInviteDialogOpen(true)}
                              className="h-16 px-10 rounded-3xl bg-slate-50 text-slate-900 hover:bg-slate-100 font-black text-xs uppercase tracking-widest border border-slate-100 transition-all shadow-sm"
                           >
                              <UserPlus className="h-5 w-5 mr-3" />
                              Invite Member
                           </Button>
                           <Button 
                              onClick={() => setIsTaskDialogOpen(true)}
                              className="h-16 px-10 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all hover:-translate-y-1"
                           >
                              <Plus className="h-5 w-5 mr-3" />
                              New Task
                           </Button>
                        </>
                     )}
                  </div>
                </div>

                <Tabs defaultValue="overview" className="space-y-10">
                   <TabsList className="h-16 p-2 bg-white rounded-[24px] shadow-sm border border-slate-100/50">
                     <TabsTrigger value="overview" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Strategic Overview</TabsTrigger>
                     <TabsTrigger value="tasks" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Operational Tasks</TabsTrigger>
                     <TabsTrigger value="members" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Unit Members</TabsTrigger>
                     <TabsTrigger value="activity" className="rounded-2xl px-8 h-full font-black text-[10px] uppercase tracking-widest data-[state=active]:bg-indigo-600 data-[state=active]:text-white">Audit Trail</TabsTrigger>
                   </TabsList>

                   <TabsContent value="overview" className="space-y-10 outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                         {[
                           { label: "Tasks Cleared", value: "12", icon: CheckSquare, color: "emerald", trend: "+12%" },
                           { label: "Pending Reviews", value: "05", icon: Clock, color: "amber", trend: "-2%" },
                           { label: "Unit Activity", value: "High", icon: Activity, color: "indigo", trend: "Steady" }
                         ].map((s, i) => (
                           <Card key={i} className="border-none shadow-sm rounded-[40px] bg-white p-8">
                              <div className="flex items-center justify-between mb-6">
                                 <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center", `bg-${s.color}-50 text-${s.color}-600`)}>
                                    <s.icon className="h-7 w-7" />
                                 </div>
                                 <Badge className={cn("border-none font-black text-[8px] uppercase px-2 py-0.5 rounded-full", s.trend.startsWith('+') ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-600")}>
                                    {s.trend}
                                 </Badge>
                              </div>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                              <p className="text-3xl font-black text-slate-900 tracking-tight">{s.value}</p>
                           </Card>
                         ))}
                      </div>

                      <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-12">
                         <CardHeader className="px-0 pt-0 pb-10">
                           <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Unit Metadata</CardTitle>
                           <CardDescription className="text-base font-medium text-slate-500">Core operational parameters for this team.</CardDescription>
                         </CardHeader>
                         <CardContent className="px-0">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Domain</p>
                                 <p className="text-lg font-black text-slate-900 leading-none capitalize">{team?.type.replace("_", " ")}</p>
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Force Strength</p>
                                 <p className="text-lg font-black text-slate-900 leading-none">{team?.memberCount} Experts</p>
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Operational Queue</p>
                                 <p className="text-lg font-black text-slate-900 leading-none">{team?.stats.activeTasks} Assignments</p>
                               </div>
                               <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 leading-none">Ledger Entries</p>
                                 <p className="text-lg font-black text-slate-900 leading-none">{team?.stats.totalNotes} Records</p>
                               </div>
                            </div>
                         </CardContent>
                      </Card>
                   </TabsContent>

                   <TabsContent value="tasks" className="outline-none">
                      <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50">
                        <CardHeader className="p-12 border-b border-slate-50">
                          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Assignment Queue</CardTitle>
                          <CardDescription className="text-base font-medium text-slate-500">Track and coordinate operational targets.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                          {tasks.length === 0 ? (
                            <div className="py-32 text-center bg-slate-50/20">
                               <CheckSquare className="h-16 w-16 text-slate-100 mx-auto mb-6" />
                               <p className="text-base font-black text-slate-400 uppercase tracking-widest">No active assignments</p>
                            </div>
                          ) : (
                            <div className="divide-y divide-slate-50">
                              {tasks.map((task: Task) => (
                                <div key={task.id} className="p-10 flex items-center justify-between hover:bg-blue-50/20 transition-colors group">
                                  <div className="flex items-start gap-6">
                                    <div className="h-14 w-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all">
                                      <CheckSquare className="h-7 w-7" />
                                    </div>
                                    <div>
                                      <h4 className="text-lg font-black text-slate-900 leading-none mb-3">{task.title}</h4>
                                      <div className="flex items-center gap-6">
                                         <Badge className={cn("border-none font-black text-[8px] uppercase px-3 py-1 rounded-full", `bg-${priorityColors[task.priority]}-50 text-${priorityColors[task.priority]}-600`)}>
                                            {task.priority} Priority
                                         </Badge>
                                         {task.dueDate && (
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                              <Calendar className="h-3 w-3" />
                                              Due {format(new Date(task.dueDate), "MMM dd")}
                                            </span>
                                         )}
                                      </div>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="h-10 px-6 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest">
                                    {task.status}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                   </TabsContent>

                   <TabsContent value="members" className="outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {team?.members.map((member: TeamMember) => {
                          const RoleIcon = roleIcons[member.role] || Users;
                          
                          return (
                            <Card key={member.userId} className="border-none shadow-sm rounded-[40px] bg-white p-8 group hover:shadow-xl transition-all border border-slate-100/50">
                               <div className="flex items-center justify-between mb-8">
                                  <Avatar className="h-16 w-16 rounded-[24px] border-4 border-slate-50">
                                    <AvatarImage src={member.user.avatar} />
                                    <AvatarFallback className="font-black text-xl bg-indigo-50 text-indigo-600">{member.user.name[0]}</AvatarFallback>
                                  </Avatar>
                                  <div className="h-12 w-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                     <RoleIcon className="h-6 w-6" />
                                  </div>
                               </div>
                               <div>
                                  <h4 className="text-xl font-black text-slate-900 leading-none mb-2">{member.user.name}</h4>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{member.user.email}</p>
                                  <Badge variant="outline" className="h-8 px-4 rounded-xl border-slate-100 font-black text-[9px] uppercase tracking-widest group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all">
                                    {member.role} Status
                                  </Badge>
                               </div>
                            </Card>
                          );
                        })}
                      </div>
                   </TabsContent>

                   <TabsContent value="activity" className="outline-none">
                      <Card className="border-none shadow-sm rounded-[48px] overflow-hidden bg-white border border-slate-100/50 p-12">
                        <CardHeader className="px-0 pt-0 pb-10">
                          <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Operational Log</CardTitle>
                          <CardDescription className="text-base font-medium text-slate-500">Verifiable history of unit interactions.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                          <div className="space-y-8 relative before:absolute before:left-7 before:top-2 before:bottom-2 before:w-px before:bg-slate-50">
                            {activities.map((activity: any) => (
                              <div key={activity.id} className="flex items-start gap-8 relative z-10">
                                <div className="h-14 w-14 bg-white border-4 border-slate-50 rounded-2xl flex items-center justify-center shadow-sm">
                                  <Activity className="h-6 w-6 text-slate-400" />
                                </div>
                                <div className="flex-1 pt-1">
                                  <p className="text-lg leading-none mb-2">
                                    <span className="font-black text-slate-900">{activity.userName}</span> 
                                    <span className="text-slate-500 font-medium mx-2">{activity.action}</span>
                                    {activity.target && <span className="font-black text-indigo-600"> "{activity.target}"</span>}
                                  </p>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {format(new Date(activity.timestamp), "MMM dd, yyyy • hh:mm a")}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                   </TabsContent>
                </Tabs>
             </div>
          )}
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
    </Layout>
  );
}
