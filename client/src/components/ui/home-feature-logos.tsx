import React from "react";

export function FastITRFilingLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="2" />
      <path d="M20 36h10l-4 10 18-18h-10l4-10-18 18z" fill="currentColor" />
      <path d="M12 40h8M44 20h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function AccurateTaxCalculatorLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="10" y="10" width="44" height="44" rx="8" stroke="currentColor" strokeWidth="2" />
      <rect x="16" y="16" width="12" height="12" rx="2" fill="currentColor" />
      <rect x="30" y="16" width="12" height="12" rx="2" fill="currentColor" />
      <rect x="44" y="16" width="4" height="12" rx="2" fill="currentColor" />
      <path d="M16 32h28M16 40h28M16 48h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function SmartDocumentScannerLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <rect x="12" y="12" width="40" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="20" width="24" height="12" rx="2" fill="currentColor" />
      <path d="M16 44l8 8h16l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M24 28h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function ExpertTaxReviewLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none">
      <path d="M32 10l18 8v12c0 10.5-7.5 20.2-18 22-10.5-1.8-18-11.5-18-22V18l18-8z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M24 34l6 6 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

