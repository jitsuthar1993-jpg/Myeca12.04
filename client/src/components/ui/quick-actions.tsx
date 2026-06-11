import { m } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  FileText,
  Upload,
  Bot,
  TrendingUp,
  Clock,
  Zap,
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Link } from "wouter";

const quickActions = [
  {
    id: "calculate-tax",
    title: "Calculate Tax",
    description: "Estimate your tax liability",
    icon: Calculator,
    href: "/calculators/income-tax",
    color: "bg-blue-500",
    gradient: "from-blue-500 to-blue-600",
    priority: "high",
    estimatedTime: "2 min"
  },
  {
    id: "file-itr",
    title: "File ITR",
    description: "Start your income tax return filing",
    icon: FileText,
    href: "/which-itr-form-to-file?source=quick_actions",
    color: "bg-green-500",
    gradient: "from-green-500 to-green-600",
    priority: "high",
    estimatedTime: "15 min"
  },
  {
    id: "upload-docs",
    title: "Upload Documents",
    description: "Add Form 16 and investment proofs",
    icon: Upload,
    href: "/documents",
    color: "bg-purple-500",
    gradient: "from-[#475569] to-[#334155]",
    priority: "medium",
    estimatedTime: "5 min"
  },
  {
    id: "ai-assistant",
    title: "Ask AI Assistant",
    description: "Get guided tax support",
    icon: Bot,
    href: "/advanced-features",
    color: "bg-orange-500",
    gradient: "from-orange-500 to-orange-600",
    priority: "new",
    estimatedTime: "1 min"
  },
  {
    id: "analytics",
    title: "Tax Analytics",
    description: "View detailed tax insights",
    icon: TrendingUp,
    href: "/analytics",
    color: "bg-brand-600",
    gradient: "from-brand-600 to-brand-700",
    priority: "medium",
    estimatedTime: "3 min"
  }
];

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "high":
      return <Badge variant="destructive" className="text-xs">Urgent</Badge>;
    case "new":
      return <Badge className="bg-amber-400 text-white text-xs">New</Badge>;
    case "medium":
      return <Badge variant="secondary" className="text-xs">Important</Badge>;
    default:
      return null;
  }
};

export default function QuickActions() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900 ">
          Quick Actions
        </h3>
        <Zap className="h-5 w-5 text-yellow-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((action, index) => (
          <m.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link href={action.href}>
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50  ">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient}`}>
                      <action.icon className="h-5 w-5 text-white" />
                    </div>
                    {getPriorityBadge(action.priority)}
                  </div>

                  <h4 className="font-semibold text-slate-900  mb-1">
                    {action.title}
                  </h4>

                  <p className="text-sm text-slate-600  mb-3">
                    {action.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-slate-500 ">
                      <Clock className="h-3 w-3 mr-1" />
                      {action.estimatedTime}
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </m.div>
        ))}
      </div>

      {/* Smart Suggestions */}
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6"
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50   border-0">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <h4 className="font-semibold text-slate-900  text-sm">
                Smart Suggestion
              </h4>
            </div>
            <p className="text-sm text-slate-700  mb-3">
              Based on your profile, you could save ₹15,600 by optimizing deductions under Section 80C and 80D.
            </p>
            <Link href="/calculators/tax-regime">
              <Button size="sm" className="bg-brand-600 hover:bg-brand-700">
                Optimize Tax →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </m.div>
    </div>
  );
}
