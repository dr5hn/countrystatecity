import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.ts'],
    exclude: ['tests/browser/**/*'],
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/**', 'scripts/**', 'dist/**', 'node_modules/**'],
    },
  },
});
