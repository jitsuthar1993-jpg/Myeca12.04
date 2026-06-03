import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
  it("renders the homepage brand lockup, header, and footer identity text without default paragraph margins", () => {
    renderWithQueryClient(
      <Layout>
        <div>Dashboard content</div>
      </Layout>,
    );

    const sidebarBrand = screen.getByRole("link", { name: /MyeCA\.in SMART TAX SOLUTIONS/i });

    expect(sidebarBrand).toHaveAttribute("href", "/dashboard");
    expect(screen.getByText("MyeCA.in")).toBeVisible();
    expect(screen.getByText("SMART TAX SOLUTIONS")).toHaveClass("whitespace-nowrap");
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

  it("renders the user mobile app navigation with the planned primary destinations", () => {
    renderWithQueryClient(
      <Layout>
        <div>Dashboard content</div>
      </Layout>,
    );

    const mobileNav = screen.getByLabelText("Mobile primary navigation");

    expect(mobileNav).toHaveClass("md:hidden");
    expect(screen.getByTestId("workspace-main-shell")).toHaveClass("pb-[calc(5.5rem+env(safe-area-inset-bottom))]");
    expect(screen.getByTestId("mobile-nav-more")).toHaveTextContent("More");
    expect(
      Array.from(mobileNav.querySelectorAll("a,button")).map((item) => item.textContent?.trim()),
    ).toEqual(["Home", "MY ITR", "Services", "Docs", "More"]);
  });

  it("keeps secondary user destinations inside the mobile More menu", async () => {
    renderWithQueryClient(
      <Layout>
        <div>Dashboard content</div>
      </Layout>,
    );

    await userEvent.click(screen.getByTestId("mobile-nav-more"));

    const moreMenu = screen.getByRole("dialog", { name: "More workspace options" });

    for (const label of ["Search workspace", "Payments", "Account", "Help", "Support Request", "Sign Out"]) {
      expect(moreMenu).toHaveTextContent(label);
    }
  });
});
