import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, HelpCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface FAQItem {
  id: string | number;
  question: string;
  answer: string;
  category?: string;
}

interface CollapsibleFAQProps {
  items: FAQItem[];
  title?: string;
  subtitle?: string;
  className?: string;
  defaultOpenIndex?: number;
  allowMultiple?: boolean;
  accentColor?: string;
}

export function CollapsibleFAQ({
  items,
  title = "Frequently Asked Questions",
  subtitle,
  className,
  defaultOpenIndex = -1,
  allowMultiple = false,
  accentColor = "blue"
}: CollapsibleFAQProps) {
  const [openItems, setOpenItems] = useState<Set<string | number>>(
    defaultOpenIndex >= 0 ? new Set([items[defaultOpenIndex]?.id]) : new Set()
  );

  const toggleItem = (itemId: string | number) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        if (!allowMultiple) {
          newSet.clear();
        }
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const colorClasses = {
    blue: {
      bg: "bg-blue-50",
      hover: "hover:bg-blue-100",
      text: "text-blue-900",
      icon: "text-blue-600",
      border: "border-blue-200"
    },
    purple: {
      bg: "bg-purple-50",
      hover: "hover:bg-purple-100",
      text: "text-purple-900",
      icon: "text-purple-600",
      border: "border-purple-200"
    },
    green: {
      bg: "bg-green-50",
      hover: "hover:bg-green-100",
      text: "text-green-900",
      icon: "text-green-600",
      border: "border-green-200"
    },
    orange: {
      bg: "bg-orange-50",
      hover: "hover:bg-orange-100",
      text: "text-orange-900",
      icon: "text-orange-600",
      border: "border-orange-200"
    }
  };

  const colors = colorClasses[accentColor as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn("w-full", className)}
    >
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12 px-4">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* FAQ Items */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {items.map((item, index) => {
          const isOpen = openItems.has(item.id);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Card 
                className={cn(
                  "overflow-hidden transition-all duration-200",
                  isOpen ? `${colors.bg} ${colors.border} border-2` : "hover:shadow-md"
                )}
              >
                <button
                  onClick={() => toggleItem(item.id)}
                  className={cn(
                    "w-full px-4 sm:px-6 py-4 flex items-center justify-between text-left transition-colors",
                    isOpen ? colors.bg : colors.hover
                  )}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                      isOpen ? colors.bg : "bg-gray-100"
                    )}>
                      <HelpCircle className={cn(
                        "w-4 h-4",
                        isOpen ? colors.icon : "text-gray-500"
                      )} />
                    </div>
                    <h3 className={cn(
                      "font-semibold text-sm sm:text-base md:text-lg pr-2 sm:pr-4",
                      isOpen ? colors.text : "text-gray-900"
                    )}>
                      {item.question}
                    </h3>
                  </div>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className={cn(
                      "w-5 h-5",
                      isOpen ? colors.icon : "text-gray-400"
                    )} />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      id={`faq-answer-${item.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CardContent className="px-4 sm:px-6 py-4 pl-12 sm:pl-16">
                        <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
                          {item.answer}
                        </p>
                        {item.category && (
                          <span className={cn(
                            "inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium",
                            colors.bg,
                            colors.text
                          )}>
                            {item.category}
                          </span>
                        )}
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Optional: Search or Filter */}
      {items.length > 10 && (
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Can't find what you're looking for?{" "}
            <a href="/expert-consultation" className={cn(
              "font-medium underline transition-colors",
              colors.text,
              `hover:${colors.text}`
            )}>
              Contact our support team
            </a>
          </p>
        </div>
      )}
    </motion.div>
  );
}