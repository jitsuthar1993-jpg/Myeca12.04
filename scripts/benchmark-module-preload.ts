import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { chromium, devices, type Browser } from "playwright";

const baseUrl = (process.env.MYECA_BENCHMARK_BASE_URL || "http://127.0.0.1:5000").replace(/\/+$/, "");
const label = process.env.MYECA_BENCHMARK_LABEL || "current";
const routes = ["/", "/services"] as const;
const sampleCount = 3;
const distPublic = path.join(process.cwd(), "dist", "public");

type Sample = {
  jsBytes: number;
  lcpMs: number;
  scriptCount: number;
};

function median(values: number[]) {
  return [...values].sort((left, right) => left - right)[Math.floor(values.length / 2)];
}

function entrySize() {
  const htmlPath = path.join(distPublic, "index.html");
  if (!existsSync(htmlPath)) {
    throw new Error("dist/public/index.html was not found. Build before running the benchmark.");
  }

  const html = readFileSync(htmlPath, "utf8");
  const entryPath = html.match(/<script type="module"[^>]+src="\/(assets\/index-[^"]+\.js)"/)?.[1];
  if (!entryPath) {
    throw new Error("The production entry script was not found in dist/public/index.html.");
  }

  return {
    bytes: statSync(path.join(distPublic, entryPath)).size,
    path: entryPath,
  };
}

async function collectSample(browser: Browser, route: string): Promise<Sample> {
  const context = await browser.newContext({
    ...devices["Pixel 5"],
    serviceWorkers: "block",
  });

  try {
    const page = await context.newPage();
    const client = await context.newCDPSession(page);
    const scriptResponses: Array<Promise<{ bytes: number }>> = [];

    await client.send("Network.emulateNetworkConditions", {
      downloadThroughput: 200_000,
      latency: 150,
      offline: false,
      uploadThroughput: 100_000,
    });
    await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    await page.route("**/*", (request) => request.continue());
    await page.addInitScript(() => {
      const metrics = { lcp: 0 };
      Object.defineProperty(window, "__MYECA_MODULE_PRELOAD_BENCHMARK", {
        configurable: true,
        value: metrics,
      });

      new PerformanceObserver((list) => {
        metrics.lcp = list.getEntries().at(-1)?.startTime ?? metrics.lcp;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    });
    page.on("response", (response) => {
      if (response.request().resourceType() !== "script") return;
      scriptResponses.push(response.body().then((body) => ({ bytes: body.byteLength })));
    });

    await page.goto(`${baseUrl}${route === "/" ? "" : route}`, {
      timeout: 45_000,
      waitUntil: "domcontentloaded",
    });
    await page.waitForFunction(() => document.body.innerText.trim().length >= 80);
    await page.waitForLoadState("networkidle", { timeout: 15_000 }).catch(() => undefined);
    await page.waitForTimeout(2_000);

    const lcpMs = await page.evaluate(() => {
      const metrics = (window as typeof window & {
        __MYECA_MODULE_PRELOAD_BENCHMARK?: { lcp: number };
      }).__MYECA_MODULE_PRELOAD_BENCHMARK;
      return metrics?.lcp ?? 0;
    });
    const scripts = await Promise.all(scriptResponses);

    return {
      jsBytes: scripts.reduce((total, script) => total + script.bytes, 0),
      lcpMs,
      scriptCount: scripts.length,
    };
  } finally {
    await context.close();
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results: Record<string, { samples: Sample[]; medianJsBytes: number; medianLcpMs: number }> = {};

  try {
    for (const route of routes) {
      const samples: Sample[] = [];
      for (let index = 0; index < sampleCount; index += 1) {
        samples.push(await collectSample(browser, route));
      }

      results[route] = {
        samples,
        medianJsBytes: median(samples.map((sample) => sample.jsBytes)),
        medianLcpMs: median(samples.map((sample) => sample.lcpMs)),
      };
    }
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify({ entry: entrySize(), label, results }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
