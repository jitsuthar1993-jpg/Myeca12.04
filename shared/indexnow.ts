export const INDEXNOW_KEY_ENV_NAME = "INDEXNOW_KEY";
export const INDEXNOW_KEY_REDACTION = `<${INDEXNOW_KEY_ENV_NAME}>`;

const INDEXNOW_KEY_PATTERN = /^[A-Za-z0-9-]{8,128}$/;

export type IndexNowSubmissionPayload = {
  host: string;
  key: string;
  keyLocation: string;
  urlList: string[];
};

export function validateIndexNowKey(value: string | undefined | null) {
  return Boolean(value && INDEXNOW_KEY_PATTERN.test(value.trim()));
}

export function normalizedIndexNowKey(value: string | undefined | null) {
  const key = value?.trim() ?? "";
  return validateIndexNowKey(key) ? key : null;
}

export function indexNowKeyPath(key: string) {
  return `/${key}.txt`;
}

export function indexNowKeyUrl(baseUrl: string, key: string) {
  return `${baseUrl.replace(/\/+$/, "")}${indexNowKeyPath(key)}`;
}

export function indexNowKeyResponse(key: string) {
  return key;
}

export function isIndexNowKeyRequest(pathName: string, key: string | undefined | null) {
  const normalizedKey = normalizedIndexNowKey(key);
  if (!normalizedKey) return false;
  return pathName === indexNowKeyPath(normalizedKey);
}

export function indexNowKeyValidationMessage(value: string | undefined | null) {
  if (validateIndexNowKey(value)) return null;
  return "must be 8 to 128 characters and contain only letters, numbers, or dashes";
}

export function redactIndexNowSubmissionPayload(payload: IndexNowSubmissionPayload): IndexNowSubmissionPayload {
  return {
    ...payload,
    key: INDEXNOW_KEY_REDACTION,
    keyLocation: payload.keyLocation.replace(payload.key, INDEXNOW_KEY_REDACTION),
  };
}

export function redactIndexNowKeyUrl(url: string, key: string) {
  return url.replace(key, INDEXNOW_KEY_REDACTION);
}
