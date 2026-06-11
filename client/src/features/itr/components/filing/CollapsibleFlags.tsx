import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ToggleRow } from "./guided-filing-ui";

export type CollapsibleFlag = {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function CollapsibleFlags({
  flags,
  title = "Special situations",
  defaultOpen = false,
}: {
  flags: readonly CollapsibleFlag[];
  title?: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const activeCount = flags.filter((flag) => flag.checked).length;

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="rounded-lg border border-slate-200 bg-white">
      <CollapsibleTrigger asChild>
        <button type="button" className="flex min-h-14 w-full items-center justify-between gap-3 px-4 text-left">
          <span className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-950">{title}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-black text-slate-600">
              {activeCount ? `${activeCount} active` : "None active"}
            </span>
          </span>
          <ChevronDown className={cn("h-5 w-5 text-slate-500 transition", open && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {open ? (
          <div className="grid gap-3 border-t border-slate-200 p-3 md:grid-cols-2 xl:grid-cols-3">
            {flags.map((flag) => (
              <ToggleRow
                key={flag.id}
                title={flag.title}
                description={flag.description}
                checked={flag.checked}
                onCheckedChange={flag.onCheckedChange}
              />
            ))}
          </div>
        ) : null}
      </CollapsibleContent>
    </Collapsible>
  );
}
