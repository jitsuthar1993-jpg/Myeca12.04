import React, { useMemo, useState } from "react";

interface KeyboardShortcut {
  key: string;
  modifiers?: ("ctrl" | "alt" | "shift" | "meta")[];
  description: string;
  action: () => void;
  category: "navigation" | "action" | "form" | "media" | "help" | string;
}

export const KeyboardShortcutsHelp: React.FC<{ shortcuts: KeyboardShortcut[] }> = ({ shortcuts }) => {
  const [isOpen, setIsOpen] = useState(false);

  const grouped = useMemo(() => {
    return shortcuts.reduce((acc, s) => {
      const key = s.category || "general";
      (acc[key] ||= []).push(s);
      return acc;
    }, {} as Record<string, KeyboardShortcut[]>);
  }, [shortcuts]);

  const formatShortcut = (s: KeyboardShortcut) => {
    const parts: string[] = [];
    if (s.modifiers?.length) {
      parts.push(
        ...s.modifiers.map((m) =>
          m === "meta" ? "Cmd" : m.charAt(0).toUpperCase() + m.slice(1)
        )
      );
    }
    parts.push(s.key);
    return parts.join(" + ");
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
        aria-label="Show keyboard shortcuts"
      >
        ⌨️ Shortcuts
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="kbd-help-title"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 id="kbd-help-title" className="text-lg font-semibold">Keyboard Shortcuts</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2 capitalize">{cat}</h3>
                  <div className="space-y-2">
                    {items.map((s, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-3">
                          <kbd className="px-2 py-1 bg-gray-800 text-white text-xs rounded">
                            {formatShortcut(s)}
                          </kbd>
                          <span className="text-sm text-gray-800">{s.description}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-gray-50 text-sm text-gray-600">
              Press Esc to close
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default KeyboardShortcutsHelp;

