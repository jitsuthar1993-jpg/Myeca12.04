import Logo from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type BrandLockupProps = {
  logoSize?: "sm" | "md" | "lg";
  wordmarkSize?: "sm" | "md" | "lg";
  className?: string;
  subtitle?: string;
  badge?: string;
  dark?: boolean;
  compact?: boolean;
};

const wordmarkSizeClasses = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-[2rem]",
};

const subtitleSizeClasses = {
  sm: "text-[9px] tracking-[0.18em]",
  md: "text-[10px] tracking-[0.2em]",
  lg: "text-[11px] tracking-[0.22em]",
};

export default function BrandLockup({
  logoSize = "md",
  wordmarkSize = "md",
  className,
  subtitle,
  badge,
  dark = false,
  compact = false,
}: BrandLockupProps) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <Logo size={logoSize} className="shrink-0" />

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "block truncate font-black leading-none tracking-[-0.04em]",
              wordmarkSizeClasses[wordmarkSize],
              dark
                ? "bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
                : "bg-gradient-to-r from-[#003087] to-[#315efb] bg-clip-text text-transparent",
            )}
          >
            MyeCA.in
          </span>

          {badge ? (
            <span
              className={cn(
                "rounded-full px-2 py-1 text-[9px] font-black uppercase tracking-[0.16em]",
                dark
                  ? "bg-white/12 text-white/90 ring-1 ring-white/15"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>

        {!compact && subtitle ? (
          <span
            className={cn(
              "mt-1 block font-bold uppercase leading-none",
              subtitleSizeClasses[wordmarkSize],
              dark ? "text-blue-100/85" : "text-slate-500",
            )}
          >
            {subtitle}
          </span>
        ) : null}
      </div>
    </div>
  );
}
