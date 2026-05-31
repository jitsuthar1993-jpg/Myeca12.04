import { expect, test, type Page } from "@playwright/test";

type RoleName = "user" | "admin" | "ca" | "team";

const liveBaseUrl = (process.env.MYECA_LIVE_BASE_URL || "https://myeca.in").replace(/\/+$/, "");
const roleTargets: Array<{ role: RoleName; emailEnv: string; passwordEnv: string; path: string }> = [
  { role: "user", emailEnv: "MYECA_LIVE_USER_EMAIL", passwordEnv: "MYECA_LIVE_USER_PASSWORD", path: "/documents" },
  { role: "admin", emailEnv: "MYECA_LIVE_ADMIN_EMAIL", passwordEnv: "MYECA_LIVE_ADMIN_PASSWORD", path: "/admin/dashboard" },
  { role: "ca", emailEnv: "MYECA_LIVE_CA_EMAIL", passwordEnv: "MYECA_LIVE_CA_PASSWORD", path: "/ca/dashboard" },
  { role: "team", emailEnv: "MYECA_LIVE_TEAM_EMAIL", passwordEnv: "MYECA_LIVE_TEAM_PASSWORD", path: "/team/dashboard" },
];

const hasLiveCredentials = roleTargets.every((target) => process.env[target.emailEnv] && process.env[target.passwordEnv]);

async function signInLiveRole(page: Page, target: (typeof roleTargets)[number]) {
  await page.goto(`${liveBaseUrl}/auth/login`, { waitUntil: "domcontentloaded" });
  await page.getByLabel(/email/i).fill(process.env[target.emailEnv]!);
  await page.getByLabel(/password/i).fill(process.env[target.passwordEnv]!);
  await page.getByRole("button", { name: /sign in|login/i }).click();

  await expect
    .poll(
      () => page.evaluate(() => window.sessionStorage.getItem("myeca:supabase-access-token") || ""),
      {
        message: `${target.role} login should expose an authenticated API token`,
        timeout: 20_000,
      },
    )
    .not.toBe("");
}

async function verifyThrowawayDocumentLifecycle(page: Page) {
  const result = await page.evaluate(async () => {
    const token = window.sessionStorage.getItem("myeca:supabase-access-token");
    if (!token) return { authTokenPresent: false };

    const headers = { Authorization: `Bearer ${token}` };
    const documentName = `MyeCA live smoke ${Date.now()}`;
    const fileName = `${documentName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
    const pdfBody = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\ntrailer\n<<>>\n%%EOF\n";
    let documentId: string | null = null;
    let deleteStatus: number | null = null;

    const readJson = async (response: Response) => response.json().catch(() => ({}));

    try {
      const form = new FormData();
      form.append("file", new File([pdfBody], fileName, { type: "application/pdf" }));
      form.append("name", documentName);
      form.append("category", "live_smoke");
      form.append("description", "Synthetic throwaway file created by live smoke verification.");

      const uploadResponse = await fetch("/api/documents/upload", {
        method: "POST",
        headers,
        body: form,
      });
      const uploadJson = await readJson(uploadResponse);
      documentId = uploadJson?.document?.id ?? null;

      const beforeDeleteResponse = await fetch(`/api/documents?search=${encodeURIComponent(documentName)}`, { headers });
      const beforeDeleteJson = await readJson(beforeDeleteResponse);
      const listedBeforeDelete = Boolean(
        documentId &&
        Array.isArray(beforeDeleteJson?.documents) &&
        beforeDeleteJson.documents.some((document: { id?: string }) => document.id === documentId),
      );

      const downloadResponse = documentId
        ? await fetch(`/api/documents/${documentId}/download`, { headers })
        : null;
      const downloadBytes = downloadResponse?.ok ? (await downloadResponse.arrayBuffer()).byteLength : 0;

      const deleteResponse = documentId
        ? await fetch(`/api/documents/${documentId}`, { method: "DELETE", headers })
        : null;
      deleteStatus = deleteResponse?.status ?? null;

      const afterDeleteResponse = await fetch(`/api/documents?search=${encodeURIComponent(documentName)}`, { headers });
      const afterDeleteJson = await readJson(afterDeleteResponse);
      const listedAfterDelete = Boolean(
        documentId &&
        Array.isArray(afterDeleteJson?.documents) &&
        afterDeleteJson.documents.some((document: { id?: string }) => document.id === documentId),
      );

      return {
        authTokenPresent: true,
        documentId,
        fileName,
        uploadStatus: uploadResponse.status,
        listBeforeDeleteStatus: beforeDeleteResponse.status,
        listedBeforeDelete,
        downloadStatus: downloadResponse?.status ?? null,
        downloadBytes,
        deleteStatus,
        listAfterDeleteStatus: afterDeleteResponse.status,
        listedAfterDelete,
      };
    } finally {
      if (documentId && deleteStatus !== 200) {
        await fetch(`/api/documents/${documentId}`, { method: "DELETE", headers }).catch(() => null);
      }
    }
  });

  expect(result.authTokenPresent).toBe(true);
  expect(result.uploadStatus).toBe(200);
  expect(result.documentId).toBeTruthy();
  expect(result.listBeforeDeleteStatus).toBe(200);
  expect(result.listedBeforeDelete).toBe(true);
  expect(result.downloadStatus).toBe(200);
  expect(result.downloadBytes).toBeGreaterThan(20);
  expect(result.deleteStatus).toBe(200);
  expect(result.listAfterDeleteStatus).toBe(200);
  expect(result.listedAfterDelete).toBe(false);
}

test.describe("live role smoke", () => {
  test.skip(!hasLiveCredentials, "Live role credentials are required for authenticated production smoke checks.");

  for (const target of roleTargets) {
    test(`${target.role} can sign in and open its live workspace`, async ({ page }) => {
      await signInLiveRole(page, target);

      await page.goto(`${liveBaseUrl}${target.path}`, { waitUntil: "domcontentloaded" });
      await expect(page.locator("body")).not.toContainText(/JavaScript Error|Something went wrong/i);
      await expect(page.locator("body")).not.toContainText(/Page Not Found/i);
    });
  }

  test("user can upload, list, download, and delete a throwaway live document", async ({ page }) => {
    const userTarget = roleTargets.find((target) => target.role === "user")!;
    await signInLiveRole(page, userTarget);
    await page.goto(`${liveBaseUrl}/documents`, { waitUntil: "domcontentloaded" });
    await verifyThrowawayDocumentLifecycle(page);
  });
});
