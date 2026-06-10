import { render, screen, waitFor } from "@testing-library/react";
import { z } from "zod";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DocumentGenerator from "./generator.page";
import { loadDocumentGenerator } from "./generators";

vi.mock("@/components/AuthProvider", () => ({
  useAuth: () => ({ user: null }),
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
});
