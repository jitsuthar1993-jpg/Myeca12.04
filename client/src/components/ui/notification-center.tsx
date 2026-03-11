import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  Calendar,
  FileText,
  Coins,
  Clock,
  Archive,
  MarkAsUnread
} from "lucide-react";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: "info" | "warning" | "success" | "reminder";
  title: string;
  message: string;
  actionLabel?: string;
  actionUrl?: string;
  timestamp: Date;
  read: boolean;
  category: "tax" | "filing" | "document" | "system";
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "warning",
    title: "ITR Filing Deadline Approaching",
    message: "You have 15 days left to file your ITR for AY 2024-25. Don't miss the deadline!",
    actionLabel: "File Now",
    actionUrl: "/itr/form-selector",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    read: false,
    category: "filing"
  },
  {
    id: "2",
    type: "info",
    title: "New Tax Regime Benefits",
    message: "Based on your profile, you could save \u20B912,500 by switching to the new tax regime.",
    actionLabel: "Compare",
    actionUrl: "/calculators/tax-regime",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    read: false,
    category: "tax"
  },
  {
    id: "3",
    type: "success",
    title: "Form 16 Uploaded Successfully",
    message: "Your Form 16 has been processed and data is ready for ITR filing.",
    actionLabel: "View Details",
    actionUrl: "/documents",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    read: true,
    category: "document"
  },
  {
    id: "4",
    type: "reminder",
    title: "Missing Documents",
    message: "Upload your investment proofs to claim 80C deductions worth up to \u20B91,50,000.",
    actionLabel: "Upload",
    actionUrl: "/documents",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    read: true,
    category: "document"
  },
  {
    id: "5",
    type: "info",
    title: "AI Assistant Available",
    message: "Get instant answers to your tax questions with our new AI assistant.",
    actionLabel: "Try Now",
    actionUrl: "/advanced-features",
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    read: true,
    category: "system"
  }
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "warning": return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "success": return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "reminder": return <Clock className="h-5 w-5 text-blue-500" />;
    default: return <Info className="h-5 w-5 text-blue-500" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case "tax": return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "filing": return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
    case "document": return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    case "system": return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    default: return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

const formatNotificationTime = (timestamp: Date) => {
  if (isToday(timestamp)) {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  } else if (isYesterday(timestamp)) {
    return `Yesterday at ${format(timestamp, "HH:mm")}`;
  } else {
    return format(timestamp, "MMM d, yyyy 'at' HH:mm");
  }
};

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "unread") return !notification.read;
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Notification Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute right-0 top-12 z-50 w-96 max-h-96"
            >
              <Card className="shadow-xl border-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Notifications</CardTitle>
                    <div className="flex items-center gap-2">
                      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <Button
                          variant={filter === "all" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFilter("all")}
                          className="px-3 py-1 text-xs"
                        >
                          All
                        </Button>
                        <Button
                          variant={filter === "unread" ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setFilter("unread")}
                          className="px-3 py-1 text-xs"
                        >
                          Unread
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsOpen(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {unreadCount > 0 && (
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {unreadCount} unread notifications
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={markAllAsRead}
                        className="text-xs"
                      >
                        Mark all read
                      </Button>
                    </div>
                  )}
                </CardHeader>

                <ScrollArea className="max-h-80">
                  <CardContent className="p-0">
                    {filteredNotifications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="h-12 w-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm">
                          {filter === "unread" ? "No unread notifications" : "No notifications"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-0">
                        {filteredNotifications.map((notification) => (
                          <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 border-b last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              !notification.read ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                            }`}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-0.5">
                                {getNotificationIcon(notification.type)}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {notification.title}
                                  </h4>
                                  <div className="flex items-center gap-1 ml-2">
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => dismissNotification(notification.id)}
                                      className="p-1 h-auto opacity-0 group-hover:opacity-100"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {notification.message}
                                </p>
                                
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="secondary" className={`text-xs ${getCategoryColor(notification.category)}`}>
                                      {notification.category}
                                    </Badge>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      {formatNotificationTime(notification.timestamp)}
                                    </span>
                                  </div>
                                  
                                  {notification.actionLabel && notification.actionUrl && (
                                    <a
                                      href={notification.actionUrl}
                                      onClick={() => {
                                        markAsRead(notification.id);
                                        setIsOpen(false);
                                      }}
                                    >
                                      <Button variant="outline" size="sm" className="text-xs">
                                        {notification.actionLabel}
                                      </Button>
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </ScrollArea>

                {notifications.length > 0 && (
                  <div className="border-t p-3">
                    <Button variant="ghost" size="sm" className="w-full text-xs">
                      <Archive className="h-4 w-4 mr-2" />
                      View All Notifications
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}