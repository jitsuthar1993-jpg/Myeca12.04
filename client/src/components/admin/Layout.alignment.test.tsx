import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import type { HTMLAttributes, ReactElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { Layout } from "@/components/admin/Layout";
import NotificationCenter from "@/components/notifications/NotificationCenter";

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: {
      id: "user-1",
      email: "jitendra@example.com",
      firstName: "Jitendra",
      lastName: "User",
      role: "user",
    },
    logout: vi.fn(),
  }),
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(async () => new Response(JSON.stringify([]))),
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: ReactElement }) => children,
  m: {
    div: ({ children, ...props }: HTMLAttributes<HTMLDivElement>) => (
      <div {...props}>{children}</div>
    ),
  },
}));

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("role-aware dashboard shell alignment", () => {
  it("renders the full brand lockup, header, and footer identity text without default paragraph margins", () => {
    renderWithQueryClient(
      <Layout>
        <div>Dashboard content</div>
      </Layout>,
    );

    const brandLink = screen.getByRole("link", { name: /MyeCA\.in SMART TAX SOLUTIONS/i });
    const brandSubtitle = within(brandLink).getByText("SMART TAX SOLUTIONS");

    expect(within(brandLink).getByText("MyeCA.in")).toBeInTheDocument();
    expect(brandSubtitle).toHaveClass("whitespace-nowrap", "!text-[0.58rem]", "tracking-[0.08em]");
    const headerTitle = screen
      .getAllByText("Workspace")
      .find((element) => element.className.includes("text-sm"));

    expect(headerTitle).toHaveClass("mb-0", "leading-none");
    expect(screen.getByText("Jitendra")).toHaveClass("mb-0", "leading-tight");

    for (const roleLabel of screen.getAllByText("User")) {
      expect(roleLabel).toHaveClass("mb-0", "leading-tight");
    }
  });

  it("uses a fixed square notification trigger in the dashboard header", () => {
    renderWithQueryClient(<NotificationCenter />);

    expect(screen.getByRole("button")).toHaveClass("h-9", "w-9", "rounded-lg", "p-0");
  });
});
