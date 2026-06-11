import { useEffect, useId, useState, type InputHTMLAttributes } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const PAN_PATTERN = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_PATTERN = /^[A-Z]{4}0[A-Z0-9]{6}$/;

type IdentityInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  helper?: string;
  error?: string;
};

function normalizePan(value: string) {
  const normalized: string[] = [];
  for (const character of value.toUpperCase().replace(/[^A-Z0-9]/g, "")) {
    const index = normalized.length;
    const expectsLetter = index < 5 || index === 9;
    if ((expectsLetter && /[A-Z]/.test(character)) || (!expectsLetter && /[0-9]/.test(character))) {
      normalized.push(character);
    }
    if (normalized.length === 10) break;
  }
  return normalized.join("");
}

function normalizeIfsc(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11);
}

function aadhaarDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, 12);
}

function groupAadhaar(value: string) {
  return aadhaarDigits(value).replace(/(\d{4})(?=\d)/g, "$1 ");
}

function FieldMessages({ helper, error, helperId, errorId }: { helper?: string; error?: string; helperId?: string; errorId?: string }) {
  return (
    <>
      {helper ? <p id={helperId} className="mt-1 text-xs font-semibold text-slate-500">{helper}</p> : null}
      {error ? <p id={errorId} className="mt-1 text-xs font-semibold text-red-700">{error}</p> : null}
    </>
  );
}

export function PanInput({
  value,
  onChange,
  label = "PAN",
  helper,
  error,
  className,
  ...inputProps
}: IdentityInputProps) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = error ? `${inputId}-error` : undefined;
  const [displayValue, setDisplayValue] = useState(() => normalizePan(value));
  const valid = PAN_PATTERN.test(displayValue);

  useEffect(() => setDisplayValue(normalizePan(value)), [value]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={inputId}>{label}</Label>
        {valid ? <CheckCircle2 aria-label="PAN format valid" className="h-4 w-4 text-emerald-700" /> : null}
      </div>
      <Input
        {...inputProps}
        id={inputId}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={10}
        value={displayValue}
        aria-invalid={Boolean(error)}
        aria-describedby={[helperId, errorId].filter(Boolean).join(" ")}
        onChange={(event) => {
          const nextValue = normalizePan(event.target.value);
          setDisplayValue(nextValue);
          onChange(nextValue);
        }}
        className={cn("mt-2 h-11 scroll-mb-24 rounded-lg uppercase", className)}
      />
      <FieldMessages helper={helper ?? (valid ? "PAN format valid" : "Format: AAAAA9999A")} error={error} helperId={helperId} errorId={errorId} />
    </div>
  );
}

export function AadhaarInput({
  value,
  onChange,
  label = "Aadhaar",
  helper,
  error,
  className,
  ...inputProps
}: IdentityInputProps) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = error ? `${inputId}-error` : undefined;
  const [visible, setVisible] = useState(false);
  const [displayValue, setDisplayValue] = useState(() => groupAadhaar(value));

  useEffect(() => setDisplayValue(groupAadhaar(value)), [value]);

  return (
    <div>
      <Label htmlFor={inputId}>{label}</Label>
      <div className="mt-2 flex gap-2">
        <Input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          inputMode="numeric"
          autoComplete="off"
          maxLength={14}
          value={displayValue}
          aria-invalid={Boolean(error)}
          aria-describedby={[helperId, errorId].filter(Boolean).join(" ")}
          onChange={(event) => {
            const digits = aadhaarDigits(event.target.value);
            setDisplayValue(groupAadhaar(digits));
            onChange(digits);
          }}
          className={cn("h-11 scroll-mb-24 rounded-lg tabular-nums", className)}
        />
        <Button
          type="button"
          variant="outline"
          aria-label={visible ? "Hide Aadhaar" : "Show Aadhaar"}
          onClick={() => setVisible((current) => !current)}
          className="h-11 w-11 shrink-0 border-slate-200 p-0"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <FieldMessages helper={helper ?? "Stored securely. Digits only."} error={error} helperId={helperId} errorId={errorId} />
    </div>
  );
}

export function IfscInput({
  value,
  onChange,
  label = "IFSC",
  helper,
  error,
  className,
  ...inputProps
}: IdentityInputProps) {
  const inputId = useId();
  const helperId = `${inputId}-helper`;
  const errorId = error ? `${inputId}-error` : undefined;
  const [displayValue, setDisplayValue] = useState(() => normalizeIfsc(value));
  const valid = IFSC_PATTERN.test(displayValue);

  useEffect(() => setDisplayValue(normalizeIfsc(value)), [value]);

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={inputId}>{label}</Label>
        {valid ? <CheckCircle2 aria-label="IFSC format valid" className="h-4 w-4 text-emerald-700" /> : null}
      </div>
      <Input
        {...inputProps}
        id={inputId}
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        maxLength={11}
        value={displayValue}
        aria-invalid={Boolean(error)}
        aria-describedby={[helperId, errorId].filter(Boolean).join(" ")}
        onChange={(event) => {
          const nextValue = normalizeIfsc(event.target.value);
          setDisplayValue(nextValue);
          onChange(nextValue);
        }}
        className={cn("mt-2 h-11 scroll-mb-24 rounded-lg uppercase", className)}
      />
      <FieldMessages helper={helper ?? (valid ? "Valid IFSC format" : "Format: AAAA0XXXXXX")} error={error} helperId={helperId} errorId={errorId} />
    </div>
  );
}
