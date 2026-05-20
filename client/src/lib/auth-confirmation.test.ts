import { describe, expect, it } from "vitest";
import {
  buildSignupConfirmationRedirectUrl,
  buildSignupConfirmationResendOptions,
  getAuthCallbackCode,
  getAuthCallbackError,
  getAuthCallbackTarget,
  getAuthCallbackTokens,
  getAuthRedirectPath,
} from "./auth-confirmation";

const origin = "https://myeca.in";

describe("auth confirmation redirects", () => {
  it("builds Supabase signup callback URLs with safe local targets", () => {
    expect(buildSignupConfirmationRedirectUrl("/documents?tab=tax#files", origin)).toBe(
      "https://myeca.in/auth/callback?next=%2Fdocuments%3Ftab%3Dtax%23files",
    );
  });

  it("builds Supabase resend options with the same callback target", () => {
    expect(buildSignupConfirmationResendOptions("/dashboard", origin)).toEqual({
      emailRedirectTo: "https://myeca.in/auth/callback?next=%2Fdashboard",
    });
  });

  it("falls back to the dashboard for external or auth-loop targets", () => {
    expect(getAuthRedirectPath("https://evil.example/dashboard", origin)).toBe("/dashboard");
    expect(getAuthRedirectPath("/auth/login?next=%2Fdashboard", origin)).toBe("/dashboard");
    expect(getAuthCallbackTarget("?next=https%3A%2F%2Fevil.example%2Fdashboard", "", origin)).toBe("/dashboard");
  });

  it("reads callback code, tokens, and errors from Supabase callback URLs", () => {
    expect(getAuthCallbackCode("?code=abc123&next=%2Fdashboard")).toBe("abc123");
    expect(getAuthCallbackTokens("#access_token=at&refresh_token=rt")).toEqual({
      accessToken: "at",
      refreshToken: "rt",
    });
    expect(getAuthCallbackError("?error_description=Link%20expired")).toBe("Link expired");
    expect(getAuthCallbackError("", "#error=access_denied")).toBe("access_denied");
  });
});
