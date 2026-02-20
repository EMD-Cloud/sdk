import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/**/*.test.ts'],
    typecheck: {
      only: true,
      include: ['tests/types/**/*.test-d.ts'],
      tsconfig: './tsconfig.vitest-typecheck.json',
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, 'src'),
    },
  },
})
