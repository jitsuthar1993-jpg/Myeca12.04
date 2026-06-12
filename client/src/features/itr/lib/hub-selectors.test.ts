import { describe, expect, it } from "vitest";
import {
  findOpenDraftFor,
  groupReturnsByYear,
  isOpenDraft,
  ownerLabel,
  taxpayerLabel,
  type HubTaxReturn,
} from "./hub-selectors";

function record(overrides: Partial<HubTaxReturn> = {}): HubTaxReturn {
  return {
    id: "return_1",
    profileId: null,
    assessmentYear: "2026-27",
    status: "draft",
    ...overrides,
  };
}

describe("isOpenDraft", () => {
  it("treats draft and changes_requested as resumable", () => {
    expect(isOpenDraft("draft")).toBe(true);
    expect(isOpenDraft("changes_requested")).toBe(true);
    expect(isOpenDraft(undefined)).toBe(true);
  });

  it("treats submitted and filed statuses as closed", () => {
    for (const status of ["ready_for_review", "ca_review", "approved_for_filing", "filed", "e_verified"]) {
      expect(isOpenDraft(status)).toBe(false);
    }
  });
});

describe("ownerLabel", () => {
  it("labels self drafts as Self", () => {
    expect(ownerLabel(record())).toBe("Self");
    expect(ownerLabel(record({ formData: { filingOwner: { mode: "self" } } }))).toBe("Self");
  });

  it("uses the member display name for other-person drafts", () => {
    expect(ownerLabel(record({
      formData: { filingOwner: { mode: "other", displayName: "Asha Suthar" } },
    }))).toBe("Asha Suthar");
    expect(ownerLabel(record({
      formData: { filingOwner: { mode: "other", displayName: "" } },
    }))).toBe("Family member");
  });
});

describe("taxpayerLabel", () => {
  it("prefers the taxpayer name and falls back to the owner label", () => {
    expect(taxpayerLabel(record({
      formData: { taxpayer: { firstName: "Jit", lastName: "Suthar" } },
    }))).toBe("Jit Suthar");
    expect(taxpayerLabel(record())).toBe("Self");
  });
});

describe("groupReturnsByYear", () => {
  it("groups by assessment year, newest first", () => {
    const groups = groupReturnsByYear([
      record({ id: "a", assessmentYear: "2025-26" }),
      record({ id: "b", assessmentYear: "2026-27" }),
      record({ id: "c", assessmentYear: "2026-27" }),
    ]);

    expect(groups.map((group) => group.assessmentYear)).toEqual(["2026-27", "2025-26"]);
    expect(groups[0].returns.map((item) => item.id)).toEqual(["b", "c"]);
  });
});

describe("findOpenDraftFor", () => {
  const returns = [
    record({ id: "self_open" }),
    record({ id: "self_filed", status: "filed" }),
    record({ id: "member_open", profileId: "profile_1", formData: { filingOwner: { mode: "other" } } }),
    record({ id: "legacy_other", profileId: null, formData: { filingOwner: { mode: "other", displayName: "Uncle" } } }),
  ];

  it("matches self drafts only when unlinked and not other-mode", () => {
    expect(findOpenDraftFor(returns, { mode: "self" }, "2026-27")?.id).toBe("self_open");
  });

  it("matches member drafts by profile id and assessment year", () => {
    expect(findOpenDraftFor(returns, { mode: "member", profileId: "profile_1" }, "2026-27")?.id).toBe("member_open");
    expect(findOpenDraftFor(returns, { mode: "member", profileId: "profile_2" }, "2026-27")).toBeNull();
    expect(findOpenDraftFor(returns, { mode: "member", profileId: "profile_1" }, "2025-26")).toBeNull();
  });

  it("never resumes submitted returns", () => {
    expect(findOpenDraftFor([record({ status: "ready_for_review" })], { mode: "self" }, "2026-27")).toBeNull();
  });
});
