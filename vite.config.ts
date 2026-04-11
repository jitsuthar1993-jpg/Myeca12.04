import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
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
    // Keep debuggability in dev; strip console calls and debugger in production builds
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
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
        manualChunks: {
          vendor: ["react", "react-dom", "wouter", "@tanstack/react-query"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
          ui: [
            "@radix-ui/react-tooltip",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-navigation-menu",
            "@radix-ui/react-dialog",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
          ],
          charts: ["recharts"],
          firebase: ["firebase/app", "firebase/auth", "firebase/firestore"],
          forms: ["react-hook-form", "@hookform/resolvers", "zod"],
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
