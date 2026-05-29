import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PwaInstallBanner } from "./PwaInstallBanner";
import { hasDeferredInstallPrompt, isStandalone, promptInstall } from "@/utils/registerSW";

vi.mock("@/utils/registerSW", () => ({
  hasDeferredInstallPrompt: vi.fn(() => false),
  isStandalone: vi.fn(() => false),
  promptInstall: vi.fn(),
}));

const hasDeferredInstallPromptMock = vi.mocked(hasDeferredInstallPrompt);
const promptInstallMock = vi.mocked(promptInstall);
const isStandaloneMock = vi.mocked(isStandalone);

describe("PwaInstallBanner", () => {
  beforeEach(() => {
    localStorage.clear();
    hasDeferredInstallPromptMock.mockReset();
    hasDeferredInstallPromptMock.mockReturnValue(false);
    promptInstallMock.mockReset();
    promptInstallMock.mockResolvedValue(false);
    isStandaloneMock.mockReset();
    isStandaloneMock.mockReturnValue(false);
    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: true,
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("stays hidden until the browser install prompt is available", () => {
    render(<PwaInstallBanner currentPath="/" />);

    expect(screen.queryByRole("button", { name: /install myeCA/i })).not.toBeInTheDocument();
  });

  it("shows a subtle install banner when install becomes available", async () => {
    render(<PwaInstallBanner currentPath="/" />);

    window.dispatchEvent(new CustomEvent("pwainstallready"));

    expect(await screen.findByRole("button", { name: /install myeCA/i })).toBeVisible();
    expect(screen.getByText(/Add MyeCA to your home screen/i)).toBeVisible();
  });

  it("shows immediately if the deferred install prompt already exists", () => {
    hasDeferredInstallPromptMock.mockReturnValue(true);

    render(<PwaInstallBanner currentPath="/" />);

    expect(screen.getByRole("button", { name: /install myeCA/i })).toBeVisible();
  });

  it("launches the install prompt from the banner action", async () => {
    promptInstallMock.mockResolvedValue(true);
    render(<PwaInstallBanner currentPath="/" />);

    window.dispatchEvent(new CustomEvent("pwainstallready"));
    fireEvent.click(await screen.findByRole("button", { name: /install myeCA/i }));

    await waitFor(() => expect(promptInstallMock).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("button", { name: /install myeCA/i })).not.toBeInTheDocument();
  });

  it("persists dismissals for the current browser", async () => {
    const { rerender } = render(<PwaInstallBanner currentPath="/" />);

    window.dispatchEvent(new CustomEvent("pwainstallready"));
    fireEvent.click(await screen.findByRole("button", { name: /dismiss install prompt/i }));

    expect(localStorage.getItem("myeca:pwa-install-dismissed")).toBe("true");
    rerender(<PwaInstallBanner currentPath="/" />);
    window.dispatchEvent(new CustomEvent("pwainstallready"));

    expect(screen.queryByRole("button", { name: /install myeCA/i })).not.toBeInTheDocument();
  });

  it("does not show on private workspace routes", () => {
    render(<PwaInstallBanner currentPath="/dashboard/services" />);

    window.dispatchEvent(new CustomEvent("pwainstallready"));

    expect(screen.queryByRole("button", { name: /install myeCA/i })).not.toBeInTheDocument();
  });

  it("does not show when already running as an installed app", () => {
    isStandaloneMock.mockReturnValue(true);

    render(<PwaInstallBanner currentPath="/" />);
    window.dispatchEvent(new CustomEvent("pwainstallready"));

    expect(screen.queryByRole("button", { name: /install myeCA/i })).not.toBeInTheDocument();
  });

  it("hides after the app is installed", async () => {
    render(<PwaInstallBanner currentPath="/" />);

    window.dispatchEvent(new CustomEvent("pwainstallready"));
    expect(await screen.findByRole("button", { name: /install myeCA/i })).toBeVisible();

    window.dispatchEvent(new CustomEvent("pwainstalled"));

    await waitFor(() => {
      expect(screen.queryByRole("button", { name: /install myeCA/i })).not.toBeInTheDocument();
    });
  });
});
