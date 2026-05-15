import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist", "public");
const port = 8788;
const baseUrl = `http://127.0.0.1:${port}`;
const command = process.platform === "win32" ? "cmd.exe" : "npx";
const commandArgs =
  process.platform === "win32"
    ? ["/d", "/s", "/c", `npx.cmd --yes wrangler pages dev dist/public --port ${port}`]
    : ["--yes", "wrangler", "pages", "dev", "dist/public", "--port", String(port)];

function findBuiltCssAsset() {
  const assetsDir = path.join(distDir, "assets");
  const cssAsset = fs.readdirSync(assetsDir).find((file) => file.endsWith(".css"));
  if (!cssAsset) {
    throw new Error("No built CSS asset found in dist/public/assets.");
  }
  return `/assets/${cssAsset}`;
}

function assertProductionBundle() {
  const assetsDir = path.join(distDir, "assets");
  const javascriptAssets = fs.readdirSync(assetsDir).filter((file) => file.endsWith(".js"));
  const developmentMarkers = [
    { label: "React development JSX transform", pattern: /\bjsxDEV\b/ },
    { label: "Vite dev client", pattern: /@vite\/client/ },
  ];

  for (const file of javascriptAssets) {
    const contents = fs.readFileSync(path.join(assetsDir, file), "utf8");
    const marker = developmentMarkers.find(({ pattern }) => pattern.test(contents));
    if (marker) {
      throw new Error(
        `Cloudflare build produced a development bundle: ${marker.label} found in dist/public/assets/${file}.`,
      );
    }
  }
}

async function waitForReady(output: () => string, timeoutMs = 45_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const text = output();
    if (text.includes("Ready on")) return;
    if (text.toLowerCase().includes("error")) {
      throw new Error(`Wrangler reported an error before startup:\n${text}`);
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Wrangler Pages dev did not become ready within ${timeoutMs}ms.\n${output()}`);
}

async function fetchOk(pathName: string) {
  const response = await fetch(`${baseUrl}${pathName}`);
  if (!response.ok) {
    throw new Error(`Expected ${pathName} to return 2xx, got ${response.status}.`);
  }
}

async function stopProcessTree(child: ReturnType<typeof spawn>) {
  if (!child.pid || child.exitCode !== null) return;

  if (process.platform === "win32") {
    await new Promise<void>((resolve) => {
      const killer = spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], { stdio: "ignore" });
      killer.on("close", () => resolve());
      killer.on("error", () => resolve());
    });
    return;
  }

  child.kill("SIGTERM");
  if (child.pid) {
    try {
      process.kill(-child.pid, "SIGTERM");
    } catch {
      // Process groups are only available when the child starts detached.
    }
  }
  await new Promise<void>((resolve) => {
    const timeout = setTimeout(() => {
      child.kill("SIGKILL");
      if (child.pid) {
        try {
          process.kill(-child.pid, "SIGKILL");
        } catch {
          // The process may already be gone.
        }
      }
      resolve();
    }, 2_000);
    child.on("close", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    throw new Error("dist/public/index.html is missing. Run npm run build first.");
  }

  const cssAssetPath = findBuiltCssAsset();
  assertProductionBundle();
  let output = "";
  const child = spawn(command, commandArgs, {
    cwd: rootDir,
    env: { ...process.env, CI: "1" },
    detached: process.platform !== "win32",
    stdio: ["ignore", "pipe", "pipe"],
  });

  child.stdout.on("data", (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on("data", (chunk) => {
    output += chunk.toString();
  });

  try {
    await waitForReady(() => output);
    if (/invalid redirect rule/i.test(output)) {
      throw new Error(`Wrangler reported an invalid redirect rule:\n${output}`);
    }
    await fetchOk("/dashboard/services/cloudflare-smoke");
    await fetchOk(cssAssetPath);
  } finally {
    await stopProcessTree(child);
  }

  console.log("Cloudflare Pages local validation passed.");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
