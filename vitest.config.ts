import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./client/src/test/setup.ts'],
    // Server/shared tests opt into the node environment via the
    // `// @vitest-environment node` pragma at the top of the file. The default below
    // stays jsdom because the bulk of the suite is React components.
    include: ['client/src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.{test,spec}.ts', 'shared/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'client/src/test/'],
    },
  },
  resolve: {
    alias: {
      'framer-motion': path.resolve(__dirname, './client/src/lib/framer-motion-lite.tsx'),
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
});
