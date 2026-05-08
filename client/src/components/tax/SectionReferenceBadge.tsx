import { getSectionReference } from "@/lib/tax-law-reference";
import { cn } from "@/lib/utils";

interface SectionReferenceBadgeProps {
  section: string;
  className?: string;
}

export function SectionReferenceBadge({ section, className }: SectionReferenceBadgeProps) {
  const reference = getSectionReference(section);

  if (!reference) return null;

  return (
    <span
      className={cn(
        "ml-2 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 align-middle text-[10px] font-medium text-blue-700",
        className,
      )}
      title={`${reference.oldAct}: ${reference.label}`}
    >
      2025 Act: {reference.newAct}
    </span>
  );
}
