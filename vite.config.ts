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
      "@assets": path.resolve(process.cwd(), "client", "public", "assets"),
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
          // Routing + query — small, needed on every page
          if (
            id.includes("node_modules/wouter") ||
            id.includes("node_modules/@tanstack/react-query") ||
            id.includes("node_modules/use-sync-external-store")
          ) {
            return "vendor";
          }
          // Radix UI — needed for buttons/tooltips on first paint
          if (id.includes("node_modules/@radix-ui/")) {
            return "vendor";
          }
          // Clerk auth — heavy (~200KB), lazy-load separately
          if (id.includes("node_modules/@clerk/")) {
            return "clerk";
          }
          // Framer-motion — only needed after first paint
          if (id.includes("node_modules/framer-motion")) {
            return "motion";
          }
          // Charts — only needed on calculator/analytics pages, NOT homepage
          // Let Vite tree-shake per-route instead of one fat chunk
          if (id.includes("node_modules/recharts") || id.includes("node_modules/d3-")) {
            return "charts";
          }
          // Forms — only needed on form-heavy pages
          if (id.includes("node_modules/react-hook-form") || id.includes("node_modules/@hookform/") || id.includes("node_modules/zod")) {
            return "forms";
          }
          // Icons — let Vite tree-shake per-route; don't bundle all icons together
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
