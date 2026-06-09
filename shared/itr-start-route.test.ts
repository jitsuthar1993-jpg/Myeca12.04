import { describe, expect, it } from "vitest";
import {
  ITR_START_ROUTE,
  LEGACY_ITR_START_ROUTE,
  buildItrStartRedirectLocation,
} from "./itr-start-route";

describe("ITR start route migration", () => {
  it("uses the descriptive route as the canonical selector URL", () => {
    expect(ITR_START_ROUTE).toBe("/which-itr-form-to-file");
    expect(LEGACY_ITR_START_ROUTE).toBe("/itr/start");
  });

  it("preserves query strings and hashes when redirecting legacy URLs", () => {
    expect(buildItrStartRedirectLocation("/itr/start?source=homepage_hero")).toBe(
      "/which-itr-form-to-file?source=homepage_hero",
    );
    expect(buildItrStartRedirectLocation("/itr/start#individual-filing-facts")).toBe(
      "/which-itr-form-to-file#individual-filing-facts",
    );
  });
});
