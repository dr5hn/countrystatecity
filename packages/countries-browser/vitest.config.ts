import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/**', 'scripts/**', 'dist/**', 'node_modules/**'],
    },
  },
});
