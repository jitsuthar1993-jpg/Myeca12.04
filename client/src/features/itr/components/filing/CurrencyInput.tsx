import { useEffect, useId, useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function parseCurrencyInput(value: string) {
  const digits = value.replace(/\D/g, "");
  const amount = digits ? Number.parseInt(digits, 10) : 0;
  return value.trimStart().startsWith("-") ? -amount : amount;
}

export function formatCurrencyInput(value: number | string) {
  if (typeof value === "string" && value.trim() === "-") return "-";
  const amount = typeof value === "number" ? Math.round(value || 0) : parseCurrencyInput(value);
  return amount ? new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount) : "";
}

export type CurrencyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "onChange"> & {
  label: string;
  value: number;
  onChange: (value: number) => void;
  allowNegative?: boolean;
  helper?: string;
  error?: string;
};

export function CurrencyInput({
  label,
  value,
  onChange,
  allowNegative = false,
  helper,
  error,
  className,
  ...inputProps
}: CurrencyInputProps) {
  const inputId = useId();
  const helperId = helper ? `${inputId}-helper` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const [displayValue, setDisplayValue] = useState(() => formatCurrencyInput(value));

  useEffect(() => {
    setDisplayValue(formatCurrencyInput(value));
  }, [value]);

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="relative mt-2">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center font-bold text-slate-500">
          {"\u20b9"}
        </span>
        <Input
          {...inputProps}
          id={inputId}
          type="text"
          inputMode={allowNegative ? "decimal" : "numeric"}
          autoComplete="off"
          value={displayValue}
          aria-invalid={Boolean(error)}
          aria-describedby={[helperId, errorId].filter(Boolean).join(" ") || undefined}
          onChange={(event) => {
            const rawValue = event.target.value;
            const parsedValue = parseCurrencyInput(rawValue);
            const nextValue = allowNegative ? parsedValue : Math.max(0, parsedValue);
            setDisplayValue(formatCurrencyInput(allowNegative ? rawValue : nextValue));
            onChange(nextValue);
          }}
          className={cn("h-11 scroll-mb-24 rounded-lg pl-8 tabular-nums", className)}
        />
      </div>
      {helper ? <p id={helperId} className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
      {error ? <p id={errorId} className="mt-1 text-xs font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}
