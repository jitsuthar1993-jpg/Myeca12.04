import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { 
  Search, Home, Calculator, FileText, Settings, HelpCircle,
  Command, ArrowUp, ArrowDown, CornerDownLeft, X
} from "lucide-react";
import { motion } from "framer-motion";

interface Shortcut {
  keys: string[];
  description: string;
  icon?: React.ElementType;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ["Ctrl", "K"], description: "Open global search", icon: Search, category: "navigation" },
  { keys: ["Alt", "H"], description: "Go to home page", icon: Home, category: "navigation" },
  { keys: ["Alt", "S"], description: "Go to services", icon: FileText, category: "navigation" },
  { keys: ["Alt", "C"], description: "Go to calculators", icon: Calculator, category: "navigation" },
  { keys: ["Alt", "A"], description: "Go to analytics", category: "navigation" },
  { keys: ["Alt", "P"], description: "Go to pricing", category: "navigation" },
  { keys: ["Escape"], description: "Close modal/dialog", icon: X, category: "navigation" },
  
  // Search
  { keys: ["↑", "↓"], description: "Navigate search results", category: "search" },
  { keys: ["Enter"], description: "Select search result", icon: CornerDownLeft, category: "search" },
  { keys: ["Escape"], description: "Close search", icon: X, category: "search" },
  
  // Actions
  { keys: ["Ctrl", "S"], description: "Save progress", category: "actions" },
  { keys: ["Ctrl", "P"], description: "Print page", category: "actions" },
  { keys: ["Ctrl", "D"], description: "Download data", category: "actions" },
  { keys: ["Ctrl", "N"], description: "Create new profile", category: "actions" },
  
  // Help
  { keys: ["?"], description: "Show keyboard shortcuts", icon: HelpCircle, category: "help" },
  { keys: ["Alt", "F1"], description: "Open help center", category: "help" },
  { keys: ["Alt", "F2"], description: "Open chat support", category: "help" },
];

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const categories = {
    navigation: shortcuts.filter(s => s.category === "navigation"),
    search: shortcuts.filter(s => s.category === "search"),
    actions: shortcuts.filter(s => s.category === "actions"),
    help: shortcuts.filter(s => s.category === "help"),
  };

  const getOSKey = () => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    return isMac ? "Cmd" : "Ctrl";
  };

  const formatKey = (key: string) => {
    if (key === "Ctrl") return getOSKey();
    return key;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Command className="h-6 w-6" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="all" className="mt-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="actions">Actions</TabsTrigger>
            <TabsTrigger value="help">Help</TabsTrigger>
          </TabsList>

          <div className="mt-6 overflow-y-auto max-h-[50vh]">
            <TabsContent value="all" className="space-y-4">
              <ShortcutSection title="Navigation" shortcuts={categories.navigation} formatKey={formatKey} />
              <ShortcutSection title="Search" shortcuts={categories.search} formatKey={formatKey} />
              <ShortcutSection title="Actions" shortcuts={categories.actions} formatKey={formatKey} />
              <ShortcutSection title="Help" shortcuts={categories.help} formatKey={formatKey} />
            </TabsContent>

            <TabsContent value="navigation">
              <ShortcutSection shortcuts={categories.navigation} formatKey={formatKey} />
            </TabsContent>

            <TabsContent value="search">
              <ShortcutSection shortcuts={categories.search} formatKey={formatKey} />
            </TabsContent>

            <TabsContent value="actions">
              <ShortcutSection shortcuts={categories.actions} formatKey={formatKey} />
            </TabsContent>

            <TabsContent value="help">
              <ShortcutSection shortcuts={categories.help} formatKey={formatKey} />
            </TabsContent>
          </div>
        </Tabs>

        <div className="mt-6 pt-4 border-t text-center text-sm text-gray-600">
          Press <kbd className="px-2 py-1 bg-gray-200 rounded text-xs">?</kbd> anytime to view shortcuts
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ShortcutSectionProps {
  title?: string;
  shortcuts: Shortcut[];
  formatKey: (key: string) => string;
}

function ShortcutSection({ title, shortcuts, formatKey }: ShortcutSectionProps) {
  return (
    <div>
      {title && <h3 className="font-semibold text-lg mb-3">{title}</h3>}
      <div className="space-y-2">
        {shortcuts.map((shortcut, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {shortcut.icon && (
                    <div className="p-1.5 bg-blue-100 rounded">
                      <shortcut.icon className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                  <span className="text-gray-700">{shortcut.description}</span>
                </div>
                <div className="flex items-center gap-1">
                  {shortcut.keys.map((key, keyIndex) => (
                    <span key={keyIndex} className="flex items-center">
                      <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">
                        {formatKey(key)}
                      </kbd>
                      {keyIndex < shortcut.keys.length - 1 && (
                        <span className="mx-1 text-gray-400">+</span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}