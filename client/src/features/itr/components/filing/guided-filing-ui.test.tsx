import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { ItrVerificationIssue } from "@shared/itr-filing";
import { IssueList, TextInput } from "./guided-filing-ui";

describe("TextInput", () => {
  it("passes mobile input ergonomics through and stacks helper with error text", () => {
    render(
      <TextInput
        label="Mobile"
        value=""
        onChange={vi.fn()}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        enterKeyHint="next"
        maxLength={10}
        helper="Use the number linked to Aadhaar."
        error="Enter a 10-digit mobile number."
      />,
    );

    const input = screen.getByLabelText("Mobile");
    expect(input).toHaveAttribute("inputmode", "tel");
    expect(input).toHaveAttribute("autocomplete", "tel-national");
    expect(input).toHaveAttribute("enterkeyhint", "next");
    expect(input).toHaveAttribute("maxlength", "10");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveClass("scroll-mb-24");
    expect(screen.getByText("Use the number linked to Aadhaar.")).toBeInTheDocument();
    expect(screen.getByText("Enter a 10-digit mobile number.")).toBeInTheDocument();
  });
});

describe("IssueList", () => {
  it("offers optional navigation without changing the non-navigation state", async () => {
    const issue: ItrVerificationIssue = {
      id: "pan",
      severity: "critical",
      area: "identity",
      title: "PAN is missing",
      detail: "PAN is required.",
      action: "Add PAN",
    };
    const onIssueNavigate = vi.fn();
    const user = userEvent.setup();

    const { rerender } = render(<IssueList issues={[issue]} />);
    expect(screen.queryByRole("button", { name: "Add PAN" })).not.toBeInTheDocument();

    rerender(<IssueList issues={[issue]} onIssueNavigate={onIssueNavigate} />);
    await user.click(screen.getByRole("button", { name: "Add PAN" }));

    expect(onIssueNavigate).toHaveBeenCalledWith(issue);
  });
});
