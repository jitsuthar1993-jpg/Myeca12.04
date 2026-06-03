import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import LogoutPage from "./logout.page";

const logoutMock = vi.fn();
const setLocationMock = vi.fn();

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    logout: logoutMock,
  }),
}));

vi.mock("wouter", () => ({
  useLocation: () => ["/logout", setLocationMock],
}));

describe("LogoutPage", () => {
  it("sends the user to the homepage after sign-out completes", async () => {
    logoutMock.mockResolvedValueOnce(undefined);

    await act(async () => {
      render(<LogoutPage />);
    });

    expect(screen.getByText("Signing you out")).toBeInTheDocument();

    await waitFor(() => expect(logoutMock).toHaveBeenCalledWith("manual"));
    expect(setLocationMock).toHaveBeenCalledWith("/");
    expect(screen.getByText("You will be redirected to the homepage in a moment.")).toBeInTheDocument();
  });
});
