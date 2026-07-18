import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DocumentGenerator from "./generator.page";
import { loadDocumentGenerator } from "./generators";

const mockAuthState = vi.hoisted(() => ({
  user: null as null | { id: string; email: string },
}));

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ user: mockAuthState.user }),
}));

vi.mock("@/components/seo/MetaSEO", () => ({
  default: () => null,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("./generators", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./generators")>();

  return {
    ...actual,
    loadDocumentGenerator: vi.fn(),
  };
});

describe("document generator page", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/documents/generator/will");
    vi.mocked(loadDocumentGenerator).mockReset();
    mockAuthState.user = null;
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("installs generator defaults before exposing the interactive editor", async () => {
    vi.mocked(loadDocumentGenerator).mockResolvedValue({
      id: "will",
      title: "Simple WILL",
      description: "Test generator",
      icon: null,
      schema: z.object({ executionDate: z.string() }),
      defaultValues: { executionDate: "2026-06-10" },
      generateHTML: (data: Record<string, unknown>) => `<p>${data.executionDate}</p>`,
      generateMarkdown: () => "",
      FormComponent: ({ register, watch }: any) => {
        if (!watch("executionDate")) {
          throw new Error("Generator form rendered before defaults were installed");
        }

        return <input aria-label="Execution date" {...register("executionDate")} />;
      },
    });

    render(<DocumentGenerator />);

    expect(screen.getByText("Loading document generator...")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByTestId("focused-document-editor")).toBeInTheDocument());
    expect(screen.getByLabelText("Execution date")).toHaveValue("2026-06-10");
  });

  it("shows a compact header title without the generator description", async () => {
    vi.mocked(loadDocumentGenerator).mockResolvedValue({
      id: "will",
      title: "Simple WILL",
      description: "Header explainer that should not render in the toolbar",
      icon: null,
      schema: z.object({ executionDate: z.string() }),
      defaultValues: { executionDate: "2026-06-10" },
      generateHTML: (data: Record<string, unknown>) => `<p>${data.executionDate}</p>`,
      generateMarkdown: () => "",
      FormComponent: ({ register }: any) => <input aria-label="Execution date" {...register("executionDate")} />,
    });

    render(<DocumentGenerator />);
    await waitFor(() => expect(screen.getByTestId("focused-document-editor")).toBeInTheDocument());

    expect(screen.getByRole("heading", { name: "Simple WILL" })).toBeInTheDocument();
    expect(screen.queryByText("Header explainer that should not render in the toolbar")).not.toBeInTheDocument();
  });

  it("replaces the format selector and separate export button with one PDF/Word export menu", async () => {
    vi.mocked(loadDocumentGenerator).mockResolvedValue({
      id: "will",
      title: "Simple WILL",
      description: "Test generator",
      icon: null,
      schema: z.object({ executionDate: z.string() }),
      defaultValues: { executionDate: "2026-06-10" },
      exportFormats: ["pdf", "html"],
      generateHTML: (data: Record<string, unknown>) => `<p>${data.executionDate}</p>`,
      generateMarkdown: () => "",
      FormComponent: ({ register }: any) => <input aria-label="Execution date" {...register("executionDate")} />,
    });

    render(<DocumentGenerator />);
    await waitFor(() => expect(screen.getByTestId("focused-document-editor")).toBeInTheDocument());

    expect(screen.queryByText("PDF Document")).not.toBeInTheDocument();
    expect(screen.queryByText("Raw HTML")).not.toBeInTheDocument();
    expect(screen.queryByText("Markdown")).not.toBeInTheDocument();

    const exportMenu = screen.getByRole("button", { name: /Sign in to Export/i });
    fireEvent.pointerDown(exportMenu, { button: 0, ctrlKey: false });

    expect(await screen.findByText("Export as PDF")).toBeInTheDocument();
    expect(screen.getByText("Export as Word")).toBeInTheDocument();
    expect(screen.queryByText("Export as HTML")).not.toBeInTheDocument();
    expect(screen.queryByText("Export as Markdown")).not.toBeInTheDocument();
  });

  it("preserves a guest draft and requires login before exporting from the merged menu", async () => {
    vi.mocked(loadDocumentGenerator).mockResolvedValue({
      id: "will",
      title: "Simple WILL",
      description: "Test generator",
      icon: null,
      schema: z.object({ executionDate: z.string() }),
      defaultValues: { executionDate: "2026-06-10" },
      exportFormats: ["pdf", "html"],
      generateHTML: (data: Record<string, unknown>) => `<p>${data.executionDate}</p>`,
      generateMarkdown: () => "",
      FormComponent: ({ register }: any) => <input aria-label="Execution date" {...register("executionDate")} />,
    });

    render(<DocumentGenerator />);
    await waitFor(() => expect(screen.getByTestId("focused-document-editor")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Execution date"), { target: { value: "2026-07-01" } });
    fireEvent.pointerDown(screen.getByRole("button", { name: /Sign in to Export/i }), { button: 0, ctrlKey: false });
    fireEvent.click(await screen.findByText("Export as Word"));

    expect(JSON.parse(window.sessionStorage.getItem("myeca_generator_pending_will") || "{}")).toMatchObject({
      executionDate: "2026-07-01",
    });
    expect(window.location.pathname).toBe("/auth/login");
    expect(window.location.search).toContain("next=");
  });

  it("sends a guest to login before validating required save fields", async () => {
    vi.mocked(loadDocumentGenerator).mockResolvedValue({
      id: "will",
      title: "Simple WILL",
      description: "Test generator",
      icon: null,
      schema: z.object({ executionDate: z.string().min(1) }),
      defaultValues: { executionDate: "" },
      generateHTML: (data: Record<string, unknown>) => `<p>${data.executionDate}</p>`,
      generateMarkdown: () => "",
      FormComponent: ({ register }: any) => <input aria-label="Execution date" {...register("executionDate")} />,
    });

    render(<DocumentGenerator />);
    await waitFor(() => expect(screen.getByTestId("focused-document-editor")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: "Sign in to Save" }));

    expect(JSON.parse(window.sessionStorage.getItem("myeca_generator_pending_will") || "{}"))
      .toMatchObject({ executionDate: "" });
    expect(window.location.pathname).toBe("/auth/login");
    expect(window.location.search).toContain("next=");
  });

  it("saves signed-in generator drafts into the document vault", async () => {
    mockAuthState.user = { id: "user_1", email: "user@example.com" };
    const fetchMock = vi.spyOn(window, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ success: true, document: { id: "doc_generated" } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.mocked(loadDocumentGenerator).mockResolvedValue({
      id: "will",
      title: "Simple WILL",
      description: "Test generator",
      icon: null,
      schema: z.object({ executionDate: z.string() }),
      defaultValues: { executionDate: "2026-06-10" },
      generateHTML: (data: Record<string, unknown>) => `<p>${data.executionDate}</p>`,
      generateMarkdown: () => "",
      FormComponent: ({ register }: any) => <input aria-label="Execution date" {...register("executionDate")} />,
    });

    render(<DocumentGenerator />);
    await waitFor(() => expect(screen.getByTestId("focused-document-editor")).toBeInTheDocument());

    fireEvent.change(screen.getByLabelText("Execution date"), { target: { value: "2026-07-01" } });
    fireEvent.click(screen.getByRole("button", { name: /Save/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/documents/generated",
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"generatorType":"will"'),
        }),
      );
    });
    expect(fetchMock.mock.calls[0]?.[1]?.body as string).toContain("2026-07-01");
  });
});
