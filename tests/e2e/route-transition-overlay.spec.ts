import { expect, test, type Page } from "@playwright/test";

async function gateRouteChunksAfterInitialLoad(page: Page) {
  let shouldBlockRouteChunk = false;
  let hasBlockedRouteChunk = false;
  let releaseRouteChunk: (() => void) | undefined;
  const routeChunkReleased = new Promise<void>((resolve) => {
    releaseRouteChunk = resolve;
  });
  let resolveBlockedRouteChunk: ((url: string) => void) | undefined;
  const blockedRouteChunk = new Promise<string>((resolve) => {
    resolveBlockedRouteChunk = resolve;
  });

  await page.route(/\/assets\/.*\.js(?:\?.*)?$/, async (route) => {
    if (shouldBlockRouteChunk && !hasBlockedRouteChunk) {
      hasBlockedRouteChunk = true;
      resolveBlockedRouteChunk?.(route.request().url());
      await routeChunkReleased;
    }

    await route.continue();
  });

  return {
    arm() {
      shouldBlockRouteChunk = true;
    },
    release() {
      releaseRouteChunk?.();
    },
    waitForBlockedChunk() {
      return blockedRouteChunk;
    },
  };
}

test("keeps the current page visible under the route progress overlay during cold navigation", async ({
  page,
}, testInfo) => {
  const target =
    testInfo.project.name === "mobile"
      ? { href: "/trust", heading: /Trust, security/i }
      : { href: "/pricing", heading: /Pricing|Plans/i };
  const routeChunkGate = await gateRouteChunksAfterInitialLoad(page);

  await page.goto("/", { waitUntil: "domcontentloaded" });
  const homeHeading = page.getByRole("heading", { name: /File your/i }).first();
  await expect(homeHeading).toBeVisible();

  routeChunkGate.arm();
  await page.locator(`a[href="${target.href}"]`).first().evaluate((link) => {
    (link as HTMLAnchorElement).click();
  });

  await routeChunkGate.waitForBlockedChunk();
  await expect(page.getByTestId("route-progress-overlay")).toBeVisible();
  await expect(homeHeading).toBeVisible();
  await expect(page.getByTestId("page-skeleton")).toHaveCount(0);

  routeChunkGate.release();
  await expect(page).toHaveURL(new RegExp(`${target.href}$`));
  await expect(page.getByRole("heading", { name: target.heading }).first()).toBeVisible();
  await expect(page.getByTestId("route-progress-overlay")).toHaveCount(0);
});
