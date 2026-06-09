import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthPageShell } from "./AuthPageShell";

const sharedProps = {
  title: "Sign in to MyeCA",
  description: "Open your secure tax workspace.",
  panelTitle: "Account summary",
  panelDescription: "Your latest filing and document status appear first.",
  primaryLink: {
    href: "/auth/register",
    text: "New to MyeCA?",
    label: "Create an account",
  },
};

describe("AuthPageShell", () => {
  it("renders the compact login header without finance branding or an eyebrow", () => {
    render(
      <AuthPageShell {...sharedProps} variant="compact">
        <button type="button">Sign in</button>
      </AuthPageShell>,
    );

    expect(screen.getByRole("heading", { name: "Sign in to MyeCA" })).toBeInTheDocument();
    expect(screen.queryByText(/finance/i)).not.toBeInTheDocument();
  });

  it("uses workspace language in the split layout", () => {
    render(
      <AuthPageShell {...sharedProps} eyebrow="Admin access">
        <button type="button">Sign in</button>
      </AuthPageShell>,
    );

    expect(screen.getByText("Secure workspace")).toBeInTheDocument();
    expect(screen.getByText("Workspace snapshot")).toBeInTheDocument();
    expect(screen.queryByText(/finance/i)).not.toBeInTheDocument();
  });
});
