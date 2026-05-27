import { describe, expect, it } from "vitest";
import {
  INDEXNOW_KEY_ENV_NAME,
  indexNowKeyPath,
  indexNowKeyResponse,
  indexNowKeyUrl,
  isIndexNowKeyRequest,
  redactIndexNowKeyUrl,
  redactIndexNowSubmissionPayload,
  validateIndexNowKey,
} from "@shared/indexnow";

describe("IndexNow helpers", () => {
  it("accepts only IndexNow-compatible keys", () => {
    expect(INDEXNOW_KEY_ENV_NAME).toBe("INDEXNOW_KEY");
    expect(validateIndexNowKey("abc12345")).toBe(true);
    expect(validateIndexNowKey("ABC-def-123")).toBe(true);
    expect(validateIndexNowKey("short")).toBe(false);
    expect(validateIndexNowKey("abc_12345")).toBe(false);
    expect(validateIndexNowKey("a".repeat(129))).toBe(false);
  });

  it("builds and matches the root key file path without exposing a committed key", () => {
    const key = "MyeCA-IndexNow-123";

    expect(indexNowKeyPath(key)).toBe("/MyeCA-IndexNow-123.txt");
    expect(indexNowKeyUrl("https://myeca.in/", key)).toBe("https://myeca.in/MyeCA-IndexNow-123.txt");
    expect(indexNowKeyResponse(key)).toBe("MyeCA-IndexNow-123");
    expect(isIndexNowKeyRequest("/MyeCA-IndexNow-123.txt", key)).toBe(true);
    expect(isIndexNowKeyRequest("/other-key.txt", key)).toBe(false);
  });

  it("redacts IndexNow key-file URLs before they are logged", () => {
    expect(redactIndexNowKeyUrl("https://myeca.in/MyeCA-IndexNow-123.txt", "MyeCA-IndexNow-123"))
      .toBe("https://myeca.in/<INDEXNOW_KEY>.txt");
  });

  it("redacts the IndexNow key from dry-run payloads", () => {
    const payload = {
      host: "myeca.in",
      key: "MyeCA-IndexNow-123",
      keyLocation: "https://myeca.in/MyeCA-IndexNow-123.txt",
      urlList: ["https://myeca.in/itr-season-2026"],
    };

    expect(redactIndexNowSubmissionPayload(payload)).toEqual({
      host: "myeca.in",
      key: "<INDEXNOW_KEY>",
      keyLocation: "https://myeca.in/<INDEXNOW_KEY>.txt",
      urlList: ["https://myeca.in/itr-season-2026"],
    });
  });
});
