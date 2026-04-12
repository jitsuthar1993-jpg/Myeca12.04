import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  envPrefix: ["VITE_", "NEXT_PUBLIC_"],
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "client", "src"),
      "@shared": path.resolve(process.cwd(), "shared"),
      "@assets": path.resolve(process.cwd(), "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(process.cwd(), "client"),
  envDir: path.resolve(process.cwd()),
  esbuild: {
    // Strip debugger statements in production; keep console.error/warn for diagnostics
    drop: process.env.NODE_ENV === "production" ? ["debugger"] : [],
    pure: process.env.NODE_ENV === "production" ? ["console.log", "console.debug", "console.info", "console.trace"] : [],
  },
  build: {
    outDir: path.resolve(process.cwd(), "dist/public"),
    emptyOutDir: true,
    cssCodeSplit: true,
    sourcemap: false,
    reportCompressedSize: false, // Faster CI builds
    chunkSizeWarningLimit: 500, // Catch bloated chunks early
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — must be in one chunk to avoid circular deps
          if (id.includes("node_modules/react/") || id.includes("node_modules/react-dom/")) {
            return "vendor";
          }
          if (
            id.includes("node_modules/wouter") ||
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/@clerk/") ||
            id.includes("node_modules/use-sync-external-store")
          ) {
            return "vendor";
          }
          // UI framework — Radix lives alongside React in vendor to prevent circular refs
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor";
          }
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
          if (id.includes("node_modules/lucide-react")) {
            return "icons";
          }
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "charts";
          }
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
      "@radix-ui/react-tooltip",
      "react-helmet-async",
    ],
  },
});
