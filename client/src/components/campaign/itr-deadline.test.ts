import { describe, expect, it } from "vitest";
import { getItrDeadlineMessage } from "./itr-deadline";

describe("ITR deadline messaging", () => {
  it("uses the July 31 window for salaried and simple individual filing", () => {
    expect(getItrDeadlineMessage("salaried")).toMatchObject({
      dateLabel: "July 31, 2026",
      categoryLabel: "Salaried and other non-business individual returns",
    });
  });

  it("uses the August 31 window for non-audit business and profession filing", () => {
    expect(getItrDeadlineMessage("business-profession")).toMatchObject({
      dateLabel: "August 31, 2026",
      categoryLabel: "Non-audit business and profession returns",
    });
  });

  it("always asks visitors to confirm the official due date", () => {
    expect(getItrDeadlineMessage("unknown").disclaimer).toMatch(/official Income Tax e-Filing portal/i);
  });
});
