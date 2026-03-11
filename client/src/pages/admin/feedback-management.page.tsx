import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Trash2,
  Send,
} from "lucide-react";
import { format } from "date-fns";

interface Feedback {
  id: number;
  name?: string;
  email?: string;
  type: string;
  category?: string;
  subject: string;
  message: string;
  rating?: number;
  status: string;
  priority: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
}

export default function AdminFeedbackManagement() {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [responseText, setResponseText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch feedback
  const { data: feedbackData, isLoading } = useQuery({
    queryKey: ["/api/admin/feedback", statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (typeFilter !== "all") params.append("type", typeFilter);
      
      const response = await apiRequest(`/api/admin/feedback?${params}`);
      return response.json();
    },
  });

  // Fetch stats
  const { data: stats } = useQuery({
    queryKey: ["/api/admin/feedback/stats"],
    queryFn: async () => {
      const response = await apiRequest("/api/admin/feedback/stats");
      return response.json();
    },
  });

  // Update feedback mutation
  const updateFeedback = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest(`/api/admin/feedback/${id}`, {
        method: "PUT",
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback/stats"] });
      toast({
        title: "Success",
        description: "Feedback updated successfully",
      });
      setSelectedFeedback(null);
      setResponseText("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update feedback",
        variant: "destructive",
      });
    },
  });

  // Delete feedback mutation
  const deleteFeedback = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/admin/feedback/${id}`, {
        method: "DELETE"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/feedback/stats"] });
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete feedback",
        variant: "destructive",
      });
    },
  });

  const handleResponse = () => {
    if (!selectedFeedback || !responseText) return;

    updateFeedback.mutate({
      id: selectedFeedback.id,
      status: "resolved",
      response: responseText,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "in-progress":
        return <AlertCircle className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "bug":
        return "bg-red-100 text-red-800";
      case "feature":
        return "bg-purple-100 text-purple-800";
      case "general":
        return "bg-blue-100 text-blue-800";
      case "complaint":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Feedback Management</h1>
        <p className="text-gray-600 mt-2">
          View and respond to user feedback
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Feedback</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{stats?.byStatus?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold">{stats?.byStatus?.resolved || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">{stats?.avgRating ? stats.avgRating.toFixed(1) : '0.0'}</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </Card>
          
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Bug Reports</p>
                <p className="text-2xl font-bold">{stats?.byType?.bug || 0}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="bug">Bug Reports</SelectItem>
            <SelectItem value="feature">Feature Requests</SelectItem>
            <SelectItem value="general">General Feedback</SelectItem>
            <SelectItem value="complaint">Complaints</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feedback Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading feedback...
                </TableCell>
              </TableRow>
            ) : feedbackData?.feedback?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  No feedback found
                </TableCell>
              </TableRow>
            ) : (
              feedbackData?.feedback?.map((feedback: Feedback) => (
                <TableRow key={feedback.id}>
                  <TableCell className="text-sm">
                    {format(new Date(feedback.createdAt), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{feedback.name || "Anonymous"}</p>
                      <p className="text-sm text-gray-500">{feedback.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(feedback.type)}>
                      {feedback.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {feedback.subject}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(feedback.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(feedback.status)}
                        {feedback.status}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(feedback.priority)}>
                      {feedback.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {feedback.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{feedback.rating}</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedFeedback(feedback)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteFeedback.mutate(feedback.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Feedback Detail Dialog */}
      <Dialog open={!!selectedFeedback} onOpenChange={() => setSelectedFeedback(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Feedback Details</DialogTitle>
            <DialogDescription>
              Review and respond to user feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedFeedback && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">From</p>
                  <p className="font-medium">{selectedFeedback.name || "Anonymous"}</p>
                  <p className="text-sm text-gray-500">{selectedFeedback.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date</p>
                  <p>{format(new Date(selectedFeedback.createdAt), "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Badge className={getTypeColor(selectedFeedback.type)}>
                  {selectedFeedback.type}
                </Badge>
                {selectedFeedback.category && (
                  <Badge variant="outline">{selectedFeedback.category}</Badge>
                )}
                <Badge className={getPriorityColor(selectedFeedback.priority)}>
                  {selectedFeedback.priority}
                </Badge>
                {selectedFeedback.rating && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {selectedFeedback.rating}
                  </Badge>
                )}
              </div>
              
              <div>
                <p className="font-medium mb-1">Subject</p>
                <p className="text-gray-700">{selectedFeedback.subject}</p>
              </div>
              
              <div>
                <p className="font-medium mb-1">Message</p>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedFeedback.message}</p>
              </div>
              
              {selectedFeedback.response && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-1">Previous Response</p>
                  <p className="text-gray-700">{selectedFeedback.response}</p>
                  {selectedFeedback.respondedAt && (
                    <p className="text-sm text-gray-500 mt-2">
                      Responded on {format(new Date(selectedFeedback.respondedAt), "MMM d, yyyy")}
                    </p>
                  )}
                </div>
              )}
              
              <div className="space-y-2">
                <p className="font-medium">Update Status</p>
                <div className="flex gap-2">
                  <Select
                    value={selectedFeedback.status}
                    onValueChange={(value) =>
                      updateFeedback.mutate({
                        id: selectedFeedback.id,
                        status: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={selectedFeedback.priority}
                    onValueChange={(value) =>
                      updateFeedback.mutate({
                        id: selectedFeedback.id,
                        priority: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-48">
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
              </div>
              
              <div className="space-y-2">
                <p className="font-medium">Send Response</p>
                <Textarea
                  placeholder="Type your response here..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  className="min-h-[100px]"
                />
                <Button
                  onClick={handleResponse}
                  disabled={!responseText || updateFeedback.isPending}
                  className="w-full"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send Response
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}