export type EnvRequirementLevel = "required" | "recommended" | "optional";

export type EnvRequirement = {
  key: string;
  level: EnvRequirementLevel;
  description: string;
  requiresAnyMissing?: string[];
  validate?: (value: string) => string | null;
};

export type EnvIssue = {
  key: string;
  level: EnvRequirementLevel;
  message: string;
};

const minLength = (length: number) => (value: string) =>
  value.trim().length >= length ? null : `must be at least ${length} characters`;

const urlValue = (value: string) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? null : "must be an HTTP or HTTPS URL";
  } catch {
    return "must be a valid URL";
  }
};

const emailList = (value: string) => {
  const emails = value.split(",").map((entry) => entry.trim()).filter(Boolean);
  if (emails.length === 0) return "must include at least one email address";

  return emails.every((entry) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(entry))
    ? null
    : "must be a comma-separated email list";
};

const unsafeSecret = (value: string) => {
  const normalized = value.trim().toLowerCase();
  return /^(changeme|change-me|your-|example|secret|password|test)/.test(normalized)
    ? "must not use a placeholder value"
    : null;
};

const strongSecret = (length: number) => (value: string) => minLength(length)(value) || unsafeSecret(value);
const ratioValue = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? null : "must be a number between 0 and 1";
};

export const ENV_REQUIREMENTS: EnvRequirement[] = [
  {
    key: "DATABASE_URL",
    level: "required",
    description: "Supabase Postgres connection string used by Drizzle and DB-backed APIs.",
  },
  {
    key: "VITE_SUPABASE_URL",
    level: "required",
    description: "Supabase project URL exposed to the browser build.",
    validate: urlValue,
  },
  {
    key: "VITE_SUPABASE_ANON_KEY",
    level: "required",
    description: "Supabase browser publishable key exposed to the Vite build.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    level: "required",
    description: "Supabase server secret key used for privileged auth and data sync.",
  },
  {
    key: "BLOB_READ_WRITE_TOKEN",
    level: "required",
    description: "Vercel Blob token used for private document uploads and downloads.",
  },
  {
    key: "SESSION_SECRET",
    level: "required",
    description: "Server session signing secret.",
    validate: strongSecret(32),
  },
  {
    key: "PII_ENCRYPTION_KEY",
    level: "required",
    description: "Encryption key for PII and two-factor authentication secrets.",
    validate: strongSecret(32),
  },
  {
    key: "APP_URL",
    level: "required",
    description: "Canonical server-side app URL used in links and callbacks.",
    validate: urlValue,
  },
  {
    key: "VITE_APP_URL",
    level: "required",
    description: "Canonical browser app URL exposed to the Vite build.",
    validate: urlValue,
  },
  {
    key: "ADMIN_EMAILS",
    level: "recommended",
    description: "Comma-separated emails promoted to admin during auth sync.",
    validate: emailList,
  },
  {
    key: "BLOG_IMPORT_SECRET",
    level: "recommended",
    description: "Shared secret for blog import and webhook endpoints.",
    validate: strongSecret(32),
  },
  {
    key: "TEAM_MEMBER_EMAILS",
    level: "optional",
    description: "Comma-separated emails provisioned as internal team members.",
    validate: emailList,
  },
  {
    key: "SECURITY_LEAD_PHONE",
    level: "recommended",
    description: "Primary incident-response escalation phone number.",
    requiresAnyMissing: ["SECURITY_EXTERNAL_CONTACT"],
  },
  {
    key: "SECURITY_ADMIN_PHONE",
    level: "recommended",
    description: "System-admin incident-response phone number.",
    requiresAnyMissing: ["SECURITY_EXTERNAL_CONTACT"],
  },
  {
    key: "SECURITY_BACKUP_PHONE",
    level: "recommended",
    description: "Backup incident-response phone number.",
    requiresAnyMissing: ["SECURITY_EXTERNAL_CONTACT"],
  },
  {
    key: "SECURITY_EXTERNAL_CONTACT",
    level: "recommended",
    description: "External incident-response provider contact details, when applicable.",
  },
  {
    key: "SENDGRID_API_KEY",
    level: "optional",
    description: "SendGrid key for production transactional email.",
  },
  {
    key: "SMTP_HOST",
    level: "optional",
    description: "SMTP host fallback for transactional email.",
  },
  {
    key: "OPENAI_API_KEY",
    level: "optional",
    description: "OpenAI key for AI-assisted blog and tax assistant features.",
  },
  {
    key: "TWILIO_ACCOUNT_SID",
    level: "optional",
    description: "Twilio account SID for WhatsApp publishing flows.",
  },
  {
    key: "TWILIO_AUTH_TOKEN",
    level: "optional",
    description: "Twilio auth token for WhatsApp publishing flows.",
  },
  {
    key: "VITE_GA_MEASUREMENT_ID",
    level: "optional",
    description: "Google Analytics measurement ID for production telemetry.",
  },
  {
    key: "VITE_GOOGLE_SITE_VERIFICATION",
    level: "optional",
    description: "Google Search Console HTML meta verification token exposed to the Vite build.",
  },
  {
    key: "VITE_CLARITY_PROJECT_ID",
    level: "optional",
    description: "Microsoft Clarity project ID for production-only public-page behavior analytics.",
  },
  {
    key: "VITE_POSTHOG_KEY",
    level: "optional",
    description: "PostHog public project key for production product analytics.",
  },
  {
    key: "VITE_POSTHOG_HOST",
    level: "optional",
    description: "PostHog API host, for example https://us.i.posthog.com.",
    validate: urlValue,
  },
  {
    key: "VITE_SENTRY_DSN",
    level: "optional",
    description: "Browser Sentry DSN for production client error monitoring.",
    validate: urlValue,
  },
  {
    key: "SENTRY_DSN",
    level: "optional",
    description: "Server Sentry DSN for production API error monitoring.",
    validate: urlValue,
  },
  {
    key: "SENTRY_ORG",
    level: "optional",
    description: "Sentry organization slug used by build-time source map upload.",
  },
  {
    key: "SENTRY_PROJECT",
    level: "optional",
    description: "Sentry project slug used by build-time source map upload.",
  },
  {
    key: "SENTRY_AUTH_TOKEN",
    level: "optional",
    description: "Sentry auth token used only during trusted production builds to upload source maps.",
  },
  {
    key: "SENTRY_TRACES_SAMPLE_RATE",
    level: "optional",
    description: "Server Sentry tracing sample rate between 0 and 1.",
    validate: ratioValue,
  },
  {
    key: "VITE_CRISP_WEBSITE_ID",
    level: "optional",
    description: "Crisp website ID for production-only public support chat.",
  },
];

export function getEnvReport(env: NodeJS.ProcessEnv = process.env) {
  const issues: EnvIssue[] = [];

  for (const requirement of ENV_REQUIREMENTS) {
    const value = env[requirement.key]?.trim() ?? "";
    if (!value) {
      const hasAlternative = requirement.requiresAnyMissing?.some((key) => Boolean(env[key]?.trim()));
      if (hasAlternative) continue;

      if (requirement.level !== "optional") {
        issues.push({
          key: requirement.key,
          level: requirement.level,
          message: `${requirement.key} is missing - ${requirement.description}`,
        });
      }
      continue;
    }

    const validationError = requirement.validate?.(value);
    if (validationError) {
      issues.push({
        key: requirement.key,
        level: requirement.level,
        message: `${requirement.key} ${validationError}`,
      });
    }
  }

  return {
    requirements: ENV_REQUIREMENTS,
    issues,
    requiredIssues: issues.filter((issue) => issue.level === "required"),
    recommendedIssues: issues.filter((issue) => issue.level === "recommended"),
  };
}
