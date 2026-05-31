// @vitest-environment jsdom
import "@/test/setup";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StartupRegistrationPage from "./registration.page";

vi.mock("@/utils/analytics", () => ({
  trackEvent: vi.fn(),
}));

describe("StartupRegistrationPage guided wizard", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("restores a draft and guides sole proprietorship users through details, documents, review, and completion", async () => {
    sessionStorage.setItem(
      "startup_registration_sole",
      JSON.stringify({ businessName: "Sharma Traders" }),
    );

    const user = userEvent.setup();
    render(<StartupRegistrationPage />);

    expect(
      screen.getByRole("heading", { name: "Startup Registration Desk" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Business Details" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Submit registration" })).not.toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByLabelText("Business Name")).toHaveValue("Sharma Traders");
    });

    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Owner Full Name is required")).toBeInTheDocument();
    expect(screen.queryByText("Business Address is required")).not.toBeInTheDocument();

    await user.type(screen.getByLabelText("Owner Full Name"), "Ravi Sharma");
    await user.type(screen.getByLabelText("PAN"), "ABCDE1234");
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Invalid PAN")).toBeInTheDocument();

    await user.clear(screen.getByLabelText("PAN"));
    await user.type(screen.getByLabelText("PAN"), "ABCDE1234F");
    await waitFor(() => {
      expect(JSON.parse(sessionStorage.getItem("startup_registration_sole") || "{}")).toMatchObject({
        businessName: "Sharma Traders",
        ownerName: "Ravi Sharma",
        pan: "ABCDE1234F",
      });
    });
    await user.click(screen.getByRole("button", { name: "Next step" }));

    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Documents Upload" })).toBeInTheDocument();
    expect(screen.getByText("Business PAN card")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous step" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous step" }));
    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Business Name")).toHaveValue("Sharma Traders");
    await user.click(screen.getByRole("button", { name: "Next step" }));
    expect(screen.getByText("Step 2 of 3")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Business Address"), "21 Market Road, Pune");
    await user.click(screen.getByRole("button", { name: "Next step" }));

    expect(screen.getByText("Step 3 of 3")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Review & Submit" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next step" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit registration" }));

    expect(screen.getByRole("heading", { name: "Registration Completed" })).toBeInTheDocument();
    expect(screen.getByText("Sole Proprietorship")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(/\d+m \d+s/);

    await user.click(screen.getByRole("button", { name: "Edit registration" }));
    expect(screen.getByRole("heading", { name: "Review & Submit" })).toBeInTheDocument();
    expect(screen.getByText("21 Market Road, Pune")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Submit registration" }));
    await user.click(screen.getByRole("button", { name: "Start over" }));

    expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    expect(screen.getByLabelText("Business Name")).toHaveValue("");
    await waitFor(() => {
      expect(sessionStorage.getItem("startup_registration_sole")).toBe("{}");
    });
  }, 10_000);

  it("switches entity flows without carrying the active step forward", async () => {
    const user = userEvent.setup();
    render(<StartupRegistrationPage />);

    await user.click(screen.getByRole("tab", { name: "Company" }));

    expect(screen.getByText("Step 1 of 4")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Promoters & Directors" })).toBeInTheDocument();
    expect(screen.getByLabelText("Proposed Company Name")).toBeInTheDocument();
    expect(screen.getByText("30 minutes")).toBeInTheDocument();
  });
});
