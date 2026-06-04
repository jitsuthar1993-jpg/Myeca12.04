import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import ServicesManagementPage from "./services.page";

const sampleServices = [
  {
    id: 1,
    name: "GST Registration",
    description: "Complete GST registration assistance",
    category: "tax-filing",
    price: 4999,
    isPopular: true,
    isActive: true,
    features: "Document review",
    estimatedDuration: "3 days",
    requirements: "PAN",
    bookingsCount: 4,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({
    user: {
      id: "admin-1",
      email: "admin@example.com",
      firstName: "Admin",
      role: "admin",
    },
    isLoading: false,
  }),
}));

vi.mock("@/components/admin/Layout", () => ({
  Layout: ({ children, title }: { children: ReactNode; title?: string }) => (
    <div data-testid="dashboard-layout" data-title={title}>
      {children}
    </div>
  ),
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/lib/queryClient", () => ({
  apiRequest: vi.fn(async () => new Response(JSON.stringify({ success: true }))),
}));

function renderWithQueryClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        queryFn: async () => sampleServices,
      },
      mutations: { retry: false },
    },
  });

  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe("ServicesManagementPage", () => {
  it("renders inside the shared dashboard shell with compact controls", async () => {
    renderWithQueryClient(<ServicesManagementPage />);

    expect(await screen.findByTestId("dashboard-layout")).toHaveAttribute("data-title", "Services");
    expect(await screen.findByRole("heading", { name: "Services Management" })).toBeInTheDocument();
    expect(screen.getByText("Total Services")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Search services by name or description...")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add Service/i })).toHaveClass("rounded-lg");
    expect(screen.getByText("GST Registration")).toBeInTheDocument();
  });

  it("keeps the add service dialog workflow available", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<ServicesManagementPage />);

    await user.click(await screen.findByRole("button", { name: /Add Service/i }));

    expect(screen.getByRole("dialog")).toHaveTextContent("Add New Service");
    expect(screen.getByLabelText("Service Name")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create Service" })).toBeInTheDocument();
  });
});
