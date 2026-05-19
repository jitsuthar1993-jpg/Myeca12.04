import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { sentryVitePlugin } from "@sentry/vite-plugin";

const shouldAnalyzeBundle = process.env.ANALYZE_BUNDLE === "1";
const shouldUploadSentrySourcemaps = Boolean(
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT,
);
process.env.VITE_GOOGLE_SITE_VERIFICATION ??= "";

export default defineConfig({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [
    react(),
    shouldAnalyzeBundle
      ? visualizer({
          filename: path.resolve(process.cwd(), "dist", "bundle-stats.html"),
          gzipSize: true,
          brotliSize: true,
          template: "treemap",
        })
      : null,
    shouldUploadSentrySourcemaps
      ? sentryVitePlugin({
          org: process.env.SENTRY_ORG,
          project: process.env.SENTRY_PROJECT,
          authToken: process.env.SENTRY_AUTH_TOKEN,
          telemetry: false,
          sourcemaps: {
            filesToDeleteAfterUpload: [path.resolve(process.cwd(), "dist", "public", "**", "*.map")],
          },
        })
      : null,
  ].filter(Boolean),
  resolve: {
    alias: {
      "framer-motion": path.resolve(process.cwd(), "client", "src", "lib", "framer-motion-lite.tsx"),
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "client", "public", "assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(process.cwd(), "client"),
  envDir: path.resolve(process.cwd()),
  esbuild: {
    // Strip browser-only diagnostics from production chunks; server logging is built separately.
    drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
    pure: process.env.NODE_ENV === "production"
      ? [
          "console.log",
          "console.debug",
          "console.info",
          "console.trace",
          "console.warn",
          "console.error",
          "console.group",
          "console.groupEnd",
        ]
      : [],
  },
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: true,
    target: ["chrome87", "edge88", "firefox78", "safari14.1"],
    cssCodeSplit: true,
    sourcemap: shouldUploadSentrySourcemaps ? true : false,
    reportCompressedSize: false, // Faster CI builds
    chunkSizeWarningLimit: 500, // Catch bloated chunks early
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core stays together to avoid circular dependency issues.
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "react-vendor";
          }
          if (id.includes("node_modules/scheduler/")) {
            return "react-vendor";
          }
          // Routing and query clients are needed globally, but do not need to inflate React core.
          if (
            id.includes("node_modules/wouter") ||
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/use-sync-external-store")
          ) {
            return "app-vendor";
          }
          // Radix UI stays route/component scoped so feature-heavy widgets do not inflate core vendor.
          // Supabase auth client stays separate from the first paint path.
          if (id.includes("node_modules/@supabase/")) {
            return "supabase";
          }
          // Charting libraries are route-only; keep each family below the per-file budget.
          if (id.includes("node_modules/d3-")) {
            return "d3";
          }
          if (id.includes("node_modules/lodash")) {
            return "lodash";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          // Forms are only needed on form-heavy pages.
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform/") || id.includes("node_modules/zod")) {
            return "forms";
          }
        },
      },
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "wouter",
      "@tanstack/react-query",
      "lucide-react",
      "react-helmet-async",
    ],
  },
});
