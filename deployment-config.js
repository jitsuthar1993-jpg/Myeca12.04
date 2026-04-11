#!/usr/bin/env node

/**
 * MyeCA.in Vercel deployment configuration checker.
 *
 * This is intentionally secret-safe: it only reports whether values exist.
 */

const DATABASE_KEYS = ["DATABASE_URL", "POSTGRES_URL"];

const REQUIRED_PRODUCTION_GROUPS = [
  {
    label: "Neon Postgres",
    keys: DATABASE_KEYS,
    any: true,
  },
  {
    label: "Clerk server auth",
    keys: ["CLERK_SECRET_KEY"],
  },
  {
    label: "Clerk browser auth",
    keys: ["VITE_CLERK_PUBLISHABLE_KEY", "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"],
    any: true,
  },
  {
    label: "Vercel Blob",
    keys: ["BLOB_READ_WRITE_TOKEN"],
  },
];

const RECOMMENDED_VARS = [
  "NODE_ENV",
  "APP_URL",
  "VITE_APP_URL",
  "ADMIN_EMAILS",
  "PII_ENCRYPTION_KEY",
  "SESSION_SECRET",
  "OPENAI_API_KEY",
  "SENDGRID_API_KEY",
];

function hasValue(key) {
  return Boolean(process.env[key]?.trim());
}

function formatGroup(group) {
  if (group.any) {
    return group.keys.some(hasValue)
      ? `configured via ${group.keys.find(hasValue)}`
      : `missing one of: ${group.keys.join(", ")}`;
  }

  const missing = group.keys.filter((key) => !hasValue(key));
  return missing.length === 0 ? "configured" : `missing: ${missing.join(", ")}`;
}

function checkEnvironmentVariables() {
  console.log("Checking MyeCA.in Vercel deployment configuration\n");

  let allRequiredPresent = true;
  const warnings = [];

  console.log("Required configuration:");
  for (const group of REQUIRED_PRODUCTION_GROUPS) {
    const configured = group.any
      ? group.keys.some(hasValue)
      : group.keys.every(hasValue);

    if (!configured) {
      allRequiredPresent = false;
    }

    console.log(`- ${group.label}: ${formatGroup(group)}`);
  }

  console.log("\nRecommended configuration:");
  for (const key of RECOMMENDED_VARS) {
    if (hasValue(key)) {
      console.log(`- ${key}: configured`);
    } else {
      console.log(`- ${key}: not set`);
      warnings.push(key);
    }
  }

  console.log("\nSummary:");
  console.log(`Status: ${allRequiredPresent ? "ready" : "not ready"}`);

  if (warnings.length > 0) {
    console.log(`Warnings: ${warnings.join(", ")}`);
  }

  if (!allRequiredPresent) {
    console.log("\nNext steps:");
    console.log("- Connect Clerk, Neon, and Blob through Vercel Marketplace or add equivalent env vars.");
    console.log("- Run `npx vercel env pull .vercel/.env.preview.local --environment=preview --yes`.");
    console.log("- Run `npm run db:migrate:preview` after Neon is provisioned.");
  }

  return allRequiredPresent;
}

function generateDeploymentSummary() {
  return checkEnvironmentVariables();
}

const isReady = generateDeploymentSummary();
process.exit(isReady ? 0 : 1);

export {
  checkEnvironmentVariables,
  generateDeploymentSummary,
  REQUIRED_PRODUCTION_GROUPS,
  RECOMMENDED_VARS,
};
