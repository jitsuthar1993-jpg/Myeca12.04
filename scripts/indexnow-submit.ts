import "dotenv/config";
import {
  INDEXNOW_KEY_ENV_NAME,
  INDEXNOW_KEY_REDACTION,
  indexNowKeyPath,
  normalizedIndexNowKey,
  redactIndexNowSubmissionPayload,
} from "../shared/indexnow.js";
import { PRIORITY_ITR_SEARCH_ROUTES } from "../shared/search-engine-readiness.js";

const defaultBaseUrl = "https://myeca.in";
const defaultEndpoint = "https://api.indexnow.org/indexnow";

type CliArgs = {
  baseUrl: string;
  endpoint: string;
  priority: boolean;
  submit: boolean;
  urls: string[];
};

function readValueArg(args: string[], index: number) {
  const value = args[index];
  const equalsIndex = value.indexOf("=");
  if (equalsIndex >= 0) return { consumed: 0, value: value.slice(equalsIndex + 1) };
  return { consumed: 1, value: args[index + 1] ?? "" };
}

function parseArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = {
    baseUrl: process.env.MYECA_INDEXNOW_BASE_URL || defaultBaseUrl,
    endpoint: process.env.INDEXNOW_ENDPOINT || defaultEndpoint,
    priority: false,
    submit: false,
    urls: [],
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--submit") {
      parsed.submit = true;
      continue;
    }
    if (arg === "--dry-run") {
      parsed.submit = false;
      continue;
    }
    if (arg === "--priority") {
      parsed.priority = true;
      continue;
    }
    if (arg === "--url" || arg.startsWith("--url=") || arg === "--changed" || arg.startsWith("--changed=")) {
      const { consumed, value } = readValueArg(argv, index);
      parsed.urls.push(...value.split(",").map((entry) => entry.trim()).filter(Boolean));
      index += consumed;
      continue;
    }
    if (arg === "--base-url" || arg.startsWith("--base-url=")) {
      const { consumed, value } = readValueArg(argv, index);
      parsed.baseUrl = value;
      index += consumed;
      continue;
    }
    if (arg === "--endpoint" || arg.startsWith("--endpoint=")) {
      const { consumed, value } = readValueArg(argv, index);
      parsed.endpoint = value;
      index += consumed;
      continue;
    }
  }

  return parsed;
}

function normalizeBaseUrl(value: string) {
  return value.replace(/\/+$/, "");
}

function toSubmissionUrl(value: string, baseUrl: string) {
  if (/^https?:\/\//i.test(value)) return value;
  const path = value.startsWith("/") ? value : `/${value}`;
  return `${baseUrl}${path}`;
}

function uniqueUrls(values: string[]) {
  return [...new Set(values)];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const baseUrl = normalizeBaseUrl(args.baseUrl);
  const key = normalizedIndexNowKey(process.env[INDEXNOW_KEY_ENV_NAME]);
  const explicitUrls = args.urls.length > 0 || args.priority;
  const selectedRoutes = args.priority || !explicitUrls ? [...PRIORITY_ITR_SEARCH_ROUTES] : [];
  const urlList = uniqueUrls([
    ...selectedRoutes.map((route) => toSubmissionUrl(route, baseUrl)),
    ...args.urls.map((url) => toSubmissionUrl(url, baseUrl)),
  ]);

  if (!urlList.length) {
    console.error("No URLs selected. Use --priority or --url /path.");
    process.exit(1);
  }

  if (urlList.length > 10_000) {
    console.error(`IndexNow accepts at most 10000 URLs per request; received ${urlList.length}.`);
    process.exit(1);
  }

  if (args.submit && !explicitUrls) {
    console.error("Real IndexNow submission requires --priority or --url so the submitted URL set is explicit.");
    process.exit(1);
  }

  if (args.submit && !key) {
    console.error(`${INDEXNOW_KEY_ENV_NAME} is required for real IndexNow submission.`);
    process.exit(1);
  }

  const host = new URL(baseUrl).hostname;
  const keyLocation = key ? `${baseUrl}${indexNowKeyPath(key)}` : `${baseUrl}/${INDEXNOW_KEY_REDACTION}.txt`;
  const payload = {
    host,
    key: key ?? INDEXNOW_KEY_REDACTION,
    keyLocation,
    urlList,
  };

  if (!args.submit) {
    console.log("IndexNow dry run. No request was sent.");
    console.log(JSON.stringify(redactIndexNowSubmissionPayload(payload), null, 2));
    return;
  }

  const response = await fetch(args.endpoint, {
    body: JSON.stringify(payload),
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
    method: "POST",
  });

  console.log(`IndexNow response: ${response.status} ${response.statusText}`);
  if (![200, 202].includes(response.status)) {
    const body = await response.text().catch(() => "");
    if (body) console.error(body);
    process.exit(1);
  }

  console.log(`Submitted ${urlList.length} URL(s) for ${host}.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
