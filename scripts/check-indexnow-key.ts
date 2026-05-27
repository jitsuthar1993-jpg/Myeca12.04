import "dotenv/config";
import {
  INDEXNOW_KEY_ENV_NAME,
  indexNowKeyUrl,
  normalizedIndexNowKey,
  redactIndexNowKeyUrl,
} from "../shared/indexnow.js";

const defaultBaseUrl = "https://myeca.in";

function normalizeBaseUrl(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : "";
}

async function main() {
  const baseUrl = normalizeBaseUrl(process.argv[2] || process.env.MYECA_INDEXNOW_BASE_URL || defaultBaseUrl);
  const key = normalizedIndexNowKey(process.env[INDEXNOW_KEY_ENV_NAME]);

  if (!baseUrl) {
    console.error("A valid http(s) base URL is required.");
    process.exit(1);
  }

  if (!key) {
    console.error(`${INDEXNOW_KEY_ENV_NAME} is required and must be 8 to 128 letters, numbers, or dashes.`);
    process.exit(1);
  }

  const url = indexNowKeyUrl(baseUrl, key);
  const redactedUrl = redactIndexNowKeyUrl(url, key);
  const response = await fetch(url, {
    headers: {
      "user-agent": "MyeCA IndexNow key check",
    },
  });

  if (!response.ok) {
    console.error(`FAIL IndexNow key file reachable: ${response.status} ${response.statusText} ${redactedUrl}`);
    process.exit(1);
  }

  const body = (await response.text()).trim();
  if (body !== key) {
    console.error(`FAIL IndexNow key file body: response at ${redactedUrl} did not match ${INDEXNOW_KEY_ENV_NAME}.`);
    process.exit(1);
  }

  console.log(`PASS IndexNow key file: ${redactedUrl} returned the configured key.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
