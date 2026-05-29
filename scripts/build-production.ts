import { spawnSync } from "node:child_process";
import path from "node:path";

const rootDir = process.cwd();
const env = { ...process.env, NODE_ENV: "production" };

function run(binName: string, args: string[]) {
  const binExt = process.platform === "win32" ? ".cmd" : "";
  const executable = path.join(rootDir, "node_modules", ".bin", `${binName}${binExt}`);

  const result =
    process.platform === "win32"
      ? spawnSync(`"${executable}" ${args.join(" ")}`, {
          cwd: rootDir,
          env,
          shell: true,
          stdio: "inherit",
        })
      : spawnSync(executable, args, {
          cwd: rootDir,
          env,
          stdio: "inherit",
        });

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("vite", ["build"]);
run("tsx", ["scripts/generate-seo-assets.ts"]);
run("tsx", ["scripts/audit-seo-metadata.ts"]);
run("tsx", ["scripts/validate-static-seo.ts"]);
