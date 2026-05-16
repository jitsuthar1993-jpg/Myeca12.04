import { afterEach, describe, expect, it } from "vitest";
import { readTemporaryAuth, sendJson } from "../../../api/_test-api.js";
import { TEMPORARY_TEST_USERS } from "../../../shared/temporary-test-users.js";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

function mockResponse() {
  const headers = new Map<string, string>();
  return {
    locals: { requestId: "api-request-id" },
    statusCode: 200,
    body: undefined as unknown,
    setHeader: (key: string, value: string) => headers.set(key, value),
    getHeader: (key: string) => headers.get(key),
    status(statusCode: number) {
      this.statusCode = statusCode;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
}

describe("serverless API entry hardening", () => {
  it("adds standardized request ids to serverless error JSON", () => {
    const res = mockResponse();
    res.setHeader("X-Request-Id", "api-request-id");

    sendJson(res, 401, { error: "Unauthorized" });

    expect(res.statusCode).toBe(401);
    expect(res.body).toMatchObject({
      success: false,
      error: "Unauthorized",
      requestId: "api-request-id",
    });
  });

  it("rejects temporary auth tokens in production serverless auth", () => {
    process.env = { ...originalEnv, NODE_ENV: "production" };

    const req = {
      headers: {
        authorization: `Bearer ${TEMPORARY_TEST_USERS[0].token}`,
      },
    };

    expect(readTemporaryAuth(req)).toBeNull();
  });
});

