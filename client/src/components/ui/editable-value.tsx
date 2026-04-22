import { useState, useRef, useCallback, KeyboardEvent } from "react";

interface EditableValueProps {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  format?: "currency" | "percent" | "years";
}

export function EditableValue({ 
  value, 
  onChange, 
  min, 
  max, 
  colorClass, 
  bgClass, 
  borderClass,
  format = "currency"
}: EditableValueProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const fmt = (n: number) => {
    if (format === "percent") return `${n}%`;
    if (format === "years") return `${n} Yrs`;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(n);
  };

  const startEdit = () => {
    setDraft(String(value));
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  };

  const commit = useCallback(() => {
    // If percent, allow floats. Otherwise ints.
    const rawVal = format === "percent" ? draft.replace(/[^0-9.]/g, "") : draft.replace(/[^0-9]/g, "");
    const parsed = format === "percent" ? parseFloat(rawVal) : parseInt(rawVal, 10);
    
    if (!isNaN(parsed)) {
      onChange(Math.max(min, Math.min(max, parsed)));
    }
    setEditing(false);
  }, [draft, onChange, min, max, format]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { 
          if (e.key === "Enter") commit(); 
          if (e.key === "Escape") setEditing(false); 
        }}
        className={`w-28 text-xs font-bold tabular-nums ${colorClass} ${bgClass} px-2.5 py-0.5 rounded-md border ${borderClass} outline-none ring-2 ring-blue-400/40 text-right`}
        autoFocus
      />
    );
  }

  return (
    <button
      onClick={startEdit}
      className={`text-xs font-bold tabular-nums ${colorClass} ${bgClass} px-2.5 py-0.5 rounded-md border ${borderClass} hover:ring-2 hover:ring-blue-300/40 transition-all cursor-text`}
      title="Click to type exact amount"
    >
      {fmt(value)}
    </button>
  );
}
