import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['apps/*/tests/unit/**/*.test.ts', 'packages/*/tests/unit/**/*.test.ts'],
        },
      },
      {
        test: {
          name: 'functional',
          include: ['apps/*/tests/functional/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['apps/*/src/**', 'packages/*/src/**'],
      exclude: ['**/node_modules/**', '**/dist/**', '**/*.d.ts', '**/tests/**'],
    },
  },
});
