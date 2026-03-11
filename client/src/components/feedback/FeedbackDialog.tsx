import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/components/AuthProvider";
import { Loader2, Star, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const feedbackSchema = z.object({
  type: z.enum(["bug", "feature", "general", "complaint"]),
  category: z.string().optional(),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  rating: z.number().min(1).max(5).optional(),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FeedbackDialog({ open, onOpenChange }: FeedbackDialogProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      type: "general",
      rating: 0,
      email: user?.email || "",
      name: user ? `${user.firstName} ${user.lastName}` : "",
    },
  });

  const submitFeedback = useMutation({
    mutationFn: async (data: FeedbackFormData) => {
      const browserInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      };

      const feedbackData = {
        ...data,
        userId: user?.id,
        browserInfo,
      };

      const response = await apiRequest("/api/feedback", {
        method: "POST",
        body: JSON.stringify(feedbackData),
      });
      return response.json();
    },
    onSuccess: () => {
      setSubmitted(true);
      setTimeout(() => {
        onOpenChange(false);
        form.reset();
        setRating(0);
        setSubmitted(false);
      }, 3000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FeedbackFormData) => {
    submitFeedback.mutate({ ...data, rating });
  };

  const getCategoryOptions = (type: string) => {
    switch (type) {
      case "bug":
        return ["UI/UX", "Performance", "Functionality", "Security", "Other"];
      case "feature":
        return ["New Feature", "Enhancement", "Integration", "Mobile", "Other"];
      case "general":
        return ["Suggestion", "Question", "Praise", "Other"];
      case "complaint":
        return ["Service", "Support", "Technical", "Billing", "Other"];
      default:
        return [];
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white text-gray-900 border-gray-200">
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <DialogHeader>
                <DialogTitle className="text-gray-900">Send Us Your Feedback</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Help us improve MyeCA.in by sharing your thoughts.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Feedback Type</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            form.setValue("category", undefined);
                          }}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select feedback type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="bug">🐛 Report a Bug</SelectItem>
                            <SelectItem value="feature">✨ Feature Request</SelectItem>
                            <SelectItem value="general">💬 General Feedback</SelectItem>
                            <SelectItem value="complaint">⚠️ Complaint</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {form.watch("type") && (
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {getCategoryOptions(form.watch("type")).map((cat) => (
                                <SelectItem key={cat} value={cat.toLowerCase()}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  {!user && (
                    <>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email (Optional)</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="your@email.com" {...field} />
                            </FormControl>
                            <FormDescription>
                              We'll use this to follow up on your feedback
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief summary of your feedback" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Please provide detailed feedback..."
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel className="text-gray-700">Rate Your Experience (Optional)</FormLabel>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-105 transition-transform"
                        >
                          <Star
                            className={`h-5 w-5 ${
                              star <= rating
                                ? "fill-blue-500 text-blue-500"
                                : "text-gray-300 hover:text-gray-400"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onOpenChange(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={submitFeedback.isPending}
                      className="flex-1"
                    >
                      {submitFeedback.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Feedback"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              </motion.div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Thank You!</h3>
              <p className="text-gray-600">
                Your feedback has been received. We appreciate you taking the time to help us improve.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}