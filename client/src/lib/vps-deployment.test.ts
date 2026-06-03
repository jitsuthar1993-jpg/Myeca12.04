import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (relativePath: string) => readFileSync(path.join(root, relativePath), "utf8");

describe("VPS deployment artifacts", () => {
  it("provides a production Docker image path for the MyeCA app", () => {
    const dockerfile = read("Dockerfile");
    const dockerignore = read(".dockerignore");
    const gitignore = read(".gitignore");

    expect(dockerfile).toContain("node:22.16.0");
    expect(dockerfile).toContain("npm ci");
    expect(dockerfile).toContain("HOST=0.0.0.0");
    expect(dockerfile).toContain("server/index.ts");
    expect(dockerignore).toContain(".env");
    expect(dockerignore).toContain("node_modules");
    expect(gitignore).not.toMatch(/^package-lock\.json$/m);
    expect(existsSync(path.join(root, "package-lock.json"))).toBe(true);
  });

  it("keeps edge and tools VPS compose files modular and pinned", () => {
    const composeFiles = [
      "ops/vps/edge/compose.yml",
      "ops/vps/tools/traefik/compose.yml",
      "ops/vps/tools/umami/compose.yml",
      "ops/vps/tools/listmonk/compose.yml",
      "ops/vps/tools/chatwoot/compose.yml",
      "ops/vps/tools/n8n/compose.yml",
      "ops/vps/tools/docuseal/compose.yml",
      "ops/vps/tools/twenty/compose.yml",
    ];

    for (const file of composeFiles) {
      const source = read(file);
      expect(source, file).toContain("web");
      expect(source, file).not.toMatch(/image:\s*["']?[^#\n]+:latest\b/);
    }

    expect(read("ops/vps/edge/compose.yml")).toContain("edge-staging.myeca.in");
    expect(read("ops/vps/tools/n8n/compose.yml")).toContain("WEBHOOK_URL=https://auto.myeca.in/");
  });

  it("documents deployment, backup, and cutover scripts without storing secrets", () => {
    for (const file of [
      "ops/vps/README.md",
      "ops/vps/edge/.env.example",
      "ops/vps/tools/.env.example",
      "ops/vps/scripts/preflight.sh",
      "ops/vps/scripts/backup.sh",
      "ops/vps/scripts/deploy-edge.sh",
      "ops/vps/scripts/deploy-tools.sh",
    ]) {
      expect(existsSync(path.join(root, file)), file).toBe(true);
    }

    const readme = read("ops/vps/README.md");
    expect(readme).toContain("staged-hybrid");
    expect(readme).toContain("Cloudflare");
    expect(readme).toContain("72 hours");
    expect(readme).toContain("Supabase Auth/Postgres and Vercel Blob remain managed");
  });
});
