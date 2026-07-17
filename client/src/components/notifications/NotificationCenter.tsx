import { useState } from "react";
import { Bell, Check, AlertCircle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { m, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { getNotificationActionHref } from "@/lib/notification-navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: string;
  icon?: string;
  actionUrl?: string;
  metadata?: Record<string, unknown> | null;
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await apiRequest("/api/notifications");
      const data = await response.json();
      return Array.isArray(data) ? data : data.notifications ?? [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: "PATCH"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  // Mark all as read
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("/api/notifications/read-all", {
        method: "PATCH"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      toast({
        title: "Success",
        description: "All notifications marked as read"
      });
    }
  });

  // Delete notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const response = await apiRequest(`/api/notifications/${notificationId}`, {
        method: "DELETE"
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <Check className="w-4 h-4 text-green-600" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Info className="w-4 h-4 text-blue-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Open notifications" className="relative h-9 w-9 rounded-lg p-0 text-slate-600 hover:bg-slate-100">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px]">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={unreadCount === 0}
            >
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-slate-500">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500">No notifications yet</p>
              <p className="text-sm text-slate-400 mt-1">
                We'll notify you when something important happens
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {notifications.map((notification: Notification) => (
                <m.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className={`border-b last:border-0 ${
                    !notification.read ? "bg-blue-50" : ""
                  }`}
                >
                  <DropdownMenuItem
                    className="p-4 cursor-pointer hover:bg-slate-50 focus:bg-slate-50"
                    onClick={() => {
                      if (!notification.read) {
                        markAsReadMutation.mutate(notification.id);
                      }
                      const actionHref = getNotificationActionHref(notification);
                      if (actionHref) {
                        setIsOpen(false);
                        setLocation(actionHref);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm">
                              {notification.title}
                            </p>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 -mt-1 -mr-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotificationMutation.mutate(notification.id);
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-sm text-slate-600 mt-0.5">
                            {notification.message}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {formatTime(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </DropdownMenuItem>
                </m.div>
              ))}
            </AnimatePresence>
          )}
        </ScrollArea>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
